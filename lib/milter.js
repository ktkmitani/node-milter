var util = require('util');
var debuglog = util.debuglog('nodemilter');
var net = require('net');
var Readable = require('stream').Readable;

var constants = require('./constants');
var SMFI_VERSION = constants.SMFI_VERSION;
var MI_SUCCESS = constants.MI_SUCCESS;
var MI_FAILURE = constants.MI_FAILURE;
var ST = constants.ST;
var SMFIF = constants.SMFIF;
var SMFIR = constants.SMFIR;
var bitset = constants.bitset;
var MAX_MACROS_ENTRIES = constants.MAX_MACROS_ENTRIES;
var MILTER_CHUNK_SIZE = constants.MILTER_CHUNK_SIZE;

var Context = require('./context').Context;
var Dispatcher = require('./dispatcher').Dispatcher;

var MAXREPLYLEN = 980;
var MAXREPLIES = 32;

module.exports.createMilter = function(opts) {
	return new Milter(opts);
};

function Milter(opts) {
	if (!(this instanceof Milter)) {
		return new Milter(opts);
	}

	this._server = net.createServer(connectionListner);
	this._server.milter = this;

	opts = opts || {};
	this._name = opts.name || 'Unknown';
	this._version = opts.version || SMFI_VERSION;
	this._flag = opts.flag || 0;
}
module.exports.Milter = Milter;

Milter.prototype.setCallback = function(name, callback) {
	if (!util.isString(name)) {
		throw new TypeError('first argument must be a string');
	}

	if (!util.isFunction(callback)) {
		throw new TypeError('second argument must be a function');
	}

	switch (name) {
		case 'connect':
		case 'helo':
		case 'envfrom':
		case 'envrcpt':
		case 'header':
		case 'eoh':
		case 'body':
		case 'eom':
		case 'abort':
		case 'unknown':
		case 'data':
		case 'negotiate':
		case 'close':
			this['_' + name] = callback;
			break;
		default:
			throw new Error('%s is not much callback function', name);
	}
};

Milter.prototype.listen = function() {
	net.Server.prototype.listen.apply(this._server, arguments);
};

function connectionListner(socket) {
	var milter = this.milter;

	var ctx = new Context(milter, socket);
	var dispatcher = new Dispatcher(ctx);

	debuglog('[%s] new connection', ctx._id);

	socket.addListener('error', socketOnError);
	socket.on('end', socketOnEnd);
	socket.on('data', socketOnData);

	function socketOnError(e) {
		debuglog('socket error');
	}

	function socketOnEnd() {
		var socket = this;
		if (socket.writable) {
			socket.end();
		}
	}

	function socketOnData(data) {
		debuglog('[%s] socketOnData %d', ctx._id, data.length);
		dispatcher._execute(data);
	}
}

Milter.prototype.getpriv = function(ctx) {
	if (!ctx || !ctx._priv) {
		return {};
	}

	return ctx._priv;
};

Milter.prototype.setpriv = function(ctx, data) {
	if (!ctx) {
		return MI_FAILURE;
	}
	ctx._priv = data;
	return MI_SUCCESS;
};

Milter.prototype.getsymval = function(ctx, symname) {
	if (!ctx || !util.isString(symname)) {
		return '';
	}

	var one = '';
	var braces = '';

	if (symname.length === 3 && symname[0] === '{' && symname[2] === '}') {
		one = symname[1];
	}

	if (symname.length === 1) {
		braces = '{' + symname + '}';
	}

	for (var i = MAX_MACROS_ENTRIES - 1; i >= 0; i--) {
		if (!ctx._mac_buf[i]) {
			continue;
		}

		for (var j = 0; j < ctx._mac_buf[i].length; j += 2) {
			if (ctx._mac_buf[i][j] === symname ||
				ctx._mac_buf[i][j] === one ||
				ctx._mac_buf[i][j] === braces) {
				return ctx._mac_buf[i][j + 1];
			}
		}
	}
};

Milter.prototype.setreply = function() {
	if (arguments.length > 4) {
		return MI_FAILURE;
	}
	return Milter.prototype.setmlreply.apply(this, arguments);
};

