var expect = require('chai').expect;
var Context = require('../lib/context').Context;
var Dispatcher = require('../lib/dispatcher').Dispatcher;
var getNextStates = require('../lib/dispatcher').getNextStates;
var setNextStates = require('../lib/dispatcher').setNextStates;

describe('Dispatcher', function() {
	var next_states;

	beforeEach(function() {
		next_states = getNextStates();
	});

	afterEach(function() {
		setNextStates(next_states);
	});

	it('construnctor', function() {
		var ctx = new Context({});
		var dispatcher1 = new Dispatcher(ctx);
		expect(dispatcher1).to.be.an.instanceof(Dispatcher);

		var dispatcher2 = Dispatcher(ctx);
		expect(dispatcher2).to.be.an.instanceof(Dispatcher);
	});

	describe('execute', function() {
		it('one chunk', function(done) {
			var ctx = new Context({});
			var dispatcher = new Dispatcher(ctx);

			dispatcher.__proto__.dispatch = function(cmd, buf, callback) {
				expect(cmd).to.equal('O');
				expect(buf.toString()).to.equal('abc');
				callback();
			}

			var data = new Buffer(4);
			data.writeUInt32BE(4);
			data = Buffer.concat([data, new Buffer('O')]);
			data = Buffer.concat([data, new Buffer('abc')]);

			dispatcher.execute(data, function() {
				done();
			});
		});

		it('two chunk', function(done) {
			var ctx = new Context({});
			var dispatcher = new Dispatcher(ctx);

			dispatcher.__proto__.dispatch = function(cmd, buf, callback) {
				expect(cmd).to.equal('O');
				expect(buf.toString()).to.equal('abc');
				callback();
			}

			var data = new Buffer(4);
			data.writeUInt32BE(4);
			data = Buffer.concat([data, new Buffer('O')]);

			dispatcher.execute(data, function() {
				var data = new Buffer('abc');
				dispatcher.execute(data, function() {
					done();
				});
			});
		});

		it('two command', function(done) {
			var ctx = new Context({});
			var dispatcher = new Dispatcher(ctx);

			dispatcher.__proto__.dispatch = function(cmd, buf, callback) {
				expect(cmd).to.equal('O');
				expect(buf.toString()).to.equal('abc');
				callback();
			}

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
				done();
			});
		});

		it('too big data', function(done) {
			var socketend = false;
			var ctx = new Context({});
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
});
