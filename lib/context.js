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

	this._milter = milter || {};
	this._socket = socket;

	this._state = ST.INIT;

	this._mac_buf = new Array(MAX_MACROS_ENTRIES);
	this._mac_list = new Array(MAX_MACROS_ENTRIES);

	this._pflags = 0;
	if (!this._milter._connect) {this._pflags |= SMFIP.NOCONNECT; }
	if (!this._milter._helo) { this._pflags |= SMFIP.NOHELO; }
	if (!this._milter._envfrom) { this._pflags |= SMFIP.NOMAIL; }
	if (!this._milter._envrcpt) { this._pflags |= SMFIP.NORCPT; }
	if (!this._milter._header) { this._pflags |= SMFIP.NOHDRS; }
	if (!this._milter._eoh) { this._pflags |= SMFIP.NOEOH; }
	if (!this._milter._body) { this._pflags |= SMFIP.NOBODY; }
	if (this._milter._version <= 3 || !this._milter._data) {
		this._pflags |= SMFIP.NODATA;
	}
	if (this._milter._version <= 2 || !this._milter._unknown) {
		this._pflags |= SMFIP.NOUNKNOWN;
	}
}
module.exports.Context = Context;

Context.prototype._clear_macros = function(m) {
	for (var i = m; i < MAX_MACROS_ENTRIES; i++) {
		this._mac_buf[i] = null;
	}
};

Context.prototype._socketend = function() {
	if (this._socket) {
		this._socket.end();
	}
};

Context.prototype._write_command = function(cmd, data, callback) {
	debuglog('write_command called');

	if (util.isFunction(data)) {
		callback = data;
		data = new Buffer(0);
	}

	if (!this._socket) {
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

	this._socket.write(buf, function() {
		callback(MI_SUCCESS);
	});
};
