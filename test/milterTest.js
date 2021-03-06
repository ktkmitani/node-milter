var PassThrough = require('stream').PassThrough;

var expect = require('chai').expect;
var sinon = require('sinon');

var constants = require('../lib/constants');
var MAX_MACROS_ENTRIES = constants.MAX_MACROS_ENTRIES;
var ST = constants.ST;
var SMFIR = constants.SMFIR;
var SMFIF = constants.SMFIF;
var SMFIM = constants.SMFIM;
var MILTER_CHUNK_SIZE = constants.MILTER_CHUNK_SIZE;

var nodemilter = require('../lib/milter');
var Milter = nodemilter.Milter;

describe('milter', function() {
	it('construnctor', function() {
		var milter1 = nodemilter.createMilter();
		expect(milter1).to.be.an.instanceof(Milter);

		var milter2 = new Milter();
		expect(milter2).to.be.an.instanceof(Milter);

		var milter3 = Milter();
		expect(milter3).to.be.an.instanceof(Milter);
	});

	describe('setCallback', function() {
		var milter;
		beforeEach(function() {
			milter = nodemilter.createMilter();
		});

		it('connect', function() {
			milter.setCallback('connect', function() {});
			expect(milter._connect).to.not.equal(undefined);
		});

		it('helo', function() {
			milter.setCallback('helo', function() {});
			expect(milter._helo).to.not.equal(undefined);
		});

		it('envfrom', function() {
			milter.setCallback('envfrom', function() {});
			expect(milter._envfrom).to.not.equal(undefined);
		});

		it('envrcpt', function() {
			milter.setCallback('envrcpt', function() {});
			expect(milter._envrcpt).to.not.equal(undefined);
		});

		it('header', function() {
			milter.setCallback('header', function() {});
			expect(milter._header).to.not.equal(undefined);
		});

		it('eoh', function() {
			milter.setCallback('eoh', function() {});
			expect(milter._eoh).to.not.equal(undefined);
		});

		it('body', function() {
			milter.setCallback('body', function() {});
			expect(milter._body).to.not.equal(undefined);
		});

		it('eom', function() {
			milter.setCallback('eom', function() {});
			expect(milter._eom).to.not.equal(undefined);
		});

		it('abort', function() {
			milter.setCallback('abort', function() {});
			expect(milter._abort).to.not.equal(undefined);
		});

		it('unknown', function() {
			milter.setCallback('unknown', function() {});
			expect(milter._unknown).to.not.equal(undefined);
		});

		it('data', function() {
			milter.setCallback('data', function() {});
			expect(milter._data).to.not.equal(undefined);
		});

		it('negotiate', function() {
			milter.setCallback('negotiate', function() {});
			expect(milter._negotiate).to.not.equal(undefined);
		});

		it('close', function() {
			milter.setCallback('close', function() {});
			expect(milter._close).to.not.equal(undefined);
		});

		it('hoge', function() {
			expect(milter.setCallback.bind(milter, 'hoge', function() {})).to.throw(Error);
		});

		it('name is not string', function() {
			expect(milter.setCallback.bind(milter, 1, function() {})).to.throw(Error);
		});

		it('callback is not function', function() {
			expect(milter.setCallback.bind(milter, 'connect')).to.throw(TypeError);
		});
	});

	describe('setpriv/getpriv', function() {
		var ctx, milter;
		beforeEach(function() {
			ctx = {};
			milter = nodemilter.createMilter();
		});

		it('success', function() {
			var res = milter.setpriv(ctx, {
				name: 'hoge'
			});
			var data = milter.getpriv(ctx);
			expect(res).to.equal(0);
			expect(data.name).to.equal('hoge');
		});

		it('setpriv error', function() {
			var res = milter.setpriv(null, {
				name: 'hoge'
			});
			expect(res).to.equal(-1);
		});

		it('getpriv error', function() {
			var res = milter.setpriv(null, {
				name: 'hoge'
			});
			var data = milter.getpriv(null);
			expect(data.name).to.equal(undefined);
			data = milter.getpriv({});
			expect(data.name).to.equal(undefined);
		});
	});

	describe('getsymval', function() {
		var ctx, milter;
		beforeEach(function() {
			ctx = {};
			milter = nodemilter.createMilter();
		});

		it('success 1', function() {
			ctx._mac_buf = new Array(MAX_MACROS_ENTRIES);
			ctx._mac_buf[5] = ['i', 'value'];

			expect(milter.getsymval(ctx, 'i')).to.equal('value');
		});

		it('success 2', function() {
			ctx._mac_buf = new Array(MAX_MACROS_ENTRIES);
			ctx._mac_buf[5] = ['{i}', 'value'];

			expect(milter.getsymval(ctx, 'i')).to.equal('value');
		});

		it('success 3', function() {
			ctx._mac_buf = new Array(MAX_MACROS_ENTRIES);
			ctx._mac_buf[5] = ['i', 'value'];

			expect(milter.getsymval(ctx, '{i}')).to.equal('value');
		});

		it('error 1', function() {
			expect(milter.getsymval(null, '{i}')).to.equal('');
		});

		it('error 2', function() {
			expect(milter.getsymval(ctx, 1)).to.equal('');
		});
	});

	describe('setreply/setmlreply', function() {
		var ctx, milter;
		beforeEach(function() {
			ctx = {};
			milter = nodemilter.createMilter();
		});

		it('setreply success', function() {
			var res = milter.setreply(ctx, '400', '4.0.0', 'test');
			expect(res).to.equal(0);
			expect(ctx._reply.toString()).to.equal('400 4.0.0 test\r\n\u0000');
		});

		it('setmlreply success 1', function() {
			var res = milter.setmlreply(ctx, '400', '4.0.0', 'test');
			expect(res).to.equal(0);
			expect(ctx._reply.toString()).to.equal('400 4.0.0 test\r\n\u0000');
		});

		it('setmlreply success 2', function() {
			var res = milter.setmlreply(ctx, '400', '4.0.0', 'test', 'test2');
			expect(res).to.equal(0);
			expect(ctx._reply.toString()).to.equal('400-4.0.0 test\r\n400 4.0.0 test2\r\n\u0000');
		});

		it('setmlreply success 3', function() {
			var res = milter.setmlreply(ctx, '400', null, 'test');
			expect(res).to.equal(0);
			expect(ctx._reply.toString()).to.equal('400 4.0.0 test\r\n\u0000');
		});

		it('setmlreply success 4', function() {
			var res = milter.setmlreply(ctx, '500', null, 'test');
			expect(res).to.equal(0);
			expect(ctx._reply.toString()).to.equal('500 5.0.0 test\r\n\u0000');
		});

		it('setreply error', function() {
			var res = milter.setreply(ctx, '400', '4.0.0', 'test', 'test2');
			expect(res).to.equal(-1);
		});

		it('setmlreply error 1', function() {
			var res = milter.setmlreply(null, '400', '4.0.0', 'test', 'test2');
			expect(res).to.equal(-1);
		});

		it('setmlreply error 2', function() {
			var res = milter.setmlreply(ctx, 400, '4.0.0', 'test', 'test2');
			expect(res).to.equal(-1);
		});

		it('setmlreply error 3', function() {
			var res = milter.setmlreply(ctx, '4000', '4.0.0', 'test', 'test2');
			expect(res).to.equal(-1);
		});

		it('setmlreply error 4', function() {
			var res = milter.setmlreply(ctx, '200', '4.0.0', 'test', 'test2');
			expect(res).to.equal(-1);
		});

		it('setmlreply error 5', function() {
			var res = milter.setmlreply(ctx, '400', '3.0.0', 'test', 'test2');
			expect(res).to.equal(-1);
		});
	});

	describe('setsymlist', function() {
		var ctx, milter;
		beforeEach(function() {
			ctx = {};
			ctx._mac_list = new Array(MAX_MACROS_ENTRIES);
			milter = nodemilter.createMilter();
		});

		it('success', function() {
			var macros = ['i', 'j'];
			var res = milter.setsymlist(ctx, SMFIM.CONNECT, macros);
			expect(res).to.equal(0);
			expect(ctx._mac_list[0][0]).to.equal('i');
			expect(ctx._mac_list[0][1]).to.equal('j');
		});

		it('error 1', function() {
			var macros = ['i', 'j'];
			var res = milter.setsymlist(null, SMFIM.CONNECT, macros);
			expect(res).to.equal(-1);
		});

		it('error 2', function() {
			var macros = ['i', 'j'];
			var res = milter.setsymlist(ctx, SMFIM.CONNECT, null);
			expect(res).to.equal(-1);
		});

		it('error 3', function() {
			var macros = ['i', 'j'];
			var res = milter.setsymlist(ctx, SMFIM.CONNECT, 1);
			expect(res).to.equal(-1);
		});

		it('error 4', function() {
			var macros = [1, 2];
			var res = milter.setsymlist(ctx, SMFIM.CONNECT, macros);
			expect(res).to.equal(-1);
		});

		it('error 5', function() {
			var macros = ['i', 'j'];
			var res = milter.setsymlist(ctx, SMFIM.CONNECT, macros);
			res = milter.setsymlist(ctx, SMFIM.CONNECT, macros);
			expect(res).to.equal(-1);
		});

		it('error 6', function() {
			var macros = ['i', 'j'];
			var res = milter.setsymlist(ctx, 7, macros);
			expect(res).to.equal(-1);
		});
	});

	describe('modify functions', function() {
		var ctx, milter, stub;
		beforeEach(function() {
			ctx = {};
			ctx._write_command = function() {};
			ctx._milter = {};
			milter = nodemilter.createMilter();
			stub = sinon.stub(ctx, '_write_command');
		});

		afterEach(function() {
			stub.restore();
		});

		it('addheader 1', function(done) {
			ctx._aflags = SMFIF.ADDHDRS;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addheader(ctx, 'f', 'v', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.ADDHEADER);
				expect(stub.firstCall.args[1].toString()).to.equal('f\u0000v\u0000');
				done();
			});
		});

		it('addheader 2', function(done) {
			ctx._aflags = 0;
			ctx._state = ST.ENDM;
			milter.addheader(ctx, 'f', 'v', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('chgheader 1', function(done) {
			ctx._aflags = SMFIF.CHGHDRS;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.chgheader(ctx, 'f', 1, 'v', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.CHGHEADER);
				expect(stub.firstCall.args[1].readUInt32BE()).to.equal(1);
				expect(stub.firstCall.args[1].toString('ascii', 4)).to.equal('f\u0000v\u0000');
				done();
			});
		});

		it('chgheader 2', function(done) {
			ctx._aflags = 0;
			ctx._state = ST.ENDM;
			milter.chgheader(ctx, 'f', 1, 'v', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('chgheader 3', function(done) {
			ctx._aflags = 0;
			ctx._state = ST.ENDM;
			milter.chgheader(ctx, 'f', -1, 'v', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('insheader 1', function(done) {
			ctx._aflags = SMFIF.ADDHDRS;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.insheader(ctx, 1, 'f', 'v', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.INSHEADER);
				expect(stub.firstCall.args[1].readUInt32BE()).to.equal(1);
				expect(stub.firstCall.args[1].toString('ascii', 4)).to.equal('f\u0000v\u0000');
				done();
			});
		});

		it('insheader 2', function(done) {
			ctx._aflags = 0;
			ctx._state = ST.ENDM;
			milter.insheader(ctx, 1, 'f', 'v', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('insheader 3', function(done) {
			ctx._aflags = 0;
			ctx._state = ST.ENDM;
			milter.insheader(ctx, -1, 'f', 'v', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('chgfrom 1', function(done) {
			ctx._aflags = SMFIF.CHGFROM;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.chgfrom(ctx, 'from', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.CHGFROM);
				expect(stub.firstCall.args[1].toString()).to.equal('from\u0000');
				done();
			});
		});

		it('chgfrom 2', function(done) {
			ctx._aflags = SMFIF.CHGFROM;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.chgfrom(ctx, 'from', 'args', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.CHGFROM);
				expect(stub.firstCall.args[1].toString()).to.equal('from\u0000args\u0000');
				done();
			});
		});

		it('chgfrom 3', function(done) {
			ctx._aflags = 0;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.chgfrom(ctx, 'from', 'args', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('chgfrom 4', function(done) {
			ctx._aflags = SMFIF.CHGFROM;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.chgfrom(ctx, null, 'args', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('chgfrom 5', function(done) {
			ctx._aflags = SMFIF.CHGFROM;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.chgfrom(ctx, 1, 'args', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('addrcpt 1', function(done) {
			ctx._aflags = SMFIF.ADDRCPT;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt(ctx, 'rcpt', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.ADDRCPT);
				expect(stub.firstCall.args[1]).to.equal('rcpt');
				done();
			});
		});

		it('addrcpt 2', function(done) {
			ctx._aflags = 0;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt(ctx, 'rcpt', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('addrcpt 3', function(done) {
			ctx._aflags = SMFIF.ADDRCPT;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt(ctx, 1, function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('addrcpt_par 1', function(done) {
			ctx._aflags = SMFIF.ADDRCPT_PAR;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt_par(ctx, 'rcpt', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.ADDRCPT_PAR);
				expect(stub.firstCall.args[1].toString()).to.equal('rcpt\u0000');
				done();
			});
		});

		it('addrcpt_par 2', function(done) {
			ctx._aflags = SMFIF.ADDRCPT_PAR;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt_par(ctx, 'rcpt', 'args', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.ADDRCPT_PAR);
				expect(stub.firstCall.args[1].toString()).to.equal('rcpt\u0000args\u0000');
				done();
			});
		});

		it('addrcpt_par 3', function(done) {
			ctx._aflags = 0;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt_par(ctx, 'rcpt', 'args', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('addrcpt_par 4', function(done) {
			ctx._aflags = SMFIF.ADDRCPT_PAR;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt_par(ctx, null, 'args', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('addrcpt_par 5', function(done) {
			ctx._aflags = SMFIF.ADDRCPT_PAR;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt_par(ctx, 1, 'args', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('delrcpt 1', function(done) {
			ctx._aflags = SMFIF.DELRCPT;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.delrcpt(ctx, 'rcpt', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.DELRCPT);
				expect(stub.firstCall.args[1]).to.equal('rcpt');
				done();
			});
		});

		it('delrcpt 2', function(done) {
			ctx._aflags = 0;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.delrcpt(ctx, 'rcpt', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('delrcpt 3', function(done) {
			ctx._aflags = SMFIF.DELRCPT;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.delrcpt(ctx, 1, function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('replacebody 1', function(done) {
			ctx._aflags = SMFIF.CHGBODY;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.replacebody(ctx, 'body', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.REPLBODY);
				expect(stub.firstCall.args[1].toString()).to.equal('body');
				done();
			});
		});

		it('replacebody 2', function(done) {
			ctx._aflags = SMFIF.CHGBODY;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.replacebody(ctx, new Buffer('body'), function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.REPLBODY);
				expect(stub.firstCall.args[1].toString()).to.equal('body');
				done();
			});
		});

		it('replacebody 3', function(done) {
			ctx._aflags = 0;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.replacebody(ctx, 'body', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('replacebody 4', function(done) {
			ctx._aflags = SMFIF.CHGBODY;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.replacebody(ctx, 1, function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('replacebody 5', function(done) {
			ctx._aflags = SMFIF.CHGBODY;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);

			var buffer = new Buffer(MILTER_CHUNK_SIZE + 1);
			buffer.fill('1');

			milter.replacebody(ctx, buffer, function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.REPLBODY);
				expect(stub.callCount).to.equal(2);
				done();
			});
		});

		it('replacebody 6', function(done) {
			ctx._aflags = SMFIF.CHGBODY;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);

			var passthrough = new PassThrough();

			milter.replacebody(ctx, passthrough, function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.REPLBODY);
				expect(stub.firstCall.args[1].toString()).to.equal('body');
				done();
			});

			passthrough.write('body');
			passthrough.end();
		});


		it('replacebody 7', function(done) {
			ctx._aflags = SMFIF.CHGBODY;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);

			var buffer = new Buffer(MILTER_CHUNK_SIZE + 1);
			buffer.fill('1');

			var passthrough = new PassThrough();

			milter.replacebody(ctx, passthrough, function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.REPLBODY);
				done();
			});

			passthrough.write(buffer);
			passthrough.end();
		});

		it('progress 1', function(done) {
			stub.callsArgWith(1, 0);
			milter.progress(ctx, function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.PROGRESS);
				done();
			});
		});

		it('progress 2', function(done) {
			stub.callsArgWith(1, 0);
			milter.progress(null, function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('quarantine 1', function(done) {
			ctx._aflags = SMFIF.QUARANTINE;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.quarantine(ctx, 'reason', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.QUARANTINE);
				expect(stub.firstCall.args[1]).to.equal('reason');
				done();
			});
		});

		it('quarantine 2', function(done) {
			ctx._aflags = 0;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.quarantine(ctx, 'reason', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('quarantine 3', function(done) {
			ctx._aflags = SMFIF.QUARANTINE;
			ctx._state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.quarantine(ctx, 1, function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});
	});
});
