var util = require('util');
var logger = require('winston');
var EventEmitter = require('events').EventEmitter;
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

	EventEmitter.call(this);

	this.name = opts.name || 'Unknown';
	this.version = opts.version || SMFI_VERSION;
	this.flag = opts.flag || 0;
	this.connect = util.isFunction(opts.connect) ? opts.connect : null;
	this.helo = util.isFunction(opts.helo) ? opts.helo : null;
	this.envfrom = util.isFunction(opts.envfrom) ? opts.envfrom : null;
	this.envrcpt = util.isFunction(opts.envrcpt) ? opts.envrcpt : null;
	this.header = util.isFunction(opts.header) ? opts.header : null;
	this.eoh = util.isFunction(opts.eoh) ? opts.eoh : null;
	this.body = util.isFunction(opts.body) ? opts.body : null;
	this.eom = util.isFunction(opts.eom) ? opts.eom : null;
	this.abort = util.isFunction(opts.abort) ? opts.abort : null;
	this.close = util.isFunction(opts.close) ? opts.close : null;
	this.unknown = util.isFunction(opts.unknown) ? opts.unknown : null;
	this.data = util.isFunction(opts.data) ? opts.data : null;
	this.negotiate = util.isFunction(opts.negotiate) ? opts.negotiate : null;

	this.server = net.createServer(connectionListner);
	this.server.milter = this;
}
util.inherits(Milter, EventEmitter);

Milter.prototype.listen = function() {
	net.Server.prototype.listen.apply(this.server, arguments);
};

function connectionListner(socket) {
	var milter = this.milter;

	logger.info('new connection');

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
		logger.debug('socketOnData %d', data.length);
		dispatcher.execute(data);
	}
}
