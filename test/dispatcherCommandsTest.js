var expect = require('chai').expect;
var Context = require('../lib/context').Context;
var Dispatcher = require('../lib/dispatcher').Dispatcher;
var constants = require('../lib/constants');

var SMFIS = constants.SMFIS;
var SMFI_VERSION = constants.SMFI_VERSION;

var getNextStates = require('../lib/dispatcher').getNextStates;
var setNextStates = require('../lib/dispatcher').setNextStates;

describe('Dispatcher commands', function() {
	var next_states;

	beforeEach(function() {
		next_states = getNextStates();
	});

	afterEach(function() {
		setNextStates(next_states);
	});

	describe('abort function', function() {
		it('unset function', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = -1;

			dispatcher.abort(data, macro, function(status) {
				expect(status).to.equal(SMFIS.NOREPLY);
				done();
			});
		});

		it('set function', function(done) {
			var ctx = new Context({
				abort: function(ctx, callback) {
					callback(SMFIS.CONTINUE);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = -1;

			dispatcher.abort(data, macro, function(status) {
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});
	});

	describe('macros function', function() {
		it('arg error 1', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = -1;

			dispatcher.macros(data, macro, function(status) {
				expect(status).to.equal(SMFIS._FAIL);
				done();
			});
		});

		it('arg error 2', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer('abc');
			var macro = -1;

			dispatcher.macros(data, macro, function(status) {
				expect(status).to.equal(SMFIS._FAIL);
				done();
			});
		});

		it('connect macro', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('C'), new Buffer('abc'), new Buffer([0])]);
			var macro = -1;

			dispatcher.macros(data, macro, function(status) {
				expect(status).to.equal(SMFIS._KEEP);
				expect(ctx.mac_buf[0]).to.be.length(1);
				expect(ctx.mac_buf[0].toString()).to.equal('abc');
				done();
			});
		});

		it('helo macro', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('H'), new Buffer('abc'), new Buffer([0])]);
			var macro = -1;

			dispatcher.macros(data, macro, function(status) {
				expect(status).to.equal(SMFIS._KEEP);
				expect(ctx.mac_buf[1]).to.be.length(1);
				expect(ctx.mac_buf[1].toString()).to.equal('abc');
				done();
			});
		});

		it('mail macro', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('M'), new Buffer('abc'), new Buffer([0])]);
			var macro = -1;

			dispatcher.macros(data, macro, function(status) {
				expect(status).to.equal(SMFIS._KEEP);
				expect(ctx.mac_buf[2]).to.be.length(1);
				expect(ctx.mac_buf[2].toString()).to.equal('abc');
				done();
			});
		});

		it('rcpt macro', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('R'), new Buffer('abc'), new Buffer([0])]);
			var macro = -1;

			dispatcher.macros(data, macro, function(status) {
				expect(status).to.equal(SMFIS._KEEP);
				expect(ctx.mac_buf[3]).to.be.length(1);
				expect(ctx.mac_buf[3].toString()).to.equal('abc');
				done();
			});
		});

		it('data macro', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('T'), new Buffer('abc'), new Buffer([0])]);
			var macro = -1;

			dispatcher.macros(data, macro, function(status) {
				expect(status).to.equal(SMFIS._KEEP);
				expect(ctx.mac_buf[4]).to.be.length(1);
				expect(ctx.mac_buf[4].toString()).to.equal('abc');
				done();
			});
		});

		it('eom macro', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('E'), new Buffer('abc'), new Buffer([0])]);
			var macro = -1;

			dispatcher.macros(data, macro, function(status) {
				expect(status).to.equal(SMFIS._KEEP);
				expect(ctx.mac_buf[5]).to.be.length(1);
				expect(ctx.mac_buf[5].toString()).to.equal('abc');
				done();
			});
		});

		it('eoh macro', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('N'), new Buffer('abc'), new Buffer([0])]);
			var macro = -1;

			dispatcher.macros(data, macro, function(status) {
				expect(status).to.equal(SMFIS._KEEP);
				expect(ctx.mac_buf[6]).to.be.length(1);
				expect(ctx.mac_buf[6].toString()).to.equal('abc');
				done();
			});
		});
	});

	describe('bodychunk function', function() {
		it('unset function', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = -1;

			dispatcher.bodychunk(data, macro, function(status) {
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});

		it('set function', function(done) {
			var ctx = new Context({
				body: function(ctx, data, callback) {
					expect(data.toString()).to.equal('abc');
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer('abc');
			var macro = -1;

			dispatcher.bodychunk(data, macro, function(status) {
				expect(status).to.equal(SMFIS.REJECT);
				done();
			});
		});
	});

	describe('connectinfo function', function() {
		it('unset function', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = 0;

			dispatcher.connectinfo(data, macro, function(status) {
				expect(ctx.mac_buf[1]).to.equal(null);
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});

		it('invalid data 1', function(done) {
			var ctx = new Context({
				connect: function(ctx, hostname, addr, port, callback) {
					callback(SMFIS.CONTINUE);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('hostname'), new Buffer([0])]);
			var macro = 0;

			dispatcher.connectinfo(data, macro, function(status) {
				expect(status).to.equal(SMFIS._ABORT);
				done();
			});
		});

		it('invalid data 2', function(done) {
			var ctx = new Context({
				connect: function(ctx, hostname, addr, port, callback) {
					callback(SMFIS.CONTINUE);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('hostname'), new Buffer([0])]);
			data = Buffer.concat([data, new Buffer('4'), new Buffer([0x27, 0x29])]);
			var macro = 0;

			dispatcher.connectinfo(data, macro, function(status) {
				expect(status).to.equal(SMFIS._ABORT);
				done();
			});
		});

		it('invalid data 3', function(done) {
			var ctx = new Context({
				connect: function(ctx, hostname, addr, port, callback) {
					callback(SMFIS.CONTINUE);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('hostname'), new Buffer([0])]);
			data = Buffer.concat([data, new Buffer('4'), new Buffer([0x27, 0x29])]);
			data = Buffer.concat([data, new Buffer('addr')]);
			var macro = 0;

			dispatcher.connectinfo(data, macro, function(status) {
				expect(status).to.equal(SMFIS._ABORT);
				done();
			});
		});

		it('set function', function(done) {
			var ctx = new Context({
				connect: function(ctx, hostname, addr, port, callback) {
					expect(hostname).to.equal('hostname');
					expect(addr).to.equal('addr');
					expect(port).to.equal(10025);
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('hostname'), new Buffer([0])]);
			data = Buffer.concat([data, new Buffer('4'), new Buffer([0x27, 0x29])]);
			data = Buffer.concat([data, new Buffer('addr'), new Buffer([0])]);
			var macro = 0;

			dispatcher.connectinfo(data, macro, function(status) {
				expect(ctx.mac_buf[1]).to.equal(null);
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS.REJECT);
				done();
			});
		});
	});

	describe('bodyend function', function() {
		it('unset both function', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = 5;

			dispatcher.bodyend(data, macro, function(status) {
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});

		it('unset body function', function(done) {
			var ctx = new Context({
				eom: function(ctx, callback) {
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = 5;

			dispatcher.bodyend(data, macro, function(status) {
				expect(status).to.equal(SMFIS.REJECT);
				done();
			});
		});

		it('unset eom function', function(done) {
			var ctx = new Context({
				body: function(ctx, data, callback) {
					expect(data.toString()).to.equal('abc');
					callback(SMFIS.CONTINUE);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer('abc');
			var macro = 5;

			dispatcher.bodyend(data, macro, function(status) {
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});

		it('set function', function(done) {
			var ctx = new Context({
				body: function(ctx, data, callback) {
					expect(data.toString()).to.equal('abc');
					callback(SMFIS.CONTINUE);
				},
				eom: function(ctx, callback) {
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer('abc');
			var macro = 5;

			dispatcher.bodyend(data, macro, function(status) {
				expect(status).to.equal(SMFIS.REJECT);
				done();
			});
		});
	});

	describe('helo function', function() {
		it('unset function', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = 1;

			dispatcher.helo(data, macro, function(status) {
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});

		it('set function', function(done) {
			var ctx = new Context({
				helo: function(ctx, data, callback) {
					expect(data.toString()).to.equal('abc');
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer('abc');
			data = Buffer.concat([data, new Buffer([0])]);
			var macro = 1;

			dispatcher.helo(data, macro, function(status) {
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS.REJECT);
				done();
			});
		});

		it('no data', function(done) {
			var ctx = new Context({
				helo: function(ctx, data, callback) {
					expect(true).to.equal(false);
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = 1;

			dispatcher.helo(data, macro, function(status) {
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS._FAIL);
				done();
			});
		});

		it('no terminator', function(done) {
			var ctx = new Context({
				helo: function(ctx, data, callback) {
					expect(true).to.equal(false);
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer('abc');
			var macro = 1;

			dispatcher.helo(data, macro, function(status) {
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS._FAIL);
				done();
			});
		});
	});

	describe('header function', function() {
		it('unset function', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = -1;

			dispatcher.header(data, macro, function(status) {
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});

		it('set function', function(done) {
			var ctx = new Context({
				header: function(ctx, field, value, callback) {
					expect(field.toString()).to.equal('field');
					expect(value.toString()).to.equal('value');
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('field'), new Buffer([0])]);
			data = Buffer.concat([data, new Buffer('value'), new Buffer([0])]);
			var macro = -1;

			dispatcher.header(data, macro, function(status) {
				expect(status).to.equal(SMFIS.REJECT);
				done();
			});
		});

		it('invalid data', function(done) {
			var ctx = new Context({
				header: function(ctx, field, value, callback) {
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('field')]);
			data = Buffer.concat([data, new Buffer('value')]);
			var macro = -1;

			dispatcher.header(data, macro, function(status) {
				expect(status).to.equal(SMFIS._ABORT);
				done();
			});
		});
	});

	describe('sender function', function() {
		it('unset function', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = 2;

			dispatcher.sender(data, macro, function(status) {
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});

		it('set function', function(done) {
			var ctx = new Context({
				envfrom: function(ctx, data, callback) {
					expect(data.toString()).to.equal('abc');
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('abc'), new Buffer([0])]);
			var macro = 2;

			dispatcher.sender(data, macro, function(status) {
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS.REJECT);
				done();
			});
		});

		it('invalid data', function(done) {
			var ctx = new Context({
				envfrom: function(ctx, field, value, callback) {
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('abc')]);
			var macro = 2;

			dispatcher.sender(data, macro, function(status) {
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS._ABORT);
				done();
			});
		});
	});

	describe('optionneg function', function() {
		it('invalid data', function(done) {
			var ctx = new Context({
				name: 'test'
			});
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = -1;

			dispatcher.optionneg(data, macro, function(status) {
				expect(ctx.mac_buf[0]).to.equal(null);
				expect(ctx.mac_buf[1]).to.equal(null);
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(ctx.prot_vers).to.equal(6);
				expect(status).to.equal(SMFIS._ABORT);
				done();
			});
		});

		it('check for minimum version', function(done) {
			var ctx = new Context({
				name: 'test'
			});
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(12);
			data.writeUInt32BE(1);
			var macro = -1;

			dispatcher.optionneg(data, macro, function(status) {
				expect(ctx.mac_buf[0]).to.equal(null);
				expect(ctx.mac_buf[1]).to.equal(null);
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(ctx.prot_vers).to.equal(6);
				expect(status).to.equal(SMFIS._ABORT);
				done();
			});
		});

		it('unset function', function(done) {
			var ctx = new Context({
				name: 'test',
				version: SMFI_VERSION,
				flags: 0
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(12);
			data.writeUInt32BE(7);
			data.writeUInt32BE(0x0000003F, 4);
			data.writeUInt32BE(0x1000007F, 8);
			var macro = -1;

			dispatcher.optionneg(data, macro, function(status) {
				expect(ctx.mac_buf[0]).to.equal(null);
				expect(ctx.mac_buf[1]).to.equal(null);
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(ctx.prot_vers).to.equal(6);
				expect(ctx.mta_prot_vers).to.equal(7);
				expect(ctx.prot_vers2mta).to.equal(6);
				expect(ctx.mta_aflags).to.equal(0x0000003F);
				expect(ctx.mta_pflags).to.equal(0x1000007F);
				expect(ctx.aflags).to.equal(0);
				expect(ctx.pflags2mta).to.equal(0x1000007F);
				expect(status).to.equal(SMFIS._OPTIONS);
				done();
			});
		});

		it('version = 4', function(done) {
			var ctx = new Context({
				name: 'test',
				version: 4,
				flags: 0,
				negotiate: function(ctx, f1, f2, f3, f4, callback) {
					callback(SMFIS.ALL_OPTS);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(12);
			data.writeUInt32BE(6);
			data.writeUInt32BE(0x0000003F, 4);
			data.writeUInt32BE(0x0000007F, 8);
			var macro = -1;

			dispatcher.optionneg(data, macro, function(status) {
				expect(ctx.mac_buf[0]).to.equal(null);
				expect(ctx.mac_buf[1]).to.equal(null);
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(ctx.prot_vers).to.equal(6);
				expect(ctx.mta_prot_vers).to.equal(6);
				expect(ctx.prot_vers2mta).to.equal(6);
				expect(ctx.mta_aflags).to.equal(0x0000003F);
				expect(ctx.mta_pflags).to.equal(0x0000007F);
				expect(ctx.aflags).to.equal(0);
				expect(ctx.pflags2mta).to.equal(0x0000007F);
				expect(status).to.equal(SMFIS._OPTIONS);
				done();
			});
		});

		it('negotiate ALL_OPTS', function(done) {
			var ctx = new Context({
				name: 'test',
				version: SMFI_VERSION,
				flags: 0,
				negotiate: function(ctx, f1, f2, f3, f4, callback) {
					expect(f1).to.equal(0x0000003F);
					expect(f2).to.equal(0x2000047F|0x0000FF080);
					expect(f3).to.equal(0);
					expect(f4).to.equal(0);
					callback(SMFIS.ALL_OPTS);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(12);
			data.writeUInt32BE(6);
			data.writeUInt32BE(0x0000003F, 4);
			data.writeUInt32BE(0x2000047F, 8);
			var macro = -1;

			dispatcher.optionneg(data, macro, function(status) {
				expect(ctx.mac_buf[0]).to.equal(null);
				expect(ctx.mac_buf[1]).to.equal(null);
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(ctx.prot_vers).to.equal(6);
				expect(ctx.mta_prot_vers).to.equal(6);
				expect(ctx.prot_vers2mta).to.equal(6);
				expect(ctx.mta_aflags).to.equal(0x0000003F);
				expect(ctx.mta_pflags).to.equal(0x2000047F);
				expect(ctx.aflags).to.equal(0x00000003F);
				expect(ctx.pflags2mta).to.equal(0x2000047F);
				expect(status).to.equal(SMFIS._OPTIONS);
				done();
			});
		});

		it('negotiate REJECT', function(done) {
			var ctx = new Context({
				name: 'test',
				version: SMFI_VERSION,
				flags: 0,
				negotiate: function(ctx, f1, f2, f3, f4, callback) {
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(12);
			data.writeUInt32BE(6);
			data.writeUInt32BE(0x0000003F, 4);
			data.writeUInt32BE(0x2000047F, 8);
			var macro = -1;

			dispatcher.optionneg(data, macro, function(status) {
				expect(status).to.equal(SMFIS._ABORT);
				done();
			});
		});

		it('no act ver', function(done) {
			var ctx = new Context({
				name: 'test',
				version: SMFI_VERSION,
				flags: 0,
				negotiate: function(ctx, f1, f2, f3, f4, callback) {
					expect(f1).to.equal(0x000000F);
					expect(f2).to.equal(0x2000007F|0x0000FF080);
					expect(f3).to.equal(0);
					expect(f4).to.equal(0);
					callback(SMFIS.CONTINUE, f1, f2, f3 ,f4);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(12);
			data.writeUInt32BE(6);
			data.writeUInt32BE(0, 4);
			data.writeUInt32BE(0x2000007F, 8);
			var macro = -1;

			dispatcher.optionneg(data, macro, function(status) {
				expect(ctx.mac_buf[0]).to.equal(null);
				expect(ctx.mac_buf[1]).to.equal(null);
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(ctx.prot_vers).to.equal(6);
				expect(ctx.mta_prot_vers).to.equal(6);
				expect(ctx.prot_vers2mta).to.equal(6);
				expect(ctx.mta_aflags).to.equal(0x000000F);
				expect(ctx.mta_pflags).to.equal(0x2000007F);
				expect(ctx.aflags).to.equal(0x000000F);
				expect(ctx.pflags2mta).to.equal(0x2000007F);
				expect(status).to.equal(SMFIS._OPTIONS);
				done();
			});
		});

		it('no prot ver', function(done) {
			var ctx = new Context({
				name: 'test',
				version: SMFI_VERSION,
				flags: 0,
				negotiate: function(ctx, f1, f2, f3, f4, callback) {
					expect(f1).to.equal(0x0000003F);
					expect(f2).to.equal(0x0000003F|0x0000FF080);
					expect(f3).to.equal(0);
					expect(f4).to.equal(0);
					callback(SMFIS.CONTINUE, f1, f2, f3 ,f4);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(12);
			data.writeUInt32BE(6);
			data.writeUInt32BE(0x0000003F, 4);
			data.writeUInt32BE(0, 8);
			var macro = -1;

			dispatcher.optionneg(data, macro, function(status) {
				expect(ctx.mac_buf[0]).to.equal(null);
				expect(ctx.mac_buf[1]).to.equal(null);
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(ctx.prot_vers).to.equal(6);
				expect(ctx.mta_prot_vers).to.equal(6);
				expect(ctx.prot_vers2mta).to.equal(6);
				expect(ctx.mta_aflags).to.equal(0x0000003F);
				expect(ctx.mta_pflags).to.equal(0x0000003F);
				expect(ctx.aflags).to.equal(0x00000003F);
				expect(ctx.pflags2mta).to.equal(0x0000003F);
				expect(status).to.equal(SMFIS._OPTIONS);
				done();
			});
		});

		it('negotiate return invalid aflags', function(done) {
			var ctx = new Context({
				name: 'test',
				version: SMFI_VERSION,
				flags: 0,
				negotiate: function(ctx, f1, f2, f3, f4, callback) {
					expect(f1).to.equal(0x0000003F);
					expect(f2).to.equal(0x2000047F|0x0000FF080);
					f1 = 0x0000007F;
					callback(SMFIS.CONTINUE, f1, f2, f3, f4);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(12);
			data.writeUInt32BE(6);
			data.writeUInt32BE(0x0000003F, 4);
			data.writeUInt32BE(0x2000047F, 8);
			var macro = -1;

			dispatcher.optionneg(data, macro, function(status) {
				expect(status).to.equal(SMFIS._ABORT);
				done();
			});
		});

		it('negotiate return invalid pflags', function(done) {
			var ctx = new Context({
				name: 'test',
				version: SMFI_VERSION,
				flags: 0,
				negotiate: function(ctx, f1, f2, f3, f4, callback) {
					expect(f1).to.equal(0x0000003F);
					expect(f2).to.equal(0x2000047F|0x0000FF080);
					f2 = 0x1FF4FF;
					callback(SMFIS.CONTINUE, f1, f2, f3, f4);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(12);
			data.writeUInt32BE(6);
			data.writeUInt32BE(0x0000003F, 4);
			data.writeUInt32BE(0x2000047F, 8);
			var macro = -1;

			dispatcher.optionneg(data, macro, function(status) {
				expect(status).to.equal(SMFIS._ABORT);
				done();
			});
		});
	});

	describe('eoh function', function() {
		it('unset function', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = 6;

			dispatcher.eoh(data, macro, function(status) {
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});

		it('set function', function(done) {
			var ctx = new Context({
				eoh: function(ctx, callback) {
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer('abc');
			var macro = 6;

			dispatcher.eoh(data, macro, function(status) {
				expect(status).to.equal(SMFIS.REJECT);
				done();
			});
		});
	});

	describe('quit function', function() {
		it('unset function', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = -1;

			dispatcher.quit(data, macro, function(status) {
				expect(ctx.mac_buf[0]).to.equal(null);
				expect(ctx.mac_buf[1]).to.equal(null);
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS._NOREPLY);
				done();
			});
		});

		it('set function', function(done) {
			var ctx = new Context({
				close: function(ctx, callback) {
					callback();
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer('abc');
			var macro = -1;

			dispatcher.quit(data, macro, function(status) {
				expect(ctx.mac_buf[0]).to.equal(null);
				expect(ctx.mac_buf[1]).to.equal(null);
				expect(ctx.mac_buf[2]).to.equal(null);
				expect(ctx.mac_buf[3]).to.equal(null);
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS._NOREPLY);
				done();
			});
		});
	});

	describe('data function', function() {
		it('unset function', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = 4;

			dispatcher.data(data, macro, function(status) {
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});

		it('set function', function(done) {
			var ctx = new Context({
				data: function(ctx, callback) {
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer('abc');
			var macro = 4;

			dispatcher.data(data, macro, function(status) {
				expect(status).to.equal(SMFIS.REJECT);
				done();
			});
		});
	});

	describe('rcpt function', function() {
		it('unset function', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = 3;

			dispatcher.rcpt(data, macro, function(status) {
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});

		it('set function', function(done) {
			var ctx = new Context({
				envrcpt: function(ctx, data, callback) {
					expect(data.toString()).to.equal('abc');
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('abc'), new Buffer([0])]);
			var macro = 3;

			dispatcher.rcpt(data, macro, function(status) {
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS.REJECT);
				done();
			});
		});

		it('invalid data', function(done) {
			var ctx = new Context({
				envrcpt: function(ctx, field, value, callback) {
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			data = Buffer.concat([data, new Buffer('abc')]);
			var macro = 3;

			dispatcher.rcpt(data, macro, function(status) {
				expect(ctx.mac_buf[4]).to.equal(null);
				expect(ctx.mac_buf[5]).to.equal(null);
				expect(ctx.mac_buf[6]).to.equal(null);
				expect(status).to.equal(SMFIS._ABORT);
				done();
			});
		});
	});

	describe('unknown function', function() {
		it('unset function', function(done) {
			var ctx = new Context({
				version: SMFI_VERSION
			});
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = -1;

			dispatcher.unknown(data, macro, function(status) {
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});

		it('set function', function(done) {
			var ctx = new Context({
				version: SMFI_VERSION,
				unknown: function(ctx, data, callback) {
					expect(data.toString()).to.equal('abc');
					callback(SMFIS.REJECT);
				}
			});

			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer('abc');
			var macro = -1;

			dispatcher.unknown(data, macro, function(status) {
				expect(status).to.equal(SMFIS.REJECT);
				done();
			});
		});

		it('version error', function(done) {
			var ctx = new Context({
				version: 2
			});
			var dispatcher = new Dispatcher(ctx);
			var data = new Buffer(0);
			var macro = -1;

			dispatcher.unknown(data, macro, function(status) {
				expect(status).to.equal(SMFIS.CONTINUE);
				done();
			});
		});
	});
});
