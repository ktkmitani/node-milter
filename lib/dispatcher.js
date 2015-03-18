var util = require('util');
var debuglog = util.debuglog('nodemilter');
var async = require('async');

var constants = require('./constants');
var SMFIS = constants.SMFIS;

var SMFI_VERSION = constants.SMFI_VERSION;
var SMFI_VERSION_MDS  = 0x01000002;

var MI_CONTINUE = 1;
var MI_SUCCESS = constants.MI_SUCCESS;
var MI_FAILURE = constants.MI_FAILURE;

var MILTER_LEN_BYTES = 4;

var MILTER_OPTLEN = (MILTER_LEN_BYTES * 3);
var MILTER_MDS_64K = ((64 * 1024) - 1);
var MILTER_MDS_256K = ((256 * 1024) - 1);
var MILTER_MDS_1M = ((1024 * 1024) - 1);

var SMFI_V1_ACTS = 0x0000000F;	// The actions of V1 filter
var SMFI_V2_ACTS = 0x0000003F;	// The actions of V2 filter
var SMFI_CURR_ACTS = 0x000001FF;	// actions of current version

var SMFI_V1_PROT = 0x0000003F;	// The protocol of V1 filter
var SMFI_V2_PROT = 0x0000007F;	// The protocol of V2 filter

// all defined protocol bits
var SMFI_CURR_PROT = 0x001FFFFF;

// internal flags: only used between MTA and libmilter
var SMFI_INTERNAL = 0x70000000;

/* address families */
var SMFIA_UNKNOWN = 'U';	// unknown
var SMFIA_UNIX = 'L';		// unix/local
var SMFIA_INET = '4';		// inet
var SMFIA_INET6 = '6';		// inet6

var SMFIC = module.exports.SMFIC  = {
	ABORT:		'A',	// Abort
	BODY:		'B',	// Body chunk
	CONNECT:	'C',	// Connection information
	MACRO:		'D',	// Define macro
	BODYEOB:	'E',	// final body chunk (End)
	HELO:		'H',	// HELO/EHLO
	QUIT_NC:	'K',	// QUIT but new connection follows
	HEADER:		'L',	// Header
	MAIL:		'M',	// MAIL from
	OPTNEG:		'O',	// Option negotiation
	EOH:		'N',	// EOH
	QUIT:		'Q',	// QUIT
	RCPT:		'R',	// RCPT to
	DATA:		'T',	// DATA
	UNKNOWN:	'U',	// Any unknown command
};

var SMFIR = {
	ADDRCPT:		'+',	// add recipient
	DELRCPT:		'-',	// remove recipient
	ADDRCPT_PAR:	'2',	// add recipient (incl. ESMTP args)
	SHUTDOWN:		'4'	,	// 421: shutdown (internal to MTA)
	ACCEPT:		'a',	// accept
	REPLBODY:		'b',	// replace body (chunk)
	CONTINUE:		'c',	// continue
	DISCARD:		'd',	// discard
	CHGFROM:		'e',	// change envelope sender (from)
	CONN_FAIL:	'f',	// cause a connection failure
	ADDHEADER:	'h',	// add header
	INSHEADER:	'i',	// insert header
	SETSYMLIST:	'l'	,	// set list of symbols (macros)
	CHGHEADER:	'm',	// change header
	PROGRESS:		'p',	// progress
	QUARANTINE:	'q',	// quarantine
	REJECT:		'r',	// reject
	SKIP:			's',	// skip
	TEMPFAIL:		't',	// tempfail
	REPLYCODE:	'y'	// reply code etc
};

var SMFIP = constants.SMFIP;

/* possible values for cm_todo */
var CT_CONT = 0x0000;	/* continue reading commands */
var CT_IGNO = 0x0001;	/* continue even when error  */

/* not needed right now, done via return code instead */
var CT_KEEP = 0x0004;	/* keep buffer (contains symbols) */
var CT_END = 0x0008;	/* last command of session, stop replying */

/* states */
var ST = module.exports.ST = {
	NONE:	-1,
	INIT:	0,		// initial state
	OPTS:	1,		// option negotiation
	CONN:	2,		// connection info
	HELO:	3,		// helo
	MAIL:	4,		// mail from
	RCPT:	5,		// rcpt to
	DATA:	6,		// data
	HDRS:	7,		// headers
	EOHS:	8,		// end of headers
	BODY:	9,		// body
	ENDM:	10,		// end of message
	QUIT:	11,		// quit
	ABRT:	12,		// abort
	UNKN:	13,		// unknown SMTP command
	Q_NC:	14,		// quit, new connection follows
	SKIP:	16,		// not a state but required for the state table
};
function ST_IN_MAIL(st) {
	return (st >= ST.MAIL && st < ST.ENDM);
}

