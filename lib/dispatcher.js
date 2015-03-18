var util = require('util');
var logger = require('winston');
var async = require('async');

var constants = require('./constants');
var STATUS_CODES = constants.STATUS_CODES;

var SMFI_VERSION = constants.SMFI_VERSION;
var SMFI_VERSION_MDS  = 0x01000002;

var MI_CONTINUE = 1;
var MI_SUCCESS = 0;
var MI_FAILURE = -1;

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

var COMMANDS = module.exports.COMMANDS  = {
	SMFIC_ABORT:	'A',	// Abort
	SMFIC_BODY:		'B',	// Body chunk
	SMFIC_CONNECT:	'C',	// Connection information
	SMFIC_MACRO:	'D',	// Define macro
	SMFIC_BODYEOB:	'E',	// final body chunk (End)
	SMFIC_HELO:		'H',	// HELO/EHLO
	SMFIC_QUIT_NC:	'K',	// QUIT but new connection follows
	SMFIC_HEADER:	'L',	// Header
	SMFIC_MAIL:		'M',	// MAIL from
	SMFIC_OPTNEG:	'O',	// Option negotiation
	SMFIC_EOH:		'N',	// EOH
	SMFIC_QUIT:		'Q',	// QUIT
	SMFIC_RCPT:		'R',	// RCPT to
	SMFIC_DATA:		'T',	// DATA
	SMFIC_UNKNOWN:	'U',	// Any unknown command
};

var ACTIONS = {
	SMFIR_ADDRCPT:		'+',	// add recipient
	SMFIR_DELRCPT:		'-',	// remove recipient
	SMFIR_ADDRCPT_PAR:	'2',	// add recipient (incl. ESMTP args)
	SMFIR_SHUTDOWN:		'4'	,	// 421: shutdown (internal to MTA)
	SMFIR_ACCEPT:		'a',	// accept
	SMFIR_REPLBODY:		'b',	// replace body (chunk)
	SMFIR_CONTINUE:		'c',	// continue
	SMFIR_DISCARD:		'd',	// discard
	SMFIR_CHGFROM:		'e',	// change envelope sender (from)
	SMFIR_CONN_FAIL:	'f',	// cause a connection failure
	SMFIR_ADDHEADER:	'h',	// add header
	SMFIR_INSHEADER:	'i',	// insert header
	SMFIR_SETSYMLIST:	'l'	,	// set list of symbols (macros)
	SMFIR_CHGHEADER:	'm',	// change header
	SMFIR_PROGRESS:		'p',	// progress
	SMFIR_QUARANTINE:	'q',	// quarantine
	SMFIR_REJECT:		'r',	// reject
	SMFIR_SKIP:			's',	// skip
	SMFIR_TEMPFAIL:		't',	// tempfail
	SMFIR_REPLYCODE:	'y'	// reply code etc
};

// What the MTA can send/filter wants in protocol
var PROTOCOLS = module.exports.PROTOCOLS = {
	SMFIP_NOCONNECT:	0x00000001,	// MTA should not send connect info
	SMFIP_NOHELO:		0x00000002,	// MTA should not send HELO info
	SMFIP_NOMAIL:		0x00000004,	// MTA should not send MAIL info
	SMFIP_NORCPT:		0x00000008,	// MTA should not send RCPT info
	SMFIP_NOBODY:		0x00000010,	// MTA should not send body
	SMFIP_NOHDRS:		0x00000020,	// MTA should not send headers
	SMFIP_NOEOH:		0x00000040,	// MTA should not send EOH
	SMFIP_NR_HDR:		0x00000080,	// No reply for headers
	SMFIP_NOHREPL:		0x00000080,	// No reply for headers
	SMFIP_NOUNKNOWN:	0x00000100, // MTA should not send unknown commands
	SMFIP_NODATA:		0x00000200,	// MTA should not send DATA
	SMFIP_SKIP:			0x00000400,	// MTA understands SMFIS_SKIP
	SMFIP_RCPT_REJ:		0x00000800, // MTA should also send rejected RCPTs
	SMFIP_NR_CONN:		0x00001000,	// No reply for connect
	SMFIP_NR_HELO:		0x00002000,	// No reply for HELO
	SMFIP_NR_MAIL:		0x00004000,	// No reply for MAIL
	SMFIP_NR_RCPT:		0x00008000,	// No reply for RCPT
	SMFIP_NR_DATA:		0x00010000,	// No reply for DATA
	SMFIP_NR_UNKN:		0x00020000,	// No reply for UNKN
	SMFIP_NR_EOH:		0x00040000,	// No reply for eoh
	SMFIP_NR_BODY:		0x00080000,	// No reply for body chunk
	SMFIP_HDR_LEADSPC:	0x00100000,	// header value leading space
	SMFIP_MDS_256K:		0x10000000,	// MILTER_MAX_DATA_SIZE=256K
	SMFIP_MDS_1M:		0x20000000	// MILTER_MAX_DATA_SIZE=1M
// 	SMFIP_	0x40000000L	reserved: see SMFI_INTERNAL
};

