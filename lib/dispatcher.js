var util = require('util');
var debuglog = util.debuglog('nodemilter');
var async = require('async');

var constants = require('./constants');
var SMFIS = constants.SMFIS;

var SMFI_VERSION = constants.SMFI_VERSION;
var SMFI_VERSION_MDS = 0x01000002;

var MI_CONTINUE = 1;
var MI_SUCCESS = constants.MI_SUCCESS;
var MI_FAILURE = constants.MI_FAILURE;

var MILTER_LEN_BYTES = constants.MILTER_LEN_BYTES;

var MILTER_OPTLEN = (MILTER_LEN_BYTES * 3);
var MILTER_MDS_64K = ((64 * 1024) - 1);
var MILTER_MDS_256K = ((256 * 1024) - 1);
var MILTER_MDS_1M = ((1024 * 1024) - 1);

var SMFI_V1_ACTS = 0x0000000F;	// The actions of V1 filter
var SMFI_V2_ACTS = 0x0000003F;	// The actions of V2 filter
var SMFI_CURR_ACTS = 0x000001FF;// actions of current version

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

var SMFIC = constants.SMFIC;
var SMFIR = constants.SMFIR;
var SMFIP = constants.SMFIP;

/* possible values for cm_todo */
var CT_CONT = 0x0000;	/* continue reading commands */
var CT_IGNO = 0x0001;	/* continue even when error  */

/* not needed right now, done via return code instead */
var CT_KEEP = 0x0004;	/* keep buffer (contains symbols) */
var CT_END = 0x0008;	/* last command of session, stop replying */

var CI_NONE = -1;
var CI_CONN = 0;
var CI_HELO = 1;
var CI_MAIL = 2;
var CI_RCPT = 3;
var CI_DATA = 4;
var CI_EOM = 5;
var CI_EOH = 6;

var ST = constants.ST;

function ST_IN_MAIL(st) {
	return (st >= ST.MAIL && st < ST.ENDM);
}
var bitset = constants.bitset;

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
	{ cmd: SMFIC.ABORT,   next: ST.ABRT, todo: CT_CONT, macro: CI_NONE, func: '_abort' },
	{ cmd: SMFIC.MACRO,   next: ST.NONE, todo: CT_KEEP, macro: CI_NONE, func: '_macros' },
	{ cmd: SMFIC.BODY,    next: ST.BODY, todo: CT_CONT, macro: CI_NONE, func: '_bodychunk' },
	{ cmd: SMFIC.CONNECT, next: ST.CONN, todo: CT_CONT, macro: CI_CONN, func: '_connectinfo' },
	{ cmd: SMFIC.BODYEOB, next: ST.ENDM, todo: CT_CONT, macro: CI_EOM,  func: '_bodyend' },
	{ cmd: SMFIC.HELO,    next: ST.HELO, todo: CT_CONT, macro: CI_HELO, func: '_helo' },
	{ cmd: SMFIC.HEADER,  next: ST.HDRS, todo: CT_CONT, macro: CI_NONE, func: '_header' },
	{ cmd: SMFIC.MAIL,    next: ST.MAIL, todo: CT_CONT, macro: CI_MAIL, func: '_sender' },
	{ cmd: SMFIC.OPTNEG,  next: ST.OPTS, todo: CT_CONT, macro: CI_NONE, func: '_optionneg' },
	{ cmd: SMFIC.EOH,     next: ST.EOHS, todo: CT_CONT, macro: CI_EOH,  func: '_eoh' },
	{ cmd: SMFIC.QUIT,    next: ST.QUIT, todo: CT_END,  macro: CI_NONE, func: '_quit' },
	{ cmd: SMFIC.DATA,    next: ST.DATA, todo: CT_CONT, macro: CI_DATA, func: '_data' },
	{ cmd: SMFIC.RCPT,    next: ST.RCPT, todo: CT_IGNO, macro: CI_RCPT, func: '_rcpt' },
	{ cmd: SMFIC.UNKNOWN, next: ST.UNKN, todo: CT_IGNO, macro: CI_NONE, func: '_unknown' },
	{ cmd: SMFIC.QUIT_NC, next: ST.Q_NC, todo: CT_CONT, macro: CI_NONE, func: '_quit' },
];