/*
**  set of next states
**  each state (ST_*) corresponds to bit in an int value (1 << state)
**  each state has a set of allowed transitions ('or' of bits of states)
**  so a state transition is valid if the mask of the next state
**  is set in the NX_* value
**  this function is coded in trans_ok(), see below.
*/
var MI_MASK = function(x) {
	return (0x0001 << (x));
};
var NX_INIT = (MI_MASK(ST.OPTS));
var NX_OPTS	= (MI_MASK(ST.CONN) | MI_MASK(ST.UNKN));
var NX_CONN	= (MI_MASK(ST.HELO) | MI_MASK(ST.MAIL) | MI_MASK(ST.UNKN));
var NX_HELO	= (MI_MASK(ST.HELO) | MI_MASK(ST.MAIL) | MI_MASK(ST.UNKN));
var NX_MAIL	= (MI_MASK(ST.RCPT) | MI_MASK(ST.ABRT) | MI_MASK(ST.UNKN));
var NX_RCPT	= (MI_MASK(ST.HDRS) | MI_MASK(ST.EOHS) | MI_MASK(ST.DATA) |
			MI_MASK(ST.BODY) | MI_MASK(ST.ENDM) |
			MI_MASK(ST.RCPT) | MI_MASK(ST.ABRT) | MI_MASK(ST.UNKN));
var NX_DATA	= (MI_MASK(ST.EOHS) | MI_MASK(ST.HDRS) | MI_MASK(ST.ABRT));
var NX_HDRS	= (MI_MASK(ST.EOHS) | MI_MASK(ST.HDRS) | MI_MASK(ST.ABRT));
var NX_EOHS	= (MI_MASK(ST.BODY) | MI_MASK(ST.ENDM) | MI_MASK(ST.ABRT));
var NX_BODY	= (MI_MASK(ST.BODY) | MI_MASK(ST.ENDM) | MI_MASK(ST.ABRT));
var NX_ENDM	= (MI_MASK(ST.QUIT) | MI_MASK(ST.MAIL) | MI_MASK(ST.UNKN) |
			MI_MASK(ST.Q_NC));
var NX_QUIT	= 0;
var NX_ABRT	= 0;
var NX_UNKN = (MI_MASK(ST.HELO) | MI_MASK(ST.MAIL) |
			MI_MASK(ST.RCPT) | MI_MASK(ST.DATA) |
			MI_MASK(ST.BODY) | MI_MASK(ST.UNKN) |
			MI_MASK(ST.ABRT) | MI_MASK(ST.QUIT) |
			MI_MASK(ST.Q_NC));
var NX_Q_NC	= (MI_MASK(ST.CONN) | MI_MASK(ST.UNKN));
var NX_SKIP = MI_MASK(ST.SKIP);

var next_states = [
	NX_INIT,
	NX_OPTS,
	NX_CONN,
	NX_HELO,
	NX_MAIL,
	NX_RCPT,
	NX_DATA,
	NX_HDRS,
	NX_EOHS,
	NX_BODY,
	NX_ENDM,
	NX_QUIT,
	NX_ABRT,
	NX_UNKN,
	NX_Q_NC
];
var SIZE_NEXT_STATES = next_states.length;

module.exports.getNextStates = function() {
	return util._extend({}, next_states);
};
module.exports.setNextStates = function(states) {
	next_states = util._extend({}, states);
};