/* possible values for cm_todo */
var CT_CONT = 0x0000;	/* continue reading commands */
var CT_IGNO = 0x0001;	/* continue even when error  */

/* not needed right now, done via return code instead */
var CT_KEEP = 0x0004;	/* keep buffer (contains symbols) */
var CT_END = 0x0008;	/* last command of session, stop replying */

/* states */
var STATES = module.exports.STATES = {
	ST_NONE:	-1,
	ST_INIT:	0,		// initial state
	ST_OPTS:	1,		// option negotiation
	ST_CONN:	2,		// connection info
	ST_HELO:	3,		// helo
	ST_MAIL:	4,		// mail from
	ST_RCPT:	5,		// rcpt to
	ST_DATA:	6,		// data
	ST_HDRS:	7,		// headers
	ST_EOHS:	8,		// end of headers
	ST_BODY:	9,		// body
	ST_ENDM:	10,		// end of message
	ST_QUIT:	11,		// quit
	ST_ABRT:	12,		// abort
	ST_UNKN:	13,		// unknown SMTP command
	ST_Q_NC:	14,		// quit, new connection follows
	ST_SKIP:	16,		// not a state but required for the state table
};
function ST_IN_MAIL(st) {
	return (st >= this.ST_MAIL && st < this.ST_ENDM);
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
var NX_INIT = (MI_MASK(STATES.ST_OPTS));
var NX_OPTS	= (MI_MASK(STATES.ST_CONN) | MI_MASK(STATES.ST_UNKN));
var NX_CONN	= (MI_MASK(STATES.ST_HELO) | MI_MASK(STATES.ST_MAIL) | MI_MASK(STATES.ST_UNKN));
var NX_HELO	= (MI_MASK(STATES.ST_HELO) | MI_MASK(STATES.ST_MAIL) | MI_MASK(STATES.ST_UNKN));
var NX_MAIL	= (MI_MASK(STATES.ST_RCPT) | MI_MASK(STATES.ST_ABRT) | MI_MASK(STATES.ST_UNKN));
var NX_RCPT	= (MI_MASK(STATES.ST_HDRS) | MI_MASK(STATES.ST_EOHS) | MI_MASK(STATES.ST_DATA) |
			MI_MASK(STATES.ST_BODY) | MI_MASK(STATES.ST_ENDM) |
			MI_MASK(STATES.ST_RCPT) | MI_MASK(STATES.ST_ABRT) | MI_MASK(STATES.ST_UNKN));
var NX_DATA	= (MI_MASK(STATES.ST_EOHS) | MI_MASK(STATES.ST_HDRS) | MI_MASK(STATES.ST_ABRT));
var NX_HDRS	= (MI_MASK(STATES.ST_EOHS) | MI_MASK(STATES.ST_HDRS) | MI_MASK(STATES.ST_ABRT));
var NX_EOHS	= (MI_MASK(STATES.ST_BODY) | MI_MASK(STATES.ST_ENDM) | MI_MASK(STATES.ST_ABRT));
var NX_BODY	= (MI_MASK(STATES.ST_BODY) | MI_MASK(STATES.ST_ENDM) | MI_MASK(STATES.ST_ABRT));
var NX_ENDM	= (MI_MASK(STATES.ST_QUIT) | MI_MASK(STATES.ST_MAIL) | MI_MASK(STATES.ST_UNKN) |
			MI_MASK(STATES.ST_Q_NC));
var NX_QUIT	= 0;
var NX_ABRT	= 0;
var NX_UNKN = (MI_MASK(STATES.ST_HELO) | MI_MASK(STATES.ST_MAIL) |
			MI_MASK(STATES.ST_RCPT) | MI_MASK(STATES.ST_DATA) |
			MI_MASK(STATES.ST_BODY) | MI_MASK(STATES.ST_UNKN) |
			MI_MASK(STATES.ST_ABRT) | MI_MASK(STATES.ST_QUIT) |
			MI_MASK(STATES.ST_Q_NC));
var NX_Q_NC	= (MI_MASK(STATES.ST_CONN) | MI_MASK(STATES.ST_UNKN));
var NX_SKIP = MI_MASK(STATES.ST_SKIP);

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
	{ cmd: COMMANDS.SMFIC_ABORT,   next: STATES.ST_ABRT, todo: CT_CONT, func: 'abort' },
	{ cmd: COMMANDS.SMFIC_MACRO,   next: STATES.ST_NONE, todo: CT_KEEP, func: 'macros' },
	{ cmd: COMMANDS.SMFIC_BODY,    next: STATES.ST_BODY, todo: CT_CONT, func: 'bodychunk' },
	{ cmd: COMMANDS.SMFIC_CONNECT, next: STATES.ST_CONN, todo: CT_CONT, func: 'connectinfo' },
	{ cmd: COMMANDS.SMFIC_BODYEOB, next: STATES.ST_ENDM, todo: CT_CONT, func: 'bodyend' },
	{ cmd: COMMANDS.SMFIC_HELO,    next: STATES.ST_HELO, todo: CT_CONT, func: 'helo' },
	{ cmd: COMMANDS.SMFIC_HEADER,  next: STATES.ST_HDRS, todo: CT_CONT, func: 'header' },
	{ cmd: COMMANDS.SMFIC_MAIL,    next: STATES.ST_MAIL, todo: CT_CONT, func: 'sender' },
	{ cmd: COMMANDS.SMFIC_OPTNEG,  next: STATES.ST_OPTS, todo: CT_CONT, func: 'optionneg' },
	{ cmd: COMMANDS.SMFIC_EOH,     next: STATES.ST_EOHS, todo: CT_CONT, func: 'eoh' },
	{ cmd: COMMANDS.SMFIC_QUIT,    next: STATES.ST_QUIT, todo: CT_END,  func: 'quit' },
	{ cmd: COMMANDS.SMFIC_DATA,    next: STATES.ST_DATA, todo: CT_CONT, func: 'data' },
	{ cmd: COMMANDS.SMFIC_RCPT,    next: STATES.ST_RCPT, todo: CT_IGNO, func: 'rcpt' },
	{ cmd: COMMANDS.SMFIC_UNKNOWN, next: STATES.ST_UNKN, todo: CT_IGNO, func: 'unknown' },
	{ cmd: COMMANDS.SMFIC_QUIT_NC, next: STATES.ST_Q_NC, todo: CT_CONT, func: 'quit' },
];

