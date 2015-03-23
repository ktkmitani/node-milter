var expect = require('chai').expect;
var Context = require('../lib/context').Context;

describe('Context', function() {
	it('construnctor', function() {
		var ctx1 = new Context();
		expect(ctx1).to.be.an.instanceof(Context);

		var ctx2 = Context();
		expect(ctx2).to.be.an.instanceof(Context);
	});

	it('write_command 1', function(done) {
		var milter = {};
		var socket = {
			write: function(data, encoding, callback) {
				expect(data).to.length(5);
				expect(data.readUInt32BE()).to.equal(1);
				expect(data[4]).to.equal(0x63);
				callback(0);
			}
		};
		var ctx = new Context(milter, socket);

		ctx._write_command('c', function(result) {
			done();
		});
	});

	it('write_command 2', function(done) {
		var milter = {};
		var socket = {
			write: function(data, encoding, callback) {
				expect(data).to.length(9);
				expect(data.readUInt32BE()).to.equal(5);
				expect(data[4]).to.equal(0x4F);
				expect(data[5]).to.equal(0x61);
				expect(data[6]).to.equal(0x62);
				expect(data[7]).to.equal(0x63);
				expect(data[8]).to.equal(0x00);
				callback(0);
			}
		};
		var ctx = new Context(milter, socket);

		var data = new Buffer([0x61, 0x62, 0x63, 0x00]);

		ctx._write_command('O', data, function(result) {
			done();
		});
	});

	it('write_command 3', function(done) {
		var milter = {};
		var socket = {
			write: function(data, encoding, callback) {
				expect(data).to.length(5);
				expect(data.readUInt32BE()).to.equal(1);
				expect(data[4]).to.equal(0x4F);
				callback(0);
			}
		};
		var ctx = new Context(milter, socket);

		ctx._write_command('O', null, function(result) {
			done();
		});
	});

	it('write_command 4', function(done) {
		var milter = {};
		var socket = {};
		var ctx = new Context(milter, socket);

		var data = new Buffer(1024 * 1024);

		ctx._write_command('O', data, function(result) {
			expect(result).to.equal(-1);
			done();
		});
	});

	it('write_command 5', function(done) {
		var milter = {};
		var socket = {
			write: function(data, encoding, callback) {
				expect(data).to.length(9);
				expect(data.readUInt32BE()).to.equal(5);
				expect(data[4]).to.equal(0x79);
				expect(data[5]).to.equal(0x61);
				expect(data[6]).to.equal(0x62);
				expect(data[7]).to.equal(0x63);
				expect(data[8]).to.equal(0x00);
				callback(0);
			}
		};
		var ctx = new Context(milter, socket);

		ctx._write_command('y', 'abc', function(result) {
			done();
		});
	});

	it('write_command 6', function(done) {
		var milter = {};
		var ctx = new Context(milter, null);

		ctx._write_command('c', function(result) {
			expect(result).to.equal(-1);
			done();
		});
	});
});
