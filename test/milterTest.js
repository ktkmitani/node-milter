var expect = require('chai').expect;
var sinon = require('sinon');

var constants = require('../lib/constants');
var MAX_MACROS_ENTRIES = constants.MAX_MACROS_ENTRIES;
var ST = constants.ST;
var SMFIR = constants.SMFIR;
var SMFIF = constants.SMFIF;
var SMFIM = constants.SMFIM;

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
			expect(milter.connect).to.not.equal(undefined);
		});

		it('helo', function() {
			milter.setCallback('helo', function() {});
			expect(milter.helo).to.not.equal(undefined);
		});

		it('envfrom', function() {
			milter.setCallback('envfrom', function() {});
			expect(milter.envfrom).to.not.equal(undefined);
		});

		it('envrcpt', function() {
			milter.setCallback('envrcpt', function() {});
			expect(milter.envrcpt).to.not.equal(undefined);
		});

		it('header', function() {
			milter.setCallback('header', function() {});
			expect(milter.header).to.not.equal(undefined);
		});

		it('eoh', function() {
			milter.setCallback('eoh', function() {});
			expect(milter.eoh).to.not.equal(undefined);
		});

		it('body', function() {
			milter.setCallback('body', function() {});
			expect(milter.body).to.not.equal(undefined);
		});

		it('eom', function() {
			milter.setCallback('eom', function() {});
			expect(milter.eom).to.not.equal(undefined);
		});

		it('abort', function() {
			milter.setCallback('abort', function() {});
			expect(milter.abort).to.not.equal(undefined);
		});

		it('unknown', function() {
			milter.setCallback('unknown', function() {});
			expect(milter.unknown).to.not.equal(undefined);
		});

		it('data', function() {
			milter.setCallback('data', function() {});
			expect(milter.data).to.not.equal(undefined);
		});

		it('negotiate', function() {
			milter.setCallback('negotiate', function() {});
			expect(milter.negotiate).to.not.equal(undefined);
		});

		it('hoge', function() {
			try {
				milter.setCallback('hoge', function() {});
			} catch(e) {
				expect(e).to.be.an.instanceof(Error);
			}
		});

		it('name is not string', function() {
			try {
				milter.setCallback(1, function() {});
			} catch(e) {
				expect(e).to.be.an.instanceof(TypeError);
			}
		});

		it('callback is not function', function() {
			try {
				milter.setCallback('connect');
			} catch(e) {
				expect(e).to.be.an.instanceof(TypeError);
			}
		});
	});

	describe('setpriv/getpriv', function() {
		var ctx, milter;
		beforeEach(function() {
			ctx = {};
			milter = nodemilter.createMilter();
		});

		it('success', function() {
			var res = milter.setpriv(ctx, {name: 'hoge'});
			var data = milter.getpriv(ctx);
			expect(res).to.equal(0);
			expect(data.name).to.equal('hoge');
		});

		it('setpriv error', function() {
			var res = milter.setpriv(null, {name: 'hoge'});
			expect(res).to.equal(-1);
		});

		it('getpriv error', function() {
			var res = milter.setpriv(null, {name: 'hoge'});
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
			ctx.mac_buf = new Array(MAX_MACROS_ENTRIES);
			ctx.mac_buf[5] = ['i', 'value'];

			expect(milter.getsymval(ctx, 'i')).to.equal('value');
		});

		it('success 2', function() {
			ctx.mac_buf = new Array(MAX_MACROS_ENTRIES);
			ctx.mac_buf[5] = ['{i}', 'value'];

			expect(milter.getsymval(ctx, 'i')).to.equal('value');
		});

		it('success 3', function() {
			ctx.mac_buf = new Array(MAX_MACROS_ENTRIES);
			ctx.mac_buf[5] = ['i', 'value'];

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
			expect(ctx.reply.toString()).to.equal('400 4.0.0 test\r\n\u0000');
		});

		it('setmlreply success 1', function() {
			var res = milter.setmlreply(ctx, '400', '4.0.0', 'test');
			expect(res).to.equal(0);
			expect(ctx.reply.toString()).to.equal('400 4.0.0 test\r\n\u0000');
		});

		it('setmlreply success 2', function() {
			var res = milter.setmlreply(ctx, '400', '4.0.0', 'test', 'test2');
			expect(res).to.equal(0);
			expect(ctx.reply.toString()).to.equal('400-4.0.0 test\r\n400 4.0.0 test2\r\n\u0000');
		});

		it('setmlreply success 3', function() {
			var res = milter.setmlreply(ctx, '400', null, 'test');
			expect(res).to.equal(0);
			expect(ctx.reply.toString()).to.equal('400 4.0.0 test\r\n\u0000');
		});

		it('setmlreply success 4', function() {
			var res = milter.setmlreply(ctx, '500', null, 'test');
			expect(res).to.equal(0);
			expect(ctx.reply.toString()).to.equal('500 5.0.0 test\r\n\u0000');
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
			ctx.mac_list = new Array(MAX_MACROS_ENTRIES);
			milter = nodemilter.createMilter();
		});

		it('success', function() {
			var macros = ['i', 'j'];
			var res = milter.setsymlist(ctx, SMFIM.CONNECT, macros);
			expect(res).to.equal(0);
			expect(ctx.mac_list[0][0]).to.equal('i');
			expect(ctx.mac_list[0][1]).to.equal('j');
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
			ctx.write_command = function(){};
			ctx.milter = {};
			milter = nodemilter.createMilter();
			stub = sinon.stub(ctx, 'write_command');
		});

		afterEach(function() {
			stub.restore();
		});

		it('addheader 1', function(done) {
			ctx.aflags = SMFIF.ADDHDRS;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addheader(ctx, 'f', 'v', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.ADDHEADER);
				expect(stub.firstCall.args[1].toString()).to.equal('f\u0000v\u0000');
				done();
			});
		});

		it('addheader 2', function(done) {
			ctx.aflags = 0;
			ctx.state = ST.ENDM;
			milter.addheader(ctx, 'f', 'v', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('chgheader 1', function(done) {
			ctx.aflags = SMFIF.CHGHDRS;
			ctx.state = ST.ENDM;
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
			ctx.aflags = 0;
			ctx.state = ST.ENDM;
			milter.chgheader(ctx, 'f', 1, 'v', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('chgheader 3', function(done) {
			ctx.aflags = 0;
			ctx.state = ST.ENDM;
			milter.chgheader(ctx, 'f', -1, 'v', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('insheader 1', function(done) {
			ctx.aflags = SMFIF.ADDHDRS;
			ctx.state = ST.ENDM;
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
			ctx.aflags = 0;
			ctx.state = ST.ENDM;
			milter.insheader(ctx, 1, 'f', 'v', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('insheader 3', function(done) {
			ctx.aflags = 0;
			ctx.state = ST.ENDM;
			milter.insheader(ctx, -1, 'f', 'v', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('chgfrom 1', function(done) {
			ctx.aflags = SMFIF.CHGFROM;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.chgfrom(ctx, 'from', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.CHGFROM);
				expect(stub.firstCall.args[1].toString()).to.equal('from\u0000');
				done();
			});
		});

		it('chgfrom 2', function(done) {
			ctx.aflags = SMFIF.CHGFROM;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.chgfrom(ctx, 'from', 'args', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.CHGFROM);
				expect(stub.firstCall.args[1].toString()).to.equal('from\u0000args\u0000');
				done();
			});
		});

		it('chgfrom 3', function(done) {
			ctx.aflags = 0;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.chgfrom(ctx, 'from', 'args', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('chgfrom 4', function(done) {
			ctx.aflags = SMFIF.CHGFROM;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.chgfrom(ctx, null, 'args', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('chgfrom 5', function(done) {
			ctx.aflags = SMFIF.CHGFROM;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.chgfrom(ctx, 1, 'args', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('addrcpt 1', function(done) {
			ctx.aflags = SMFIF.ADDRCPT;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt(ctx, 'rcpt', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.ADDRCPT);
				expect(stub.firstCall.args[1]).to.equal('rcpt');
				done();
			});
		});

		it('addrcpt 2', function(done) {
			ctx.aflags = 0;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt(ctx, 'rcpt', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('addrcpt 3', function(done) {
			ctx.aflags = SMFIF.ADDRCPT;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt(ctx, 1, function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('addrcpt_par 1', function(done) {
			ctx.aflags = SMFIF.ADDRCPT_PAR;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt_par(ctx, 'rcpt', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.ADDRCPT_PAR);
				expect(stub.firstCall.args[1].toString()).to.equal('rcpt\u0000');
				done();
			});
		});

		it('addrcpt_par 2', function(done) {
			ctx.aflags = SMFIF.ADDRCPT_PAR;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt_par(ctx, 'rcpt', 'args', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.ADDRCPT_PAR);
				expect(stub.firstCall.args[1].toString()).to.equal('rcpt\u0000args\u0000');
				done();
			});
		});

		it('addrcpt_par 3', function(done) {
			ctx.aflags = 0;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt_par(ctx, 'rcpt', 'args', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('addrcpt_par 4', function(done) {
			ctx.aflags = SMFIF.ADDRCPT_PAR;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt_par(ctx, null, 'args', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('addrcpt_par 5', function(done) {
			ctx.aflags = SMFIF.ADDRCPT_PAR;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.addrcpt_par(ctx, 1, 'args', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('delrcpt 1', function(done) {
			ctx.aflags = SMFIF.DELRCPT;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.delrcpt(ctx, 'rcpt', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.DELRCPT);
				expect(stub.firstCall.args[1]).to.equal('rcpt');
				done();
			});
		});

		it('delrcpt 2', function(done) {
			ctx.aflags = 0;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.delrcpt(ctx, 'rcpt', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('delrcpt 3', function(done) {
			ctx.aflags = SMFIF.DELRCPT;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.delrcpt(ctx, 1, function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('replacebody 1', function(done) {
			ctx.aflags = SMFIF.CHGBODY;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.replacebody(ctx, 'body', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.REPLBODY);
				expect(stub.firstCall.args[1].toString()).to.equal('body');
				done();
			});
		});

		it('replacebody 2', function(done) {
			ctx.aflags = SMFIF.CHGBODY;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.replacebody(ctx, new Buffer('body'), function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.REPLBODY);
				expect(stub.firstCall.args[1].toString()).to.equal('body');
				done();
			});
		});

		it('replacebody 3', function(done) {
			ctx.aflags = 0;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.replacebody(ctx, 'body', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('replacebody 4', function(done) {
			ctx.aflags = SMFIF.CHGBODY;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.replacebody(ctx, 1, function(result) {
				expect(result).to.equal(-1);
				done();
			});
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
			ctx.aflags = SMFIF.QUARANTINE;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.quarantine(ctx, 'reason', function(result) {
				expect(result).to.equal(0);
				expect(stub.firstCall.args[0]).to.equal(SMFIR.QUARANTINE);
				expect(stub.firstCall.args[1]).to.equal('reason');
				done();
			});
		});

		it('quarantine 2', function(done) {
			ctx.aflags = 0;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.quarantine(ctx, 'reason', function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});

		it('quarantine 3', function(done) {
			ctx.aflags = SMFIF.QUARANTINE;
			ctx.state = ST.ENDM;
			stub.callsArgWith(2, 0);
			milter.quarantine(ctx, 1, function(result) {
				expect(result).to.equal(-1);
				done();
			});
		});
	});
});