var cmds = [
	{ cmd: SMFIC.ABORT,   next: ST.ABRT, todo: CT_CONT, func: 'abort' },
	{ cmd: SMFIC.MACRO,   next: ST.NONE, todo: CT_KEEP, func: 'macros' },
	{ cmd: SMFIC.BODY,    next: ST.BODY, todo: CT_CONT, func: 'bodychunk' },
	{ cmd: SMFIC.CONNECT, next: ST.CONN, todo: CT_CONT, func: 'connectinfo' },
	{ cmd: SMFIC.BODYEOB, next: ST.ENDM, todo: CT_CONT, func: 'bodyend' },
	{ cmd: SMFIC.HELO,    next: ST.HELO, todo: CT_CONT, func: 'helo' },
	{ cmd: SMFIC.HEADER,  next: ST.HDRS, todo: CT_CONT, func: 'header' },
	{ cmd: SMFIC.MAIL,    next: ST.MAIL, todo: CT_CONT, func: 'sender' },
	{ cmd: SMFIC.OPTNEG,  next: ST.OPTS, todo: CT_CONT, func: 'optionneg' },
	{ cmd: SMFIC.EOH,     next: ST.EOHS, todo: CT_CONT, func: 'eoh' },
	{ cmd: SMFIC.QUIT,    next: ST.QUIT, todo: CT_END,  func: 'quit' },
	{ cmd: SMFIC.DATA,    next: ST.DATA, todo: CT_CONT, func: 'data' },
	{ cmd: SMFIC.RCPT,    next: ST.RCPT, todo: CT_IGNO, func: 'rcpt' },
	{ cmd: SMFIC.UNKNOWN, next: ST.UNKN, todo: CT_IGNO, func: 'unknown' },
	{ cmd: SMFIC.QUIT_NC, next: ST.Q_NC, todo: CT_CONT, func: 'quit' },
];

function bitset(bit, word) {
	return (((word) & (bit)) !== 0);
}

/*
**  Additional (internal) reply codes;
**  must be coordinated wit libmilter/mfapi.h
*/
util._extend(SMFIS, {
	_KEEP: 20,
	_ABORT: 21,
	_OPTIONS: 22,
	_NOREPLY: SMFIS.NOREPLY,
	_FAIL: -1,
	_NONE: -2
});
module.exports.SMFIS = SMFIS;

var MILTER_MAX_DATA_SIZE = 65535; // default milter command data limit
var Maxdatasize = MILTER_MAX_DATA_SIZE;
function setmaxdatasize(sz) {
	var old = Maxdatasize;
	Maxdatasize = sz;
	return old;
}

var MAX_MACROS_ENTRIES = module.exports.MAX_MACROS_ENTRIES = 7;

function Dispatcher(ctx) {
	if (!(this instanceof Dispatcher)) {
		return new Dispatcher(ctx);
	}

	this.ctx = ctx;
	this.curstate = ctx.state;
	ctx.macro.connect = null;
	ctx.macro.helo = null;
	ctx.macro.mail = null;
	ctx.macro.rcpt = null;
	ctx.macro.data = null;
	ctx.macro.eom = null;
	ctx.macro.eoh = null;
	fix_stm(ctx);
	this.buffer = null;
}
module.exports.Dispatcher = Dispatcher;

Dispatcher.prototype.execute = function(data, callback) {
	var self = this;
	var ctx = this.ctx;
	callback = callback || function() {};

	if (self.buffer) {
		data = Buffer.concat([self.buffer, data]);
		self.buffer = null;
	}

	if (data.length > MILTER_LEN_BYTES) {
		var len = data.readUInt32BE();
		if (len > Maxdatasize) {
			debuglog('too big data size');
			ctx.socket.end();
			callback();
		} else 	if (data.length >= (MILTER_LEN_BYTES + len)) {
			var cmd = String.fromCharCode(data[MILTER_LEN_BYTES]);
			var buf = data.slice(MILTER_LEN_BYTES + 1, MILTER_LEN_BYTES + len);

			self.dispatch(cmd, buf, function(err) {
				data = data.slice(MILTER_LEN_BYTES + len);
				self.execute(data, callback);
			});
		} else {
			self.buffer = data;
			callback();
		}
	} else {
		self.buffer = data;
		callback();
	}
};

