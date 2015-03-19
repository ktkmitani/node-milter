var util = require('util');
var debuglog = util.debuglog('nodemilter');
var constants = require('./constants');
var ST = constants.ST;
var SMFIP = constants.SMFIP;
var MAX_MACROS_ENTRIES = constants.MAX_MACROS_ENTRIES;
var MI_SUCCESS = constants.MI_SUCCESS;
var MI_FAILURE = constants.MI_FAILURE;
var MILTER_LEN_BYTES = constants.MILTER_LEN_BYTES;

var getmaxdatasize = require('./dispatcher').getmaxdatasize;

function Context(milter, socket) {
	if (!(this instanceof Context)) {
		return new Context(milter, socket);
	}

	this.milter = milter || {};
	this.socket = socket;

	this.state = ST.INIT;

	this.mac_buf = new Array(MAX_MACROS_ENTRIES);
	this.mac_list = new Array(MAX_MACROS_ENTRIES);

	this.pflags = 0;
	if (!this.milter.connect) {this.pflags |= SMFIP.NOCONNECT; }
	if (!this.milter.helo) { this.pflags |= SMFIP.NOHELO; }
	if (!this.milter.envfrom) { this.pflags |= SMFIP.NOMAIL; }
	if (!this.milter.envrcpt) { this.pflags |= SMFIP.NORCPT; }
	if (!this.milter.header) { this.pflags |= SMFIP.NOHDRS; }
	if (!this.milter.eoh) { this.pflags |= SMFIP.NOEOH; }
	if (!this.milter.body) { this.pflags |= SMFIP.NOBODY; }
	if (this.milter.version <= 3 || !this.milter.data) {
		this.pflags |= SMFIP.NODATA;
	}
	if (this.milter.version <= 2 || !this.milter.unknown) {
		this.pflags |= SMFIP.NOUNKNOWN;
	}
}
module.exports.Context = Context;

Context.prototype.clear_macros = function(m) {
	for(var i = m; i < MAX_MACROS_ENTRIES; i++) {
		this.mac_buf[i] = null;
	}
};

Context.prototype.socketend = function() {
	if (this.socket) {
		this.socket.end();
	}
};

Context.prototype.write_command = function(cmd, data, callback) {
	debuglog('write_command called');

	if (util.isFunction(data)) {
		callback = data;
		data = new Buffer(0);
	}

	if (!this.socket) {
		callback(MI_FAILURE);
		return;
	}

	if (util.isString(data)) {
		data = Buffer.concat([new Buffer(data), new Buffer([0])]);
	}

	if (!data) {
		data = new Buffer(0);
	}

	debuglog('cmd = \'%s\' data length = %d', cmd, data.length);

	if (data.length > getmaxdatasize()) {
		callback(MI_FAILURE);
		return;
	}

	var buf = new Buffer(MILTER_LEN_BYTES);
	buf.writeUInt32BE(data.length + 1);
	buf = Buffer.concat([buf, new Buffer(cmd), data]);

	this.socket.write(buf, 'binary', function() {
		callback(MI_SUCCESS);
	});
};
