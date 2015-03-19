var expect = require('chai').expect;
var sinon = require('sinon');

var Context = require('../lib/context').Context;
var Dispatcher = require('../lib/dispatcher').Dispatcher;
var getNextStates = require('../lib/dispatcher').getNextStates;
var setNextStates = require('../lib/dispatcher').setNextStates;

var constants = require('../lib/constants');
var SMFIS = constants.SMFIS;
var SMFIR = constants.SMFIR;
var SMFIC = constants.SMFIC;
var SMFIP = constants.SMFIP;
var ST = constants.ST;

describe('Dispatcher', function() {
	var next_states;

	beforeEach(function() {
		next_states = getNextStates();
	});

	afterEach(function() {
		setNextStates(next_states);
	});

	it('construnctor', function() {
		var ctx = new Context();
		var dispatcher1 = new Dispatcher(ctx);
		expect(dispatcher1).to.be.an.instanceof(Dispatcher);

		var dispatcher2 = Dispatcher(ctx);
		expect(dispatcher2).to.be.an.instanceof(Dispatcher);
	});

	describe('execute', function() {
		it('one chunk', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(dispatcher, 'dispatch',function(cmd, buf, callback) {
				expect(cmd).to.equal('O');
				expect(buf.toString()).to.equal('abc');
				callback();
			});

			var data = new Buffer(4);
			data.writeUInt32BE(4);
			data = Buffer.concat([data, new Buffer('O')]);
			data = Buffer.concat([data, new Buffer('abc')]);

			dispatcher.execute(data, function() {
				stub.restore();
				done();
			});
		});

		it('two chunk', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(dispatcher, 'dispatch',function(cmd, buf, callback) {
				expect(cmd).to.equal('O');
				expect(buf.toString()).to.equal('abc');
				callback();
			});

			var data = new Buffer(4);
			data.writeUInt32BE(4);
			data = Buffer.concat([data, new Buffer('O')]);

			dispatcher.execute(data, function() {
				var data = new Buffer('abc');
				dispatcher.execute(data, function() {
					stub.restore();
					done();
				});
			});
		});

		it('two command', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(dispatcher, 'dispatch',function(cmd, buf, callback) {
				expect(cmd).to.equal('O');
				expect(buf.toString()).to.equal('abc');
				callback();
			});

			var data = new Buffer(0);

			var len = new Buffer(4);
			len.writeUInt32BE(4);
			data = Buffer.concat([data, len]);
			data = Buffer.concat([data, new Buffer('O')]);
			data = Buffer.concat([data, new Buffer('abc')]);
			data = Buffer.concat([data, len]);
			data = Buffer.concat([data, new Buffer('O')]);
			data = Buffer.concat([data, new Buffer('abc')]);

			dispatcher.execute(data, function(err) {
				stub.restore();
				done();
			});
		});

		it('too big data', function(done) {
			var socketend = false;
			var ctx = new Context();
			ctx.socket = {
				end: function() {
					socketend = true;
				}
			};
			var dispatcher = new Dispatcher(ctx);

			var data = new Buffer(4);
			data.writeUInt32BE((1024 * 1024));
			data = Buffer.concat([data, new Buffer('O')]);
			data = Buffer.concat([data, new Buffer('abc')]);

			dispatcher.execute(data, function() {
				expect(socketend).to.equal(true);
				done();
			});
		});
	});

	describe('sendreply', function() {
		it('CONTINUE', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIR.CONTINUE);
				callback = data;
				callback(0);
			});

			dispatcher.sendreply(SMFIS.CONTINUE, function(result) {
				stub.restore();
				done();
			});
		});

		it('TEMPFAIL 1', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIR.TEMPFAIL);
				callback = data;
				callback(0);
			});

			dispatcher.sendreply(SMFIS.TEMPFAIL, function(result) {
				stub.restore();
				done();
			});
		});

		it('TEMPFAIL 2', function(done) {
			var ctx = new Context();
			ctx.reply = new Buffer('4');
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIR.REPLYCODE);
				callback(0);
			});

			dispatcher.sendreply(SMFIS.TEMPFAIL, function(result) {
				stub.restore();
				done();
			});
		});

		it('REJECT 1', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIR.REJECT);
				callback = data;
				callback(0);
			});

			dispatcher.sendreply(SMFIS.REJECT, function(result) {
				stub.restore();
				done();
			});
		});

		it('REJECT 2', function(done) {
			var ctx = new Context();
			ctx.reply = new Buffer('5');
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIR.REPLYCODE);
				callback(0);
			});

			dispatcher.sendreply(SMFIS.REJECT, function(result) {
				stub.restore();
				done();
			});
		});

		it('DISCARD', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIR.DISCARD);
				callback = data;
				callback(0);
			});

			dispatcher.sendreply(SMFIS.DISCARD, function(result) {
				stub.restore();
				done();
			});
		});

		it('ACCEPT', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIR.ACCEPT);
				callback = data;
				callback(0);
			});

			dispatcher.sendreply(SMFIS.ACCEPT, function(result) {
				stub.restore();
				done();
			});
		});

		it('SKIP', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIR.SKIP);
				callback = data;
				callback(0);
			});

			dispatcher.sendreply(SMFIS.SKIP, function(result) {
				stub.restore();
				done();
			});
		});

		it('_OPTIONS', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);

			ctx.mac_list[0] = 'abc';

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIC.OPTNEG);
				callback(0);
			});

			dispatcher.sendreply(SMFIS._OPTIONS, function(result) {
				stub.restore();
				done();
			});
		});

		it('NOREPLY 1', function(done) {
			var ctx = new Context();
			ctx.state = ST.CONN;
			ctx.pflags = SMFIP.NR_CONN;
			ctx.mta_pflags  = 0;
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIC.CONTINUE);
				callback(0);
			});

			dispatcher.sendreply(SMFIS.NOREPLY, function(result) {
				stub.restore();
				done();
			});
		});

		it('NOREPLY 2', function(done) {
			var ctx = new Context();
			ctx.state = ST.HELO;
			ctx.pflags = SMFIP.NR_HELO;
			ctx.mta_pflags  = 0;
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIC.CONTINUE);
				callback(0);
			});

			dispatcher.sendreply(SMFIS.NOREPLY, function(result) {
				stub.restore();
				done();
			});
		});

		it('NOREPLY 3', function(done) {
			var ctx = new Context();
			ctx.state = ST.MAIL;
			ctx.pflags = SMFIP.NR_MAIL;
			ctx.mta_pflags  = 0;
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIC.CONTINUE);
				callback(0);
			});

			dispatcher.sendreply(SMFIS.NOREPLY, function(result) {
				stub.restore();
				done();
			});
		});

		it('NOREPLY 4', function(done) {
			var ctx = new Context();
			ctx.state = ST.RCPT;
			ctx.pflags = SMFIP.NR_RCPT;
			ctx.mta_pflags  = 0;
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIC.CONTINUE);
				callback(0);
			});

			dispatcher.sendreply(SMFIS.NOREPLY, function(result) {
				stub.restore();
				done();
			});
		});

		it('NOREPLY 5', function(done) {
			var ctx = new Context();
			ctx.state = ST.DATA;
			ctx.pflags = SMFIP.NR_DATA;
			ctx.mta_pflags  = 0;
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIC.CONTINUE);
				callback(0);
			});

			dispatcher.sendreply(SMFIS.NOREPLY, function(result) {
				stub.restore();
				done();
			});
		});

		it('NOREPLY 6', function(done) {
			var ctx = new Context();
			ctx.state = ST.UNKN;
			ctx.pflags = SMFIP.NR_UNKN;
			ctx.mta_pflags  = 0;
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIC.CONTINUE);
				callback(0);
			});

			dispatcher.sendreply(SMFIS.NOREPLY, function(result) {
				stub.restore();
				done();
			});
		});

		it('NOREPLY 7', function(done) {
			var ctx = new Context();
			ctx.state = ST.HDRS;
			ctx.pflags = SMFIP.NR_HDR;
			ctx.mta_pflags  = 0;
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIC.CONTINUE);
				callback(0);
			});

			dispatcher.sendreply(SMFIS.NOREPLY, function(result) {
				stub.restore();
				done();
			});
		});

		it('NOREPLY 8', function(done) {
			var ctx = new Context();
			ctx.state = ST.EOHS;
			ctx.pflags = SMFIP.NR_EOH;
			ctx.mta_pflags  = 0;
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIC.CONTINUE);
				callback(0);
			});

			dispatcher.sendreply(SMFIS.NOREPLY, function(result) {
				stub.restore();
				done();
			});
		});

		it('NOREPLY 9', function(done) {
			var ctx = new Context();
			ctx.state = ST.BODY;
			ctx.pflags = SMFIP.NR_BODY;
			ctx.mta_pflags  = 0;
			var dispatcher = new Dispatcher(ctx);

			var stub = sinon.stub(ctx, 'write_command', function(cmd, data, callback) {
				expect(cmd).to.equal(SMFIC.CONTINUE);
				callback(0);
			});

			dispatcher.sendreply(SMFIS.CONTINUE, function(result) {
				stub.restore();
				done();
			});
		});

		it('NOREPLY 10', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);

			dispatcher.sendreply(SMFIS.NOREPLY, function(result) {
				expect(result).to.equal(0);
				done();
			});
		});

		it('other status', function(done) {
			var ctx = new Context();
			var dispatcher = new Dispatcher(ctx);

			dispatcher.sendreply(SMFIS._NONE, function(result) {
				expect(result).to.equal(0);
				done();
			});
		});
	});
});