Dispatcher.prototype.dispatch = function(cmd, data, callback) {
	var self = this;
	var ctx = this.ctx;
	var fi_abort = ctx.milter.abort;
	var call_abort = ST_IN_MAIL(this.curstate);
	callback = callback || function(){};

	debuglog('got cmd \'%s\' len %d', cmd, data.length);

	var index = -1;

	async.waterfall([
		function(callback) {
			for(var i = 0; i < cmds.length; i++) {
				if (cmds[i].cmd === cmd) {
					index = i;
					break;
				}
			}

			if (index < 0) {
				debuglog('cmd \'%s\' unknown', cmd);
				return callback(MI_FAILURE);
			}
			callback();
		},
		function(callback) {
			var newstate = cmds[index].next;
			debuglog('cur %d new %d nextmask %s',
				self.curstate, 	newstate,
				next_states[self.curstate].toString(16));

			if (newstate !== ST.NONE && !trans_ok(self.curstate, newstate)) {

				debuglog('abort: cur %d (%s) new %d (%s) next %s',
					self.curstate, MI_MASK(self.curstate).toString(16),
					newstate, MI_MASK(newstate).toString(16),
					next_states[self.curstate].toString(16));

				if (fi_abort && self.call_abort) {
					fi_abort(ctx, function(){});
				}

				self.curstate = ST.HELO;
				if (!trans_ok(self.curstate, newstate)) {
					return callback(MI_CONTINUE);
				}
			}
			callback(null, newstate);
		}, function(newstate, callback) {
			if (newstate !== ST.NONE) {
				self.curstate = newstate;
				ctx.state = self.curstate;
			}
			self.call_abort = ST_IN_MAIL(self.curstate);

			Dispatcher.prototype[cmds[index].func].call(self, data, function(status) {
				debuglog('status = %d', status);
				callback(null, status);
			});
		}, function(status, callback) {
			self.sendreply(status, ctx, function(result) {
				if (result !== MI_SUCCESS) {
					return callback(MI_FAILURE);
				}

				if (status === SMFIS.ACCEPT) {
					self.curstate = ST.HELO;
				} else if (status === SMFIS.REJECT ||
							status === SMFIS.DISCARD ||
							status === SMFIS.TEMPFAIL) {
					if (!bitset(CT_IGNO, cmds[index].todo)) {
						this.curstate = STATE.HELO;
					}
				} else if (status === SMFIS._ABORT) {
					return callback(MI_FAILURE);
				}

				callback(MI_SUCCESS);
			});
		}
	], function(err) {
		if (err && (err === MI_FAILURE || err === MI_SUCCESS)) {
			ctx.state = self.curstate;

			if (err === MI_FAILURE) {
				if (fi_abort && self.call_abort) {
					fi_abort(ctx, function(){});
				}
			}

			if (ctx.state !== ST.QUIT) {
				var fi_close = ctx.milter.close;
				if (fi_close) {
					fi_close(ctx, function(){});
				}
			}

			ctx.macro.connect = null;
			ctx.macro.helo = null;
			ctx.macro.mail = null;
			ctx.macro.rcpt = null;
			ctx.macro.data = null;
			ctx.macro.eom = null;
			ctx.macro.eoh = null;

			if (err === MI_FAILURE || ctx.state === ST.QUIT) {
				ctx.socket.end();
			}
		}

		callback(err);
	});
};

Dispatcher.prototype.abort = function(data, callback) {
	debuglog('abort called');

	var ctx = this.ctx;
	var fi_abort = ctx.milter.abort;

	if (fi_abort) {
		return fi_abort(ctx, callback);
	}

	callback(SMFIS._NOREPLY);
};

Dispatcher.prototype.macros = function(data, callback) {
	debuglog('macros called');

	var ctx = this.ctx;

	if (data.length < 1) {
		return callback(SMFIS._FAIL);
	}

	var macro = dec_argv(data, 1);
	if (macro.length === 0) {
		return callback(SMFIS._FAIL);
	}

	switch(String.fromCharCode(data[0])) {
	case SMFIC.CONNECT:
		ctx.macro.connect = macro;
		break;
	case SMFIC.HELO:
		ctx.macro.helo = macro;
		break;
	case SMFIC.MAIL:
		ctx.macro.mail = macro;
		break;
	case SMFIC.RCPT:
		ctx.macro.rcpt = macro;
		break;
	case SMFIC.DATA:
		ctx.macro.data = macro;
		break;
	case SMFIC.BODYEOB:
		ctx.macro.eom = macro;
		break;
	case SMFIC.EOH:
		ctx.macro.eoh = macro;
		break;
	default:
		return callback(SMFIS._FAIL);
	}

	callback(SMFIS._KEEP);
};

Dispatcher.prototype.bodychunk = function(data, callback) {
	debuglog('bodychunk called');

	var ctx = this.ctx;
	var fi_body = ctx.milter.body;

	if (fi_body) {
		return fi_body(ctx, data, callback);
	}

	callback(SMFIS.CONTINUE);
};