var MILTER_MAX_DATA_SIZE = 65535; // default milter command data limit
var Maxdatasize = MILTER_MAX_DATA_SIZE;

function setmaxdatasize(sz) {
	var old = Maxdatasize;
	Maxdatasize = sz;
	return old;
}
module.exports.getmaxdatasize = function() {
	return Maxdatasize;
};

var MAX_MACROS_ENTRIES = constants.MAX_MACROS_ENTRIES;

function Dispatcher(ctx) {
	if (!(this instanceof Dispatcher)) {
		return new Dispatcher(ctx);
	}

	this._ctx = ctx;
	this._curstate = ctx._state;
	this._buffer = null;

	ctx._clear_macros(0);
	fix_stm(ctx);
}
module.exports.Dispatcher = Dispatcher;

Dispatcher.prototype._execute = function(data, callback) {
	var self = this;
	var ctx = this._ctx;
	callback = callback || function() {};

	if (self._buffer) {
		data = Buffer.concat([self._buffer, data]);
		self._buffer = null;
	}

	if (data.length > MILTER_LEN_BYTES) {
		var len = data.readUInt32BE();
		if (len > Maxdatasize) {
			debuglog('too big data size');
			ctx._socketend();
			callback();
		} else if (data.length >= (MILTER_LEN_BYTES + len)) {
			var cmd = String.fromCharCode(data[MILTER_LEN_BYTES]);
			var buf = data.slice(MILTER_LEN_BYTES + 1, MILTER_LEN_BYTES + len);

			self._dispatch(cmd, buf, function(err) {
				data = data.slice(MILTER_LEN_BYTES + len);
				self._execute(data, callback);
			});
		} else {
			self._buffer = data;
			callback();
		}
	} else {
		self._buffer = data;
		callback();
	}
};

Dispatcher.prototype._dispatch = function(cmd, data, callback) {
	var self = this;
	var ctx = this._ctx;
	var fi_abort = ctx._milter._abort;
	var call_abort = ST_IN_MAIL(self._curstate);
	callback = callback || function() {};

	debuglog('got cmd \'%s\' len %d', cmd, data.length);

	var index = -1;

	async.waterfall([
		function(callback) {
			for (var i = 0; i < cmds.length; i++) {
				if (cmds[i].cmd === cmd) {
					index = i;
					break;
				}
			}

			if (index < 0) {
				debuglog('cmd \'%s\' unknown', cmd);
				callback(MI_FAILURE);
				return;
			}
			callback();
		},
		function(callback) {
			var newstate = cmds[index].next;
			debuglog('cur %d new %d nextmask %s',
				self._curstate, newstate,
				next_states[self._curstate].toString(16));

			if (newstate !== ST.NONE && !trans_ok(self._curstate, newstate)) {

				debuglog('abort: cur %d (%s) new %d (%s) next %s',
					self._curstate, MI_MASK(self._curstate).toString(16),
					newstate, MI_MASK(newstate).toString(16),
					next_states[self._curstate].toString(16));

				if (fi_abort && call_abort) {
					fi_abort(ctx, function() {});
				}

				self._curstate = ST.HELO;
				if (!trans_ok(self._curstate, newstate)) {
					callback(MI_CONTINUE);
					return;
				}
			}
			callback(null, newstate);
		},
		function(newstate, callback) {
			if (newstate !== ST.NONE) {
				self._curstate = newstate;
				ctx._state = self._curstate;
			}
			call_abort = ST_IN_MAIL(self._curstate);

			var macro = cmds[index].macro;
			self[cmds[index].func](data, macro, function(status) {
				debuglog('status = %d', status);
				callback(null, status);
			});
		},
		function(status, callback) {
			self._sendreply(status, function(result) {
				if (result !== MI_SUCCESS) {
					callback(MI_FAILURE);
					return;
				}

				if (status === SMFIS.ACCEPT) {
					self._curstate = ST.HELO;
				} else if (status === SMFIS.REJECT ||
					status === SMFIS.DISCARD ||
					status === SMFIS.TEMPFAIL) {
					if (!bitset(CT_IGNO, cmds[index].todo)) {
						this._curstate = ST.HELO;
					}
				} else if (status === SMFIS._ABORT) {
					callback(MI_FAILURE);
					return;
				}

				callback(MI_SUCCESS);
			});
		}
	], function(err) {
		if (err && (err === MI_FAILURE || err === MI_SUCCESS)) {
			ctx._state = self._curstate;

			if (err === MI_FAILURE) {
				if (fi_abort && call_abort) {
					fi_abort(ctx, function() {});
				}
			}

			if (ctx._state !== ST.QUIT) {
				var fi_close = ctx._milter._close;
				if (fi_close) {
					fi_close(ctx, function() {});
				}
			}

			if (err === MI_FAILURE || ctx._state === ST.QUIT) {
				ctx._socketend();
			}

			ctx._clear_macros(0);
		}

		callback(err);
	});
};

