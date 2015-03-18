var util = require('util');
var debuglog = util.debuglog('nodemilter');
var net = require('net');

var Context = require('./context').Context;
var Dispatcher = require('./dispatcher').Dispatcher;

module.exports.createMilter = function(opts) {
	return new Milter(opts);
};

function Milter(opts) {
	if (!(this instanceof Milter)) {
		return new Milter(opts);
	}

	this.server = net.createServer(connectionListner);
	this.server.milter = this;

	this.name = opts.name || 'Unknown';
	this.version = opts.version || SMFI_VERSION;
	this.flag = opts.flag || 0;
}

Milter.prototype.setCallback = function(name, callback) {
	if (!util.isString(name)) {
		throw new TypeError('first argument must be a string');
	}

	if (!util.isFunction(callback)) {
		throw new TypeError('second argument must be a function');
	}

	switch(name) {
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
		this[name] = callback;
		break;
	default:
		throw new Error('%s is not much callback function', name);
	}
};

Milter.prototype.listen = function() {
	net.Server.prototype.listen.apply(this.server, arguments);
};

function connectionListner(socket) {
	var milter = this.milter;

	debuglog('new connection');

	var ctx = new Context(milter, socket);
	var dispatcher = new Dispatcher(ctx);

	socket.addListener('error', socketOnError);
	socket.on('end', socketOnEnd);
	socket.on('data', socketOnData);

	function socketOnError(e) {
		var socket = this;
	}

	function socketOnEnd() {
		var socket = this;
		if (socket.writable) {
			socket.end();
		}
	}

	function socketOnData(data) {
		debuglog('socketOnData %d', data.length);
		dispatcher.execute(data);
	}
}