Dispatcher.prototype.connectinfo = function(data, callback) {
	debuglog('connectinfo called');

	var ctx = this.ctx;
	var fi_connect = ctx.milter.connect;

	ctx.macro.helo = null;
	ctx.macro.mail = null;
	ctx.macro.rcpt = null;
	ctx.macro.data = null;
	ctx.macro.eom = null;
	ctx.macro.eoh = null;

	if (!fi_connect) {
		return callback(SMFIS.CONTINUE);
	}

	var i = 0;
	while(data[i] !== 0 && i < data.length) {
		i++;
	}

	if ((i + 1) >= data.length) {
		return callback(SMFIS._ABORT);
	}

	var hostname = data.toString('ascii', 0, i);
	var port, address;

	i++;
	var family = data[i++];
	if (family !== SMFIA_UNKNOWN) {
		if (i + 2 >= data.length) {
			debuglog('connect: wrong len %d >= %d', i, data.length);
			return callback(SMFIS._ABORT);
		}

		port = data.readUInt16BE(i);
		i += 2;

		if (data[data.length - 1] !== 0) {
			return callback(SMFIS._ABORT);
		}

		address = data.toString('ascii', i, (data.length - 1));
	}

	fi_connect(ctx, hostname, address, port, callback);
};

Dispatcher.prototype.bodyend = function(data, callback) {
	debuglog('bodyend called');

	var self = this;
	var ctx = this.ctx;
	var fi_body = ctx.milter.body;
	var fi_eom = ctx.milter.eom;

	function bodyend(callback) {
		if (fi_eom) {
			return fi_eom(ctx, callback);
		}

		callback(SMFIS.CONTINUE);
	}

	if (fi_body && data.length > 0) {
		return fi_body(ctx, data, function(status) {
			if (status !== SMFIS.CONTINUE) {
				return self.sendreply(status, ctx, function(result) {
					if (result !== MI_SUCCESS) {
						return callback(SMFIS._ABORT);
					}

					bodyend(callback);
				});
			}

			bodyend(callback);
		});
	} else {
		bodyend(callback);
	}
};

Dispatcher.prototype.helo = function(data, callback) {
	debuglog('helo called');

	var ctx = this.ctx;
	var fi_helo = ctx.milter.helo;

	ctx.macro.mail = null;
	ctx.macro.rcpt = null;
	ctx.macro.data = null;
	ctx.macro.eom = null;
	ctx.macro.eoh = null;

	if (fi_helo) {
		if (data.length === 0 || data[data.length - 1] !== 0) {
			return callback(SMFIS._FAIL);
		}

		data = dec_argv(data)[0];
		return fi_helo(ctx, data, callback);
	}

	callback(SMFIS.CONTINUE);
};

Dispatcher.prototype.header = function(data, callback) {
	debuglog('header called');

	var ctx = this.ctx;
	var fi_header = ctx.milter.header;

	if (!fi_header) {
		return callback(SMFIS.CONTINUE);
	}

	var elem = dec_argv(data);
	if (elem.length !== 2) {
		return callback(SMFIS._ABORT);
	}

	fi_header(ctx, elem[0], elem[1], callback);
};

Dispatcher.prototype.sender = function(data, callback) {
	debuglog('sender called');

	var ctx = this.ctx;
	var fi_envfrom = ctx.milter.envfrom;

	ctx.macro.rcpt = null;
	ctx.macro.data = null;
	ctx.macro.eom = null;
	ctx.macro.eoh = null;

	if (!fi_envfrom) {
		return callback(SMFIS.CONTINUE);
	}

	var argv = dec_argv(data);
	if (argv.length === 0) {
		return callback(SMFIS._ABORT);
	}

	fi_envfrom(ctx, argv, callback);
};