function bitset(bit, word) {
	return (((word) & (bit)) !== 0);
}

/*
**  Additional (internal) reply codes;
**  must be coordinated wit libmilter/mfapi.h
*/
util._extend(STATUS_CODES, {
	_SMFIS_KEEP: 20,
	_SMFIS_ABORT: 21,
	_SMFIS_OPTIONS: 22,
	_SMFIS_NOREPLY: STATUS_CODES.SMFIS_NOREPLY,
	_SMFIS_FAIL: -1,
	_SMFIS_NONE: -2
});
module.exports.STATUS_CODES = STATUS_CODES;

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
			logger.warn('too big data size');
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

	logger.debug('got cmd \'%s\' len %d', cmd, data.length);

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
				logger.info('cmd \'%s\' unknown', cmd);
				return callback(MI_FAILURE);
			}
			callback();
		},
		function(callback) {
			var newstate = cmds[index].next;
			logger.debug('cur %d new %d nextmask %s',
				self.curstate, 	newstate,
				next_states[self.curstate].toString(16));

			if (newstate !== STATES.ST_NONE && !trans_ok(self.curstate, newstate)) {

				logger.info('abort: cur %d (%s) new %d (%s) next %s',
					self.curstate, MI_MASK(self.curstate).toString(16),
					newstate, MI_MASK(newstate).toString(16),
					next_states[self.curstate].toString(16));

				if (fi_abort && self.call_abort) {
					fi_abort(ctx, function(){});
				}

				self.curstate = STATES.ST_HELO;
				if (!trans_ok(self.curstate, newstate)) {
					return callback(MI_CONTINUE);
				}
			}
			callback(null, newstate);
		}, function(newstate, callback) {
			if (newstate !== STATES.ST_NONE) {
				self.curstate = newstate;
				ctx.state = self.curstate;
			}
			self.call_abort = ST_IN_MAIL(self.curstate);

			Dispatcher.prototype[cmds[index].func].call(self, data, function(status) {
				logger.debug('status = %d', status);
				callback(null, status);
			});
		}, function(status, callback) {
			self.sendreply(status, ctx, function(result) {
				if (result !== MI_SUCCESS) {
					return callback(MI_FAILURE);
				}

				if (status === STATUS_CODES.SMFIS_ACCEPT) {
					self.curstate = STATES.ST_HELO;
				} else if (status === STATUS_CODES.SMFIS_REJECT ||
							status === STATUS_CODES.SMFIS_DISCARD ||
							status === STATUS_CODES.SMFIS_TEMPFAIL) {
					if (!bitset(CT_IGNO, cmds[index].todo)) {
						this.curstate = STATE.ST_HELO;
					}
				} else if (status === STATUS_CODES._SMFIS_ABORT) {
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

			if (ctx.state !== STATES.ST_QUIT) {
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

			if (err === MI_FAILURE || ctx.state === STATES.ST_QUIT) {
				ctx.socket.end();
			}
		}

		callback(err);
	});
};

Dispatcher.prototype.abort = function(data, callback) {
	logger.debug('abort called');

	var ctx = this.ctx;
	var fi_abort = ctx.milter.abort;

	if (fi_abort) {
		return fi_abort(ctx, callback);
	}

	callback(STATUS_CODES._SMFIS_NOREPLY);
};

Dispatcher.prototype.macros = function(data, callback) {
	logger.debug('macros called');

	var ctx = this.ctx;

	if (data.length < 1) {
		return callback(STATUS_CODES._SMFIS_FAIL);
	}

	var macro = dec_argv(data, 1);
	if (macro.length === 0) {
		return callback(STATUS_CODES._SMFIS_FAIL);
	}

	switch(String.fromCharCode(data[0])) {
	case COMMANDS.SMFIC_CONNECT:
		ctx.macro.connect = macro;
		break;
	case COMMANDS.SMFIC_HELO:
		ctx.macro.helo = macro;
		break;
	case COMMANDS.SMFIC_MAIL:
		ctx.macro.mail = macro;
		break;
	case COMMANDS.SMFIC_RCPT:
		ctx.macro.rcpt = macro;
		break;
	case COMMANDS.SMFIC_DATA:
		ctx.macro.data = macro;
		break;
	case COMMANDS.SMFIC_BODYEOB:
		ctx.macro.eom = macro;
		break;
	case COMMANDS.SMFIC_EOH:
		ctx.macro.eoh = macro;
		break;
	default:
		return callback(STATUS_CODES._SMFIS_FAIL);
	}

	callback(STATUS_CODES._SMFIS_KEEP);
};

Dispatcher.prototype.bodychunk = function(data, callback) {
	logger.debug('bodychunk called');

	var ctx = this.ctx;
	var fi_body = ctx.milter.body;

	if (fi_body) {
		return fi_body(ctx, data, callback);
	}

	callback(STATUS_CODES.SMFIS_CONTINUE);
};

Dispatcher.prototype.connectinfo = function(data, callback) {
	logger.debug('connectinfo called');

	var ctx = this.ctx;
	var fi_connect = ctx.milter.connect;

	ctx.macro.helo = null;
	ctx.macro.mail = null;
	ctx.macro.rcpt = null;
	ctx.macro.data = null;
	ctx.macro.eom = null;
	ctx.macro.eoh = null;

	if (!fi_connect) {
		return callback(STATUS_CODES.SMFIS_CONTINUE);
	}

	var i = 0;
	while(data[i] !== 0 && i < data.length) {
		i++;
	}

	if ((i + 1) >= data.length) {
		return callback(STATUS_CODES._SMFIS_ABORT);
	}

	var hostname = data.toString('ascii', 0, i);
	var port, address;

	i++;
	var family = data[i++];
	if (family !== SMFIA_UNKNOWN) {
		if (i + 2 >= data.length) {
			logger.warn('connect: wrong len %d >= %d', i, data.length);
			return callback(STATUS_CODES._SMFIS_ABORT);
		}

		port = data.readUInt16BE(i);
		i += 2;

		if (data[data.length - 1] !== 0) {
			return callback(STATUS_CODES._SMFIS_ABORT);
		}

		address = data.toString('ascii', i, (data.length - 1));
	}

	fi_connect(ctx, hostname, address, port, callback);
};

Dispatcher.prototype.bodyend = function(data, callback) {
	logger.debug('bodyend called');

	var self = this;
	var ctx = this.ctx;
	var fi_body = ctx.milter.body;
	var fi_eom = ctx.milter.eom;

	function bodyend(callback) {
		if (fi_eom) {
			return fi_eom(ctx, callback);
		}

		callback(STATUS_CODES.SMFIS_CONTINUE);
	}

	if (fi_body && data.length > 0) {
		return fi_body(ctx, data, function(status) {
			if (status !== STATUS_CODES.SMFIS_CONTINUE) {
				return self.sendreply(status, ctx, function(result) {
					if (result !== MI_SUCCESS) {
						return callback(STATUS_CODES._SMFIS_ABORT);
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
	logger.debug('helo called');

	var ctx = this.ctx;
	var fi_helo = ctx.milter.helo;

	ctx.macro.mail = null;
	ctx.macro.rcpt = null;
	ctx.macro.data = null;
	ctx.macro.eom = null;
	ctx.macro.eoh = null;

	if (fi_helo) {
		if (data.length === 0 || data[data.length - 1] !== 0) {
			return callback(STATUS_CODES._SMFIS_FAIL);
		}

		data = dec_argv(data)[0];
		return fi_helo(ctx, data, callback);
	}

	callback(STATUS_CODES.SMFIS_CONTINUE);
};

Dispatcher.prototype.header = function(data, callback) {
	logger.debug('header called');

	var ctx = this.ctx;
	var fi_header = ctx.milter.header;

	if (!fi_header) {
		return callback(STATUS_CODES.SMFIS_CONTINUE);
	}

	var elem = dec_argv(data);
	if (elem.length !== 2) {
		return callback(STATUS_CODES._SMFIS_ABORT);
	}

	fi_header(ctx, elem[0], elem[1], callback);
};

Dispatcher.prototype.sender = function(data, callback) {
	logger.debug('sender called');

	var ctx = this.ctx;
	var fi_envfrom = ctx.milter.envfrom;

	ctx.macro.rcpt = null;
	ctx.macro.data = null;
	ctx.macro.eom = null;
	ctx.macro.eoh = null;

	if (!fi_envfrom) {
		return callback(STATUS_CODES.SMFIS_CONTINUE);
	}

	var argv = dec_argv(data);
	if (argv.length === 0) {
		return callback(STATUS_CODES._SMFIS_ABORT);
	}

	fi_envfrom(ctx, argv, callback);
};

Dispatcher.prototype.optionneg = function(data, callback) {
	logger.debug('optionneg called');

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
		logger.error('%s: optionneg: len too short %d < %d',
			ctx.milter.name, data.length, MILTER_OPTLEN);
		return callback(STATUS_CODES._SMFIS_ABORT);
	}

	var v;
	var SMFI_PROT_VERSION_MIN = 2;
	v = data.readUInt32BE(0);
	if (v < SMFI_PROT_VERSION_MIN) {
		logger.error('%s: optionneg: protocol version too old %d < %d',
			ctx.milter.name, v, SMFI_PROT_VERSION_MIN);
		return callback(STATUS_CODES._SMFIS_ABORT);
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
		if (bitset(PROTOCOLS.SMFIP_MDS_1M, v)) {
			internal_pflags |= PROTOCOLS.SMFIP_MDS_1M;
			setmaxdatasize(MILTER_MDS_1M);
		} else if(bitset(PROTOCOLS.SMFIP_MDS_256K, v)) {
			internal_pflags |= PROTOCOLS.SMFIP_MDS_256K;
			setmaxdatasize(MILTER_MDS_256K);
		}
	}
	ctx.mta_pflags = (v & ~SMFI_INTERNAL) | internal_pflags;

	ctx.aflags = ctx.milter.flags;
	var fake_pflags = PROTOCOLS.SMFIP_NR_CONN
		| PROTOCOLS.SMFIP_NR_HELO | PROTOCOLS.SMFIP_NR_MAIL | PROTOCOLS.SMFIP_NR_RCPT
		| PROTOCOLS.SMFIP_NR_DATA | PROTOCOLS.SMFIP_NR_UNKN | PROTOCOLS.SMFIP_NR_HDR
		| PROTOCOLS.SMFIP_NR_EOH | PROTOCOLS.SMFIP_NR_BODY;

	if (ctx.milter.version > 4 && fi_negotiate) {
		var aflags, pflags, f2, f3;
		f2 = f3 = 0;
		aflags = ctx.mta_aflags;
		pflags = ctx.pflags;
		if ((PROTOCOLS.SMFIP_SKIP & ctx.mta_pflags) !== 0) {
			pflags |= PROTOCOLS.SMFIP_SKIP;
		}

		fi_negotiate(ctx,
			ctx.mta_aflags, ctx.mta_pflags|fake_pflags, 0, 0,
			function(status, aflags, pflags, f2, f3) {
				if (status === STATUS_CODES.SMFIS_ALL_OPTS) {
					ctx.aflags = ctx.mta_aflags;
					ctx.pflags2mta = ctx.pflags;
					if ((PROTOCOLS.SMFIP_SKIP & ctx.mta_pflags) !== 0) {
						ctx.pflags2mta |= PROTOCOLS.SMFIP_SKIP;
					}
				} else if (status !== STATUS_CODES.SMFIS_CONTINUE) {
					logger.error('%s: negotiate returned %d (protocol options=0x%s, actions=0x%s)',
						ctx.milter.name, status,
						ctx.mta_pflags.toString(16), ctx.mta_aflags.toString(16));
					return callback(STATUS_CODES._SMFIS_ABORT);
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
			return callback(STATUS_CODES._SMFIS_ABORT);
		}

		i = ctx.pflags2mta;
		if ((i & ctx.mta_pflags) !== i) {
			if (bitset(PROTOCOLS.SMFIP_NODATA, ctx.pflags2mta) &&
				!bitset(PROTOCOLS.SMFIP_NODATA, ctx.mta_pflags)) {
				ctx.pflags2mta &= ~PROTOCOLS.SMFIP_NODATA;
			}

			if (bitset(PROTOCOLS.SMFIP_NOUNKNOWN, ctx.pflags2mta) &&
				!bitset(PROTOCOLS.SMFIP_NOUNKNOWN, ctx.mta_pflags)) {
				ctx.pflags2mta &= ~PROTOCOLS.SMFIP_NOUNKNOWN;
			}

			i = ctx.pflags2mta;
		}

		if ((ctx.mta_pflags & i) != i) {
			return callback(STATUS_CODES._SMFIS_ABORT);
		}
		fix_stm(ctx);

		logger.info('milter_negotiate: mta_actions=0x%s, mta_flags=0x%s actions=0x%s, flags=0x%s',
			ctx.mta_aflags.toString(16), ctx.mta_pflags.toString(16),
			ctx.aflags.toString(16), ctx.pflags.toString(16));

		ctx.pflags2mta = (ctx.pflags2mta & ~SMFI_INTERNAL) | internal_pflags;
		callback(STATUS_CODES._SMFIS_OPTIONS);
	}
};

Dispatcher.prototype.eoh = function(data, callback) {
	logger.debug('eoh called');

	var ctx = this.ctx;
	var fi_eoh = ctx.milter.eoh;

	if (fi_eoh) {
		return fi_eoh(ctx, callback);
	}

	callback(STATUS_CODES.SMFIS_CONTINUE);
};

Dispatcher.prototype.quit = function(data, callback) {
	logger.debug('quit called');

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

		callback(STATUS_CODES._SMFIS_NOREPLY);
	}

	if (fi_close) {
		return fi_close(ctx, function() {
			close(callback);
		});
	}

	close(callback);
};

Dispatcher.prototype.data = function(data, callback) {
	logger.debug('data called');

	var ctx = this.ctx;
	var fi_data = ctx.milter.data;

	if (fi_data) {
		return fi_data(ctx, callback);
	}

	callback(STATUS_CODES.SMFIS_CONTINUE);
};

Dispatcher.prototype.rcpt = function(data, callback) {
	logger.debug('rcpt called');

	var ctx = this.ctx;
	var fi_envrcpt = ctx.milter.envrcpt;

	ctx.macro.data = null;
	ctx.macro.eom = null;
	ctx.macro.eoh = null;

	if (!fi_envrcpt) {
		return callback(STATUS_CODES.SMFIS_CONTINUE);
	}

	var argv = dec_argv(data);
	if (argv.length === 0) {
		return callback(STATUS_CODES._SMFIS_ABORT);
	}

	fi_envrcpt(ctx, argv, callback);
};

Dispatcher.prototype.unknown = function(data, callback) {
	logger.debug('unknown called');

	var ctx = this.ctx;
	var fi_unknown = ctx.milter.unknown;

	if (ctx.milter.version > 2 && fi_unknown) {
		return fi_unknown(ctx, data, callback);
	}

	callback(STATUS_CODES.SMFIS_CONTINUE);
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
	if (bitset(PROTOCOLS.SMFIP_NOCONNECT, fl))	{ next_states[STATES.ST_CONN] |= NX_SKIP; }
	if (bitset(PROTOCOLS.SMFIP_NOHELO, fl))		{ next_states[STATES.ST_HELO] |= NX_SKIP; }
	if (bitset(PROTOCOLS.SMFIP_NOMAIL, fl))		{ next_states[STATES.ST_MAIL] |= NX_SKIP; }
	if (bitset(PROTOCOLS.SMFIP_NORCPT, fl))		{ next_states[STATES.ST_RCPT] |= NX_SKIP; }
	if (bitset(PROTOCOLS.SMFIP_NOHDRS, fl))		{ next_states[STATES.ST_HDRS] |= NX_SKIP; }
	if (bitset(PROTOCOLS.SMFIP_NOEOH, fl))		{ next_states[STATES.ST_EOHS] |= NX_SKIP; }
	if (bitset(PROTOCOLS.SMFIP_NOBODY, fl))		{ next_states[STATES.ST_BODY] |= NX_SKIP; }
	if (bitset(PROTOCOLS.SMFIP_NODATA, fl))		{ next_states[STATES.ST_DATA] |= NX_SKIP; }
	if (bitset(PROTOCOLS.SMFIP_NOUNKNOWN, fl))	{ next_states[STATES.ST_UNKN] |= NX_SKIP; }
};

Dispatcher.prototype.sendreply = function(status, ctx, callback) {
	logger.debug('sendreply called');

	var bit = get_nr_bit(ctx.state);
	if (bit !== 0 && (ctx.pflags & bit) !== 0 && status !== STATUS_CODES.SMFIS_NOREPLY) {
		if (status >= STATUS_CODES.SMFIS_CONTINUE && status < STATUS_CODES._SMFIS_KEEP) {
			logger.error('%s: milter claimed not to replay in state %d but did anyway %d',
				ctx.milter.name, ctx.state, status);
		}

		switch(status) {
		case STATUS_CODES.SMFIS_CONTINUE:
		case STATUS_CODES.SMFIS_TEMPFAIL:
		case STATUS_CODES.SMFIS_REJECT:
		case STATUS_CODES.SMFIS_DISCARD:
		case STATUS_CODES.SMFIS_ACCEPT:
		case STATUS_CODES.SMFIS_SKIP:
		case STATUS_CODES._SMFIS_OPTIONS:
			status = STATUS_CODES.SMFIS_NOREPLY;
			break;
		}
	}

	switch(status) {
	case STATUS_CODES.SMFIS_CONTINUE:
		return write_command(ctx.socket, ACTIONS.SMFIR_CONTINUE, callback);
	case STATUS_CODES.SMFIS_TEMPFAIL:
	case STATUS_CODES.SMFIS_REJECT:
		if (ctx.replay &&
			((status === STATUS_CODES.SMFIS_TEMPFAIL && ctx.replay === '4') ||
			 (status === STATUS_CODES.SMFIS_REJECT && ctx.replay === '5'))) {
			return write_command(ctx.socket, ACTIONS.SMFIR_REPLYCODE, ctx.replay, function(result) {
				ctx.replay = null;
				callback(result);
			});
		} else {
			return write_command(
				ctx.socket,
				status === STATUS_CODES.SMFIS_REJECT ? ACTIONS.SMFIR_REJECT : ACTIONS.SMFIR_TEMPFAIL,
				callback
			);
		}
		break;
	case STATUS_CODES.SMFIS_DISCAR:
		return write_command(ctx.socket, ACTIONS.SMFIR_DISCARD, callback);
	case STATUS_CODES.SMFIS_ACCEPT:
		return write_command(ctx.socket, ACTIONS.SMFIR_ACCEPT, callback);
	case STATUS_CODES.SMFIS_SKIP:
		return write_command(ctx.socket, ACTIONS.SMFIR_SKIP, callback);
	case STATUS_CODES._SMFIS_OPTIONS:
		var data = new Buffer(MILTER_OPTLEN);
		data.writeUInt32BE(ctx.prot_vers2mta, 0);
		data.writeUInt32BE(ctx.aflags, MILTER_LEN_BYTES);
		data.writeUInt32BE(ctx.pflags2mta, MILTER_LEN_BYTES * 2);

		for(var i = 0; i < MAX_MACROS_ENTRIES; i++) {
			if (!ctx.macrolist[i]) {
				continue;
			}

			var buf = new Buffer(MILTER_LEN_BYTES);
			buf.writeUInt32BE(i);
			data = Buffer.concat([data, buf, new Buffer(ctx.macrolist[i])]);
		}

		// addsymlist
		return write_command(ctx.socket, COMMANDS.SMFIC_OPTNEG, data, callback);
	case STATUS_CODES.SMFIS_NOREPLY:
		if (bit !== 0 &&
			(ctx.pflags & bit) !== 0 &&
			(ctx.mta_pflags & bit) === 0) {
			return write_command(ctx.socket, ACTIONS.SMFIR_CONTINUE, callback);
		}
		break;
	}

	callback(MI_SUCCESS);
};

function get_nr_bit(state) {
	var bit;

	switch(state) {
	case STATES.ST_CONN:
		bit = PROTOCOLS.SMFIP_NR_CONN;
		break;
	case STATES.ST_HELO:
		bit = PROTOCOLS.SMFIP_NR_HELO;
		break;
	case STATES.ST_MAIL:
		bit = PROTOCOLS.SMFIP_NR_MAIL;
		break;
	case STATES.ST_RCPT:
		bit = PROTOCOLS.SMFIP_NR_RCPT;
		break;
	case STATES.ST_DATA:
		bit = PROTOCOLS.SMFIP_NR_DATA;
		break;
	case STATES.ST_UNKN:
		bit = PROTOCOLS.SMFIP_NR_UNKN;
		break;
	case STATES.ST_HDRS:
		bit = PROTOCOLS.SMFIP_NR_HDR;
		break;
	case STATES.ST_EOHS:
		bit = PROTOCOLS.SMFIP_NR_EOH;
		break;
	case STATES.ST_BODY:
		bit = PROTOCOLS.SMFIP_NR_BODY;
		break;
	default:
		bit = 0;
		break;
	}
	return bit;
}

function write_command(socket, cmd, data, callback) {
	logger.debug('write_command called');

	if (util.isFunction(data)) {
		callback = data;
		data = new Buffer(0);
	}

	if (!data) {
		data = new Buffer(0);
	}

	logger.debug('cmd = \'%s\' data length = %d', cmd, data.length);

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