Dispatcher.prototype._abort = function(data, macro, callback) {
	debuglog('abort called');

	var ctx = this._ctx;
	var fi_abort = ctx._milter._abort;

	if (fi_abort) {
		fi_abort(ctx, callback);
		return;
	}

	callback(SMFIS._NOREPLY);
};

Dispatcher.prototype._macros = function(data, macro, callback) {
	debuglog('macros called');

	var ctx = this._ctx;

	if (data.length < 1) {
		callback(SMFIS._FAIL);
		return;
	}

	var argv = dec_argv(data, 1);
	if (argv.length === 0) {
		callback(SMFIS._FAIL);
		return;
	}

	var index;
	switch (String.fromCharCode(data[0])) {
		case SMFIC.CONNECT:
			index = CI_CONN;
			break;
		case SMFIC.HELO:
			index = CI_HELO;
			break;
		case SMFIC.MAIL:
			index = CI_MAIL;
			break;
		case SMFIC.RCPT:
			index = CI_RCPT;
			break;
		case SMFIC.DATA:
			index = CI_DATA;
			break;
		case SMFIC.BODYEOB:
			index = CI_EOM;
			break;
		case SMFIC.EOH:
			index = CI_EOH;
			break;
		default:
			callback(SMFIS._FAIL);
			return;
	}

	ctx._mac_buf[index] = argv;
	callback(SMFIS._KEEP);
};

Dispatcher.prototype._bodychunk = function(data, macro, callback) {
	debuglog('bodychunk called');

	var ctx = this._ctx;
	var fi_body = ctx._milter._body;

	if (fi_body) {
		fi_body(ctx, data, callback);
		return;
	}

	callback(SMFIS.CONTINUE);
};

Dispatcher.prototype._connectinfo = function(data, macro, callback) {
	debuglog('connectinfo called');

	var ctx = this._ctx;
	var fi_connect = ctx._milter._connect;

	ctx._clear_macros(macro + 1);

	if (!fi_connect) {
		callback(SMFIS.CONTINUE);
		return;
	}

	var i = 0;
	while (data[i] !== 0 && i < data.length) {
		i++;
	}

	if ((i + 1) >= data.length) {
		callback(SMFIS._ABORT);
		return;
	}

	var hostname = data.toString('ascii', 0, i);
	var port, address;

	i++;
	var family = data[i++];
	if (family !== SMFIA_UNKNOWN) {
		if (i + 2 >= data.length) {
			debuglog('connect: wrong len %d >= %d', i, data.length);
			callback(SMFIS._ABORT);
			return;
		}

		port = data.readUInt16BE(i);
		i += 2;

		if (data[data.length - 1] !== 0) {
			callback(SMFIS._ABORT);
			return;
		}

		address = data.toString('ascii', i, (data.length - 1));
	}

	fi_connect(ctx, hostname, address, port, callback);
};

Dispatcher.prototype._bodyend = function(data, macro, callback) {
	debuglog('bodyend called');

	var self = this;
	var ctx = this._ctx;
	var fi_body = ctx._milter._body;
	var fi_eom = ctx._milter._eom;

	function bodyend(callback) {
		if (fi_eom) {
			fi_eom(ctx, callback);
			return;
		}

		callback(SMFIS.CONTINUE);
	}

	if (fi_body && data.length > 0) {
		fi_body(ctx, data, function(status) {
			if (status !== SMFIS.CONTINUE) {
				self._sendreply(status, function(result) {
					if (result !== MI_SUCCESS) {
						callback(SMFIS._ABORT);
					} else {
						bodyend(callback);
					}
				});
			} else {
				bodyend(callback);
			}
		});
	} else {
		bodyend(callback);
	}
};