Dispatcher.prototype.optionneg = function(data, callback) {
	debuglog('optionneg called');

	var self = this;
	var ctx = this.ctx;
	var fi_negotiate = ctx.milter.negotiate;

	ctx.macro.connect = null;
	ctx.macro.helo = null;
	ctx.macro.mail = null;
	ctx.macro.rcpt = null;
	ctx.macro.data = null;
	ctx.macro.eom = null;
	ctx.macro.eoh = null;

	var SMFI_PROT_VERSION = 6;
	ctx.prot_vers = SMFI_PROT_VERSION;

	if (data.length < MILTER_OPTLEN) {
		debuglog('%s: optionneg: len too short %d < %d',
			ctx.milter.name, data.length, MILTER_OPTLEN);
		return callback(SMFIS._ABORT);
	}

	var v;
	var SMFI_PROT_VERSION_MIN = 2;
	v = data.readUInt32BE(0);
	if (v < SMFI_PROT_VERSION_MIN) {
		debuglog('%s: optionneg: protocol version too old %d < %d',
			ctx.milter.name, v, SMFI_PROT_VERSION_MIN);
		return callback(SMFIS._ABORT);
	}

	ctx.mta_prot_vers = v;
	if (ctx.prot_vers < ctx.mta_prot_vers) {
		ctx.prot_vers2mta = ctx.prot_vers;
	} else {
		ctx.prot_vers2mta = ctx.mta_prot_vers;
	}

	v = data.readUInt32BE(4);
	if (v === 0) {
		v = SMFI_V1_ACTS;
	}
	ctx.mta_aflags = v;

	var internal_pflags = 0;
	v = data.readUInt32BE(8);
	if (v === 0) {
		v = SMFI_V1_PROT;
	} else if (ctx.milter.version >= SMFI_VERSION_MDS) {
		if (bitset(SMFIP.MDS_1M, v)) {
			internal_pflags |= SMFIP.MDS_1M;
			setmaxdatasize(MILTER_MDS_1M);
		} else if(bitset(SMFIP.MDS_256K, v)) {
			internal_pflags |= SMFIP.MDS_256K;
			setmaxdatasize(MILTER_MDS_256K);
		}
	}
	ctx.mta_pflags = (v & ~SMFI_INTERNAL) | internal_pflags;

	ctx.aflags = ctx.milter.flags;
	var fake_pflags = SMFIP.NR_CONN
		| SMFIP.NR_HELO | SMFIP.NR_MAIL | SMFIP.NR_RCPT
		| SMFIP.NR_DATA | SMFIP.NR_UNKN | SMFIP.NR_HDR
		| SMFIP.NR_EOH | SMFIP.NR_BODY;

	if (ctx.milter.version > 4 && fi_negotiate) {
		var aflags, pflags, f2, f3;
		f2 = f3 = 0;
		aflags = ctx.mta_aflags;
		pflags = ctx.pflags;
		if ((SMFIP.SKIP & ctx.mta_pflags) !== 0) {
			pflags |= SMFIP.SKIP;
		}

		fi_negotiate(ctx,
			ctx.mta_aflags, ctx.mta_pflags|fake_pflags, 0, 0,
			function(status, aflags, pflags, f2, f3) {
				if (status === SMFIS.ALL_OPTS) {
					ctx.aflags = ctx.mta_aflags;
					ctx.pflags2mta = ctx.pflags;
					if ((SMFIP.SKIP & ctx.mta_pflags) !== 0) {
						ctx.pflags2mta |= SMFIP.SKIP;
					}
				} else if (status !== SMFIS.CONTINUE) {
					debuglog('%s: negotiate returned %d (protocol options=0x%s, SMFIR=0x%s)',
						ctx.milter.name, status,
						ctx.mta_pflags.toString(16), ctx.mta_aflags.toString(16));
					return callback(SMFIS._ABORT);
				} else {
					ctx.aflags = aflags;
					ctx.pflags = pflags;
					ctx.pflags2mta = pflags;
				}

				var i = ctx.pflags2mta;
				var idx, b;
				if ((ctx.mta_pflags & i) !== i) {
					for(idx = 0; idx < 32; idx++) {
						b = 1 << idx;
						if ((ctx.mta_pflags & b) !== b &&
							(fake_pflags & b) === b) {
							ctx.pflags2mta &= ~b;
						}
					}
				}

				optionneg(callback);
			}
		);
	} else {
		ctx.pflags2mta = ctx.pflags;
		optionneg(callback);
	}

	function optionneg(callback) {
		var i;

		i = ctx.aflags;
		if ((i & ctx.mta_aflags) !== i) {
			return callback(SMFIS._ABORT);
		}

		i = ctx.pflags2mta;
		if ((i & ctx.mta_pflags) !== i) {
			if (bitset(SMFIP.NODATA, ctx.pflags2mta) &&
				!bitset(SMFIP.NODATA, ctx.mta_pflags)) {
				ctx.pflags2mta &= ~SMFIP.NODATA;
			}

			if (bitset(SMFIP.NOUNKNOWN, ctx.pflags2mta) &&
				!bitset(SMFIP.NOUNKNOWN, ctx.mta_pflags)) {
				ctx.pflags2mta &= ~SMFIP.NOUNKNOWN;
			}

			i = ctx.pflags2mta;
		}

		if ((ctx.mta_pflags & i) != i) {
			return callback(SMFIS._ABORT);
		}
		fix_stm(ctx);

		debuglog('milter_negotiate: mta_actions=0x%s, mta_flags=0x%s actions=0x%s, flags=0x%s',
			ctx.mta_aflags.toString(16), ctx.mta_pflags.toString(16),
			ctx.aflags.toString(16), ctx.pflags.toString(16));

		ctx.pflags2mta = (ctx.pflags2mta & ~SMFI_INTERNAL) | internal_pflags;
		callback(SMFIS._OPTIONS);
	}
};

