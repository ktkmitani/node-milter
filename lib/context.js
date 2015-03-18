var Dispatcher = require('./dispatcher');
var STATES = Dispatcher.STATES;
var PROTOCOLS = Dispatcher.PROTOCOLS;
var MAX_MACROS_ENTRIES = Dispatcher.MAX_MACROS_ENTRIES;

function Context(milter, socket) {
	if (!(this instanceof Context)) {
		return new Context(milter, socket);
	}

	this.milter = milter;
	this.socket = socket;
	this.state = STATES.ST_INIT;
	this.macro = {};
	this.macrolist = new Array(MAX_MACROS_ENTRIES);

	if (!this.milter.connect) { this.pflags |= PROTOCOLS.SMFIP_NOCONNECT; }
	if (!this.milter.helo) { this.pflags |= PROTOCOLS.SMFIP_NOHELO; }
	if (!this.milter.envfrom) { this.pflags |= PROTOCOLS.SMFIP_NOMAIL; }
	if (!this.milter.envrcpt) { this.pflags |= PROTOCOLS.SMFIP_NORCPT; }
	if (!this.milter.header) { this.pflags |= PROTOCOLS.SMFIP_NOHDRS; }
	if (!this.milter.eoh) { this.pflags |= PROTOCOLS.SMFIP_NOEOH; }
	if (!this.milter.body) { this.pflags |= PROTOCOLS.SMFIP_NOBODY; }
	if (this.milter.version <= 3 || !this.milter.data) {
		this.pflags |= PROTOCOLS.SMFIP_NODATA;
	}
	if (this.milter.version <= 2 || !this.milter.unknown) {
		this.pflags |= PROTOCOLS.SMFIP_NOUNKNOWN;
	}
}
module.exports.Context = Context;