Dispatcher.prototype._helo = function(data, macro, callback) {
	debuglog('helo called');

	var ctx = this._ctx;
	var fi_helo = ctx._milter._helo;

	ctx._clear_macros(macro + 1);

	if (fi_helo) {
		if (data.length === 0 || data[data.length - 1] !== 0) {
			callback(SMFIS._FAIL);
			return;
		}

		data = dec_argv(data)[0];
		fi_helo(ctx, data, callback);
		return;
	}

	callback(SMFIS.CONTINUE);
};

Dispatcher.prototype._header = function(data, macro, callback) {
	debuglog('header called');

	var ctx = this._ctx;
	var fi_header = ctx._milter._header;

	if (!fi_header) {
		callback(SMFIS.CONTINUE);
		return;
	}

	var elem = dec_argv(data);
	if (elem.length !== 2) {
		callback(SMFIS._ABORT);
		return;
	}

	fi_header(ctx, elem[0], elem[1], callback);
};

Dispatcher.prototype._sender = function(data, macro, callback) {
	debuglog('sender called');

	var ctx = this._ctx;
	var fi_envfrom = ctx._milter._envfrom;

	ctx._clear_macros(macro + 1);

	if (!fi_envfrom) {
		callback(SMFIS.CONTINUE);
		return;
	}

	var argv = dec_argv(data);
	if (argv.length === 0) {
		callback(SMFIS._ABORT);
		return;
	}

	fi_envfrom(ctx, argv, callback);
};