Dispatcher.prototype.eoh = function(data, callback) {
	debuglog('eoh called');

	var ctx = this.ctx;
	var fi_eoh = ctx.milter.eoh;

	if (fi_eoh) {
		return fi_eoh(ctx, callback);
	}

	callback(SMFIS.CONTINUE);
};

Dispatcher.prototype.quit = function(data, callback) {
	debuglog('quit called');

	var ctx = this.ctx;
	var fi_close = ctx.milter.close;

	function close(callback) {
		ctx.macro.connect = null;
		ctx.macro.helo = null;
		ctx.macro.mail = null;
		ctx.macro.rcpt = null;
		ctx.macro.data = null;
		ctx.macro.eom = null;
		ctx.macro.eoh = null;

		callback(SMFIS._NOREPLY);
	}

	if (fi_close) {
		return fi_close(ctx, function() {
			close(callback);
		});
	}

	close(callback);
};

Dispatcher.prototype.data = function(data, callback) {
	debuglog('data called');

	var ctx = this.ctx;
	var fi_data = ctx.milter.data;

	if (fi_data) {
		return fi_data(ctx, callback);
	}

	callback(SMFIS.CONTINUE);
};

Dispatcher.prototype.rcpt = function(data, callback) {
	debuglog('rcpt called');

	var ctx = this.ctx;
	var fi_envrcpt = ctx.milter.envrcpt;

	ctx.macro.data = null;
	ctx.macro.eom = null;
	ctx.macro.eoh = null;

	if (!fi_envrcpt) {
		return callback(SMFIS.CONTINUE);
	}

	var argv = dec_argv(data);
	if (argv.length === 0) {
		return callback(SMFIS._ABORT);
	}

	fi_envrcpt(ctx, argv, callback);
};

Dispatcher.prototype.unknown = function(data, callback) {
	debuglog('unknown called');

	var ctx = this.ctx;
	var fi_unknown = ctx.milter.unknown;

	if (ctx.milter.version > 2 && fi_unknown) {
		return fi_unknown(ctx, data, callback);
	}

	callback(SMFIS.CONTINUE);
};

var trans_ok = module.exports._trans_ok = function(oldstate, newstate) {
	var s, n;
	s = oldstate;
	if (s >= SIZE_NEXT_STATES) {
		return false;
	}

	do {
		if ((MI_MASK(newstate) & next_states[s]) !== 0) {
			return true;
		}

		n = s + 1;
		if (n >= SIZE_NEXT_STATES) {
			return false;
		}

		if (bitset(NX_SKIP, next_states[n])) {
			s = n;
		} else {
			return false;
		}

	} while(s < SIZE_NEXT_STATES);
	return false;
};

var dec_argv = module.exports._dec_argv = function(data, offset) {
	offset = offset || 0;

	var start, end;
	var elem = [];
	for(start = offset, end = 0; end < data.length; end++) {
		if (data[end] === 0) {
			elem.push(data.slice(start, end).toString());
			start = end + 1;
		}
	}
	return elem;
};

var fix_stm = module.exports._fix_stm = function(ctx) {
	var fl = ctx.pflags;
	if (bitset(SMFIP.NOCONNECT, fl))	{ next_states[ST.CONN] |= NX_SKIP; }
	if (bitset(SMFIP.NOHELO, fl))		{ next_states[ST.HELO] |= NX_SKIP; }
	if (bitset(SMFIP.NOMAIL, fl))		{ next_states[ST.MAIL] |= NX_SKIP; }
	if (bitset(SMFIP.NORCPT, fl))		{ next_states[ST.RCPT] |= NX_SKIP; }
	if (bitset(SMFIP.NOHDRS, fl))		{ next_states[ST.HDRS] |= NX_SKIP; }
	if (bitset(SMFIP.NOEOH, fl))		{ next_states[ST.EOHS] |= NX_SKIP; }
	if (bitset(SMFIP.NOBODY, fl))		{ next_states[ST.BODY] |= NX_SKIP; }
	if (bitset(SMFIP.NODATA, fl))		{ next_states[ST.DATA] |= NX_SKIP; }
	if (bitset(SMFIP.NOUNKNOWN, fl))	{ next_states[ST.UNKN] |= NX_SKIP; }
};