Milter.prototype.setmlreply = function() {
	var ctx = arguments[0];
	var rcode = arguments[1];
	var xcode = arguments[2];

	if (!ctx || !util.isString(rcode)) {
		return MI_FAILURE;
	}

	if (!/^(4|5)[0-9]{2}$/.test(rcode)) {
		return MI_FAILURE;
	}

	if (xcode && util.isString(xcode)) {
		if (!/^(2|4|5)\.[0-9]{1,3}\.[0-9]{1,3}$/.test(xcode)) {
			return MI_FAILURE;
		}
	} else {
		if (rcode[0] === '4') {
			xcode = '4.0.0';
		} else if (rcode[0] === '5') {
			xcode = '5.0.0';
		}
	}

	var data = new Buffer(0);
	var args = 0;
	var i, message;
	for (i = 3; i < arguments.length && args < MAXREPLIES; i++) {
		message = arguments[i];

		if (message.length > MAXREPLYLEN) {
			break;
		}

		if (/(\r|\n)/.test(message)) {
			break;
		}

		args++;
	}

	for (i = 0; i < args; i++) {
		message = arguments[i + 3];

		data = Buffer.concat([data, new Buffer(rcode), new Buffer(i === (args - 1) ? ' ' : '-')]);
		data = Buffer.concat([data, new Buffer(xcode), new Buffer(' ')]);
		data = Buffer.concat([data, new Buffer(message), new Buffer('\r\n')]);
	}

	data = Buffer.concat([data, new Buffer([0])]);
	ctx._reply = data;
	return MI_SUCCESS;
};

Milter.prototype.setsymlist = function(ctx, where, macros) {
	if (!ctx || !macros || !util.isArray(macros)) {
		return MI_FAILURE;
	}

	for (var i = 0; i < macros.length; i++) {
		if (!util.isString(macros[i])) {
			return MI_FAILURE;
		}
	}

	if (where < 0 || where >= MAX_MACROS_ENTRIES) {
		return MI_FAILURE;
	}

	if (ctx._mac_list[where]) {
		return MI_FAILURE;
	}

	ctx._mac_list[where] = macros;
	return MI_SUCCESS;
};

Milter.prototype._sendok = function(ctx, flag) {
	if (!ctx || !ctx._milter) {
		return false;
	}

	if (flag !== 0 && !bitset(flag, ctx._aflags)) {
		return false;
	}

	return ctx._state === ST.ENDM;
};

Milter.prototype._modheader = function(ctx, cmd, index, field, value, callback) {
	if (!ctx || !field || !util.isString(field) || !value || !util.isString(value)) {
		callback(MI_FAILURE);
		return;
	}

	var data = new Buffer(0);

	if (index >= 0) {
		var v = new Buffer(4);
		v.writeUInt32BE(index);
		data = Buffer.concat([data, v]);
	}

	data = Buffer.concat([data, new Buffer(field), new Buffer([0])]);
	data = Buffer.concat([data, new Buffer(value), new Buffer([0])]);

	ctx._write_command(cmd, data, callback);
};

Milter.prototype._send2 = function(ctx, cmd, arg0, arg1, callback) {
	if (!ctx || !arg0 || !util.isString(arg0)) {
		callback(MI_FAILURE);
		return;
	}

	var data = new Buffer(0);
	data = Buffer.concat([data, new Buffer(arg0), new Buffer([0])]);

	if (arg1 && util.isString(arg1)) {
		data = Buffer.concat([data, new Buffer(arg1), new Buffer([0])]);
	}

	ctx._write_command(cmd, data, callback);
};

Milter.prototype.addheader = function(ctx, field, value, callback) {
	if (!this._sendok(ctx, SMFIF.ADDHDRS)) {
		callback(MI_FAILURE);
		return;
	}

	this._modheader(ctx, SMFIR.ADDHEADER, -1, field, value, callback);
};