Dispatcher.prototype._optionneg = function(data, macro, callback) {
	debuglog('optionneg called');

	var self = this;
	var ctx = this._ctx;
	var fi_negotiate = ctx._milter._negotiate;

	ctx._clear_macros(macro + 1);

	var SMFI_PROT_VERSION = 6;
	ctx._prot_vers = SMFI_PROT_VERSION;

	if (data.length < MILTER_OPTLEN) {
		debuglog('%s: optionneg: len too short %d < %d',
			ctx._milter._name, data.length, MILTER_OPTLEN);
		callback(SMFIS._ABORT);
		return;
	}

	var v;
	var SMFI_PROT_VERSION_MIN = 2;
	v = data.readUInt32BE(0);
	if (v < SMFI_PROT_VERSION_MIN) {
		debuglog('%s: optionneg: protocol version too old %d < %d',
			ctx._milter._name, v, SMFI_PROT_VERSION_MIN);
		callback(SMFIS._ABORT);
		return;
	}

	ctx._mta_prot_vers = v;
	if (ctx._prot_vers < ctx._mta_prot_vers) {
		ctx._prot_vers2mta = ctx._prot_vers;
	} else {
		ctx._prot_vers2mta = ctx._mta_prot_vers;
	}

	v = data.readUInt32BE(4);
	if (v === 0) {
		v = SMFI_V1_ACTS;
	}
	ctx._mta_aflags = v;

	var internal_pflags = 0;
	v = data.readUInt32BE(8);
	if (v === 0) {
		v = SMFI_V1_PROT;
	} else if (ctx._milter._version >= SMFI_VERSION_MDS) {
		if (bitset(SMFIP.MDS_1M, v)) {
			internal_pflags |= SMFIP.MDS_1M;
			setmaxdatasize(MILTER_MDS_1M);
		} else if (bitset(SMFIP.MDS_256K, v)) {
			internal_pflags |= SMFIP.MDS_256K;
			setmaxdatasize(MILTER_MDS_256K);
		}
	}
	ctx._mta_pflags = (v & ~SMFI_INTERNAL) | internal_pflags;

	ctx._aflags = ctx._milter._flags;
	var fake_pflags = SMFIP.NR_CONN
		| SMFIP.NR_HELO | SMFIP.NR_MAIL | SMFIP.NR_RCPT
		| SMFIP.NR_DATA | SMFIP.NR_UNKN | SMFIP.NR_HDR
		| SMFIP.NR_EOH | SMFIP.NR_BODY;

	if (ctx._milter._version > 4 && fi_negotiate) {
		var aflags, pflags, f2, f3;
		f2 = f3 = 0;
		aflags = ctx._mta_aflags;
		pflags = ctx._pflags;
		if ((SMFIP.SKIP & ctx._mta_pflags) !== 0) {
			pflags |= SMFIP.SKIP;
		}

		fi_negotiate(ctx,
			ctx._mta_aflags, ctx._mta_pflags | fake_pflags, 0, 0,
			function(status, aflags, pflags, f2, f3) {
				if (status === SMFIS.ALL_OPTS) {
					ctx._aflags = ctx._mta_aflags;
					ctx._pflags2mta = ctx._pflags;
					if ((SMFIP.SKIP & ctx._mta_pflags) !== 0) {
						ctx._pflags2mta |= SMFIP.SKIP;
					}
				} else if (status !== SMFIS.CONTINUE) {
					debuglog('%s: negotiate returned %d (protocol options=0x%s, SMFIR=0x%s)',
						ctx._milter._name, status,
						ctx._mta_pflags.toString(16), ctx._mta_aflags.toString(16));
					callback(SMFIS._ABORT);
					return;
				} else {
					ctx._aflags = aflags;
					ctx._pflags = pflags;
					ctx._pflags2mta = pflags;
				}

				var i = ctx._pflags2mta;
				var idx, b;
				if ((ctx._mta_pflags & i) !== i) {
					for (idx = 0; idx < 32; idx++) {
						b = 1 << idx;
						if ((ctx._mta_pflags & b) !== b &&
							(fake_pflags & b) === b) {
							ctx._pflags2mta &= ~b;
						}
					}
				}

				optionneg(callback);
			}
		);
	} else {
		ctx._pflags2mta = ctx._pflags;
		optionneg(callback);
	}

	function optionneg(callback) {
		var i;

		i = ctx._aflags;
		if ((i & ctx._mta_aflags) !== i) {
			callback(SMFIS._ABORT);
			return;
		}

		i = ctx._pflags2mta;
		if ((i & ctx._mta_pflags) !== i) {
			if (bitset(SMFIP.NODATA, ctx._pflags2mta) &&
				!bitset(SMFIP.NODATA, ctx._mta_pflags)) {
				ctx._pflags2mta &= ~SMFIP.NODATA;
			}

			if (bitset(SMFIP.NOUNKNOWN, ctx._pflags2mta) &&
				!bitset(SMFIP.NOUNKNOWN, ctx._mta_pflags)) {
				ctx._pflags2mta &= ~SMFIP.NOUNKNOWN;
			}

			i = ctx._pflags2mta;
		}

		if ((ctx._mta_pflags & i) != i) {
			callback(SMFIS._ABORT);
			return;
		}
		fix_stm(ctx);

		debuglog('milter_negotiate: mta_actions=0x%s, mta_flags=0x%s actions=0x%s, flags=0x%s',
			ctx._mta_aflags.toString(16), ctx._mta_pflags.toString(16),
			ctx._aflags.toString(16), ctx._pflags.toString(16));

		ctx._pflags2mta = (ctx._pflags2mta & ~SMFI_INTERNAL) | internal_pflags;
		callback(SMFIS._OPTIONS);
	}
};

Dispatcher.prototype._eoh = function(data, macro, callback) {
	debuglog('eoh called');

	var ctx = this._ctx;
	var fi_eoh = ctx._milter._eoh;

	if (fi_eoh) {
		fi_eoh(ctx, callback);
		return;
	}

	callback(SMFIS.CONTINUE);
};

Dispatcher.prototype._quit = function(data, macro, callback) {
	debuglog('quit called');

	var ctx = this._ctx;
	var fi_close = ctx._milter._close;

	function close(callback) {
		ctx._clear_macros(0);

		callback(SMFIS._NOREPLY);
	}

	if (fi_close) {
		fi_close(ctx, function() {
			close(callback);
		});
	} else {
		close(callback);
	}
};

Dispatcher.prototype._data = function(data, macro, callback) {
	debuglog('data called');

	var ctx = this._ctx;
	var fi_data = ctx._milter._data;

	if (fi_data) {
		fi_data(ctx, callback);
		return;
	}

	callback(SMFIS.CONTINUE);
};