Dispatcher.prototype.sendreply = function(status, ctx, callback) {
	debuglog('sendreply called');

	var bit = get_nr_bit(ctx.state);
	if (bit !== 0 && (ctx.pflags & bit) !== 0 && status !== SMFIS.NOREPLY) {
		if (status >= SMFIS.CONTINUE && status < SMFIS._KEEP) {
			debuglog('%s: milter claimed not to replay in state %d but did anyway %d',
				ctx.milter.name, ctx.state, status);
		}

		switch(status) {
		case SMFIS.CONTINUE:
		case SMFIS.TEMPFAIL:
		case SMFIS.REJECT:
		case SMFIS.DISCARD:
		case SMFIS.ACCEPT:
		case SMFIS.SKIP:
		case SMFIS._OPTIONS:
			status = SMFIS.NOREPLY;
			break;
		}
	}

	switch(status) {
	case SMFIS.CONTINUE:
		return write_command(ctx.socket, SMFIR.CONTINUE, callback);
	case SMFIS.TEMPFAIL:
	case SMFIS.REJECT:
		if (ctx.replay &&
			((status === SMFIS.TEMPFAIL && ctx.replay === '4') ||
			 (status === SMFIS.REJECT && ctx.replay === '5'))) {
			return write_command(ctx.socket, SMFIR.REPLYCODE, ctx.replay, function(result) {
				ctx.replay = null;
				callback(result);
			});
		} else {
			return write_command(
				ctx.socket,
				status === SMFIS.REJECT ? SMFIR.REJECT : SMFIR.TEMPFAIL,
				callback
			);
		}
		break;
	case SMFIS.SMFIS_DISCAR:
		return write_command(ctx.socket, SMFIR.DISCARD, callback);
	case SMFIS.ACCEPT:
		return write_command(ctx.socket, SMFIR.ACCEPT, callback);
	case SMFIS.SKIP:
		return write_command(ctx.socket, SMFIR.SKIP, callback);
	case SMFIS._OPTIONS:
		var data = new Buffer(MILTER_OPTLEN);
		data.writeUInt32BE(ctx.prot_vers2mta, 0);
		data.writeUInt32BE(ctx.pflags2mta, MILTER_LEN_BYTES * 2);
		data.writeUInt32BE(ctx.aflags, MILTER_LEN_BYTES);

		for(var i = 0; i < MAX_MACROS_ENTRIES; i++) {
			if (!ctx.macrolist[i]) {
				continue;
			}

			var buf = new Buffer(MILTER_LEN_BYTES);
			buf.writeUInt32BE(i);
			data = Buffer.concat([data, buf, new Buffer(ctx.macrolist[i])]);
		}

		// addsymlist
		return write_command(ctx.socket, SMFIC.OPTNEG, data, callback);
	case SMFIS.NOREPLY:
		if (bit !== 0 &&
			(ctx.pflags & bit) !== 0 &&
			(ctx.mta_pflags & bit) === 0) {
			return write_command(ctx.socket, SMFIR.CONTINUE, callback);
		}
		break;
	}

	callback(MI_SUCCESS);
};

function get_nr_bit(state) {
	var bit;

	switch(state) {
	case ST.CONN:
		bit = SMFIP.NR_CONN;
		break;
	case ST.HELO:
		bit = SMFIP.NR_HELO;
		break;
	case ST.MAIL:
		bit = SMFIP.NR_MAIL;
		break;
	case ST.RCPT:
		bit = SMFIP.NR_RCPT;
		break;
	case ST.DATA:
		bit = SMFIP.NR_DATA;
		break;
	case ST.UNKN:
		bit = SMFIP.NR_UNKN;
		break;
	case ST.HDRS:
		bit = SMFIP.NR_HDR;
		break;
	case ST.EOHS:
		bit = SMFIP.NR_EOH;
		break;
	case ST.BODY:
		bit = SMFIP.NR_BODY;
		break;
	default:
		bit = 0;
		break;
	}
	return bit;
}

function write_command(socket, cmd, data, callback) {
	debuglog('write_command called');

	if (util.isFunction(data)) {
		callback = data;
		data = new Buffer(0);
	}

	if (!data) {
		data = new Buffer(0);
	}

	debuglog('cmd = \'%s\' data length = %d', cmd, data.length);

	if (data.length > Maxdatasize) {
		return callback(MI_FAILURE);
	}

	var buf = new Buffer(MILTER_LEN_BYTES);
	buf.writeUInt32BE(data.length + 1);
	buf = Buffer.concat([buf, new Buffer(cmd), data]);

	socket.write(buf, 'binary', function() {
		callback(MI_SUCCESS);
	});
}