Milter.prototype.chgheader = function(ctx, field, index, value, callback) {
	if (!this._sendok(ctx, SMFIF.CHGHDRS) || index < 0) {
		callback(MI_FAILURE);
		return;
	}

	this._modheader(ctx, SMFIR.CHGHEADER, index, field, value, callback);
};

Milter.prototype.insheader = function(ctx, index, field, value, callback) {
	if (!this._sendok(ctx, SMFIF.ADDHDRS) || index < 0) {
		callback(MI_FAILURE);
		return;
	}

	this._modheader(ctx, SMFIR.INSHEADER, index, field, value, callback);
};

Milter.prototype.chgfrom = function(ctx, from, args, callback) {
	if (!from || !util.isString(from) || !this._sendok(ctx, SMFIF.CHGFROM)) {
		callback(MI_FAILURE);
		return;
	}

	if (util.isFunction(args)) {
		callback = args;
		args = null;
	}

	this._send2(ctx, SMFIR.CHGFROM, from, args, callback);
};

Milter.prototype.addrcpt = function(ctx, rcpt, callback) {
	if (!rcpt || !util.isString(rcpt) || !this._sendok(ctx, SMFIF.ADDRCPT)) {
		callback(MI_FAILURE);
		return;
	}

	ctx._write_command(SMFIR.ADDRCPT, rcpt, callback);
};

Milter.prototype.addrcpt_par = function(ctx, rcpt, args, callback) {
	if (!rcpt || !util.isString(rcpt) || !this._sendok(ctx, SMFIF.ADDRCPT_PAR)) {
		callback(MI_FAILURE);
		return;
	}

	if (util.isFunction(args)) {
		callback = args;
		args = null;
	}

	this._send2(ctx, SMFIR.ADDRCPT_PAR, rcpt, args, callback);
};

Milter.prototype.delrcpt = function(ctx, rcpt, callback) {
	if (!rcpt || !util.isString(rcpt) || !this._sendok(ctx, SMFIF.DELRCPT)) {
		callback(MI_FAILURE);
		return;
	}

	ctx._write_command(SMFIR.DELRCPT, rcpt, callback);
};

Milter.prototype.replacebody = function(ctx, body, callback) {
	if (!body || (!util.isBuffer(body) && !util.isString(body) && !(body instanceof Readable)) ||
		!this._sendok(ctx, SMFIF.CHGBODY)) {
		callback(MI_FAILURE);
		return;
	}

	if (util.isString(body)) {
		body = new Buffer(body);
	}

	if (body instanceof Readable) {
		write_command_stream(ctx, SMFIR.REPLBODY, body, callback);
	} else {
		write_command(ctx, SMFIR.REPLBODY, body, callback);
	}
};

function write_command_stream(ctx, cmd, stream, callback) {
	stream.on('readable', function() {
		function chunk_read() {
			var chunk = stream.read();
			if (chunk) {
				write_command(ctx, cmd, chunk, function(result) {
					if (result !== MI_SUCCESS) {
						callback(result);
					} else {
						chunk_read();
					}
				});
			}
		}

		chunk_read();
	});

	stream.once('error', function() {
		callback(MI_FAILURE);
	});

	stream.once('end', function() {
		callback(MI_SUCCESS);
	});
}

function write_command(ctx, cmd , data, callback) {
	var len = data.length > MILTER_CHUNK_SIZE ? MILTER_CHUNK_SIZE : data.length;

	ctx._write_command(cmd, data.slice(0, len), function(result) {
		if (result === MI_SUCCESS && data.length > len) {
			write_command(ctx, cmd, data.slice(len), callback);
		} else {
			callback(result);
		}
	});
}

Milter.prototype.progress = function(ctx, callback) {
	if (!ctx) {
		callback(MI_FAILURE);
		return;
	}

	ctx._write_command(SMFIR.PROGRESS, callback);
};

Milter.prototype.quarantine = function(ctx, reason, callback) {
	if (!reason || !util.isString(reason) || !this._sendok(ctx, SMFIF.QUARANTINE)) {
		callback(MI_FAILURE);
		return;
	}

	ctx._write_command(SMFIR.QUARANTINE, reason, callback);
};