Dispatcher.prototype._rcpt = function(data, macro, callback) {
	debuglog('rcpt called');

	var ctx = this._ctx;
	var fi_envrcpt = ctx._milter._envrcpt;

	ctx._clear_macros(macro + 1);

	if (!fi_envrcpt) {
		callback(SMFIS.CONTINUE);
		return;
	}

	var argv = dec_argv(data);
	if (argv.length === 0) {
		callback(SMFIS._ABORT);
		return;
	}

	fi_envrcpt(ctx, argv, callback);
};

Dispatcher.prototype._unknown = function(data, macro, callback) {
	debuglog('unknown called');

	var ctx = this._ctx;
	var fi_unknown = ctx._milter._unknown;

	if (ctx._milter._version > 2 && fi_unknown) {
		fi_unknown(ctx, data, callback);
		return;
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

	} while (s < SIZE_NEXT_STATES);
	return false;
};

var dec_argv = module.exports._dec_argv = function(data, offset) {
	offset = offset || 0;

	var start, end;
	var elem = [];
	for (start = offset, end = 0; end < data.length; end++) {
		if (data[end] === 0) {
			elem.push(data.slice(start, end).toString());
			start = end + 1;
		}
	}
	return elem;
};

var fix_stm = module.exports._fix_stm = function(ctx) {
	var fl = ctx._pflags;
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

Dispatcher.prototype._sendreply = function(status, callback) {
	debuglog('sendreply called');

	var ctx = this._ctx;

	var bit = get_nr_bit(ctx._state);
	if (bit !== 0 && (ctx._pflags & bit) !== 0 && status !== SMFIS.NOREPLY) {
		if (status >= SMFIS.CONTINUE && status < SMFIS._KEEP) {
			debuglog('%s: milter claimed not to reply in state %d but did anyway %d',
				ctx._milter._name, ctx._state, status);
		}

		switch (status) {
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

	switch (status) {
		case SMFIS.CONTINUE:
			ctx._write_command(SMFIR.CONTINUE, callback);
			return;
		case SMFIS.TEMPFAIL:
		case SMFIS.REJECT:
			if (ctx._reply &&
				((status === SMFIS.TEMPFAIL && ctx._reply[0] === 0x34) ||
					(status === SMFIS.REJECT && ctx._reply[0] === 0x35))) {
				ctx._write_command(SMFIR.REPLYCODE, ctx._reply, function(result) {
					ctx._replay = null;
					callback(result);
				});
			} else {
				ctx._write_command(
					status === SMFIS.REJECT ? SMFIR.REJECT : SMFIR.TEMPFAIL,
					callback
				);
			}
			return;
		case SMFIS.DISCARD:

			ctx._write_command(SMFIR.DISCARD, callback);
			return;
		case SMFIS.ACCEPT:
			ctx._write_command(SMFIR.ACCEPT, callback);
			return;
		case SMFIS.SKIP:
			ctx._write_command(SMFIR.SKIP, callback);
			return;
		case SMFIS._OPTIONS:
			var data = new Buffer(MILTER_OPTLEN);
			data.writeUInt32BE(ctx._prot_vers2mta, 0);
			data.writeUInt32BE(ctx._pflags2mta, MILTER_LEN_BYTES * 2);
			data.writeUInt32BE(ctx._aflags, MILTER_LEN_BYTES);

			for (var i = 0; i < MAX_MACROS_ENTRIES; i++) {
				if (!ctx._mac_list[i]) {
					continue;
				}

				var buf = new Buffer(MILTER_LEN_BYTES);
				buf.writeUInt32BE(i);
				data = Buffer.concat([data, buf, new Buffer(ctx._mac_list[i])]);
			}

			ctx._write_command(SMFIC.OPTNEG, data, callback);
			return;
		case SMFIS.NOREPLY:
			if (bit !== 0 &&
				(ctx._pflags & bit) !== 0 &&
				(ctx._mta_pflags & bit) === 0) {
				ctx._write_command(SMFIR.CONTINUE, callback);
				return;
			}
			break;
	}

	callback(MI_SUCCESS);
};

function get_nr_bit(state) {
	var bit;

	switch (state) {
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
