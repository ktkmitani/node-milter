var constants = require('./constants');
var ST = constants.ST;
var SMFIP = constants.SMFIP;
var MAX_MACROS_ENTRIES = constants.MAX_MACROS_ENTRIES;

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
