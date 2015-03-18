var expect = require('chai').expect;
var Context = require('../lib/context').Context;
var Dispatcher = require('../lib/dispatcher').Dispatcher;
var constants = require('../lib/constants');

var ST = constants.ST;
var SMFIS = constants.SMFIS;
var SMFI_VERSION = constants.SMFI_VERSION;

var SMFIC =  require('../lib/dispatcher').SMFIC;
var getNextStates = require('../lib/dispatcher').getNextStates;
var setNextStates = require('../lib/dispatcher').setNextStates;

var ctx;
var dispatcher;

describe('Dispatcher dispatch', function() {
	var next_states;

	beforeEach(function() {
		next_states = getNextStates();
	});

	afterEach(function() {
		setNextStates(next_states);
	});

	describe('dispatch 1', function() {
		it('unknown command', function(done) {
			ctx = new Context();
			ctx.socket = {
				end: function() {}
			};
			dispatcher = new Dispatcher(ctx);

			var data = new Buffer(0);

			dispatcher.dispatch('Z', data, function(err) {
				expect(ctx.state).to.equal(ST.INIT);
				expect(err).to.equal(-1);
				done();
			});
		});

		it('option negotiation', function(done) {
			dispatcher.__proto__.sendreply = function(status, ctx, callback) {
				callback(0);
			};
			dispatcher.__proto__.optionneg = function(data, macro, callback) {
				callback(SMFIS._SMFIS_OPTIPNS);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.OPTNEG, data, function(err) {
				expect(ctx.state).to.equal(ST.OPTS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('connection info', function(done) {
			dispatcher.__proto__.connectinfo = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.CONNECT, data, function(err) {
				expect(ctx.state).to.equal(ST.CONN);
				expect(err).to.equal(0);
				done();
			});
		});

		it('helo', function(done) {
			dispatcher.__proto__.helo = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.HELO, data, function(err) {
				expect(ctx.state).to.equal(ST.HELO);
				expect(err).to.equal(0);
				done();
			});
		});

		it('mail from', function(done) {
			dispatcher.__proto__.sender = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.MAIL, data, function(err) {
				expect(ctx.state).to.equal(ST.MAIL);
				expect(err).to.equal(0);
				done();
			});
		});

		it('rcpt to', function(done) {
			dispatcher.__proto__.rcpt = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.RCPT, data, function(err) {
				expect(ctx.state).to.equal(ST.RCPT);
				expect(err).to.equal(0);
				done();
			});
		});

		it('data', function(done) {
			dispatcher.__proto__.data = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.DATA, data, function(err) {
				expect(ctx.state).to.equal(ST.DATA);
				expect(err).to.equal(0);
				done();
			});
		});

		it('headers 1', function(done) {
			dispatcher.__proto__.header = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.HEADER, data, function(err) {
				expect(ctx.state).to.equal(ST.HDRS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('headers 2', function(done) {
			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.HEADER, data, function(err) {
				expect(ctx.state).to.equal(ST.HDRS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('end of headers', function(done) {
			dispatcher.__proto__.eoh = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.EOH, data, function(err) {
				expect(ctx.state).to.equal(ST.EOHS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('body 1', function(done) {
			dispatcher.__proto__.bodychunk = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.BODY, data, function(err) {
				expect(ctx.state).to.equal(ST.BODY);
				expect(err).to.equal(0);
				done();
			});
		});

		it('body 2', function(done) {
			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.BODY, data, function(err) {
				expect(ctx.state).to.equal(ST.BODY);
				expect(err).to.equal(0);
				done();
			});
		});

		it('end of message', function(done) {
			dispatcher.__proto__.bodyend = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.BODYEOB, data, function(err) {
				expect(ctx.state).to.equal(ST.ENDM);
				expect(err).to.equal(0);
				done();
			});
		});

		it('quit', function(done) {
			dispatcher.__proto__.quit = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.QUIT, data, function(err) {
				expect(ctx.state).to.equal(ST.QUIT);
				expect(err).to.equal(0);
				done();
			});
		});
	});

	describe('dispatch 2', function() {
		it('option negotiation', function(done) {
			ctx = new Context();
			ctx.socket = {
				end: function() {}
			};
			dispatcher = new Dispatcher(ctx);

			dispatcher.__proto__.sendreply = function(status, ctx, callback) {
				callback(0);
			};
			dispatcher.__proto__.optionneg = function(data, macro, callback) {
				callback(SMFIS._SMFIS_OPTIPNS);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.OPTNEG, data, function(err) {
				expect(ctx.state).to.equal(ST.OPTS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('connection info', function(done) {
			dispatcher.__proto__.connectinfo = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.CONNECT, data, function(err) {
				expect(ctx.state).to.equal(ST.CONN);
				expect(err).to.equal(0);
				done();
			});
		});

		it('helo', function(done) {
			dispatcher.__proto__.helo = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.HELO, data, function(err) {
				expect(ctx.state).to.equal(ST.HELO);
				expect(err).to.equal(0);
				done();
			});
		});

		it('mail from', function(done) {
			dispatcher.__proto__.sender = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.MAIL, data, function(err) {
				expect(ctx.state).to.equal(ST.MAIL);
				expect(err).to.equal(0);
				done();
			});
		});

		it('rcpt to', function(done) {
			dispatcher.__proto__.rcpt = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.RCPT, data, function(err) {
				expect(ctx.state).to.equal(ST.RCPT);
				expect(err).to.equal(0);
				done();
			});
		});

		it('data', function(done) {
			dispatcher.__proto__.data = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.DATA, data, function(err) {
				expect(ctx.state).to.equal(ST.DATA);
				expect(err).to.equal(0);
				done();
			});
		});

		it('headers', function(done) {
			dispatcher.__proto__.header = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.HEADER, data, function(err) {
				expect(ctx.state).to.equal(ST.HDRS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('end of headers', function(done) {
			dispatcher.__proto__.eoh = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.EOH, data, function(err) {
				expect(ctx.state).to.equal(ST.EOHS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('body', function(done) {
			dispatcher.__proto__.bodychunk = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.BODY, data, function(err) {
				expect(ctx.state).to.equal(ST.BODY);
				expect(err).to.equal(0);
				done();
			});
		});

		it('end of message', function(done) {
			dispatcher.__proto__.bodyend = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.BODYEOB, data, function(err) {
				expect(ctx.state).to.equal(ST.ENDM);
				expect(err).to.equal(0);
				done();
			});
		});

		it('quit, new connection follows', function(done) {
			dispatcher.__proto__.quit = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.QUIT_NC, data, function(err) {
				expect(ctx.state).to.equal(ST.Q_NC);
				expect(err).to.equal(0);
				done();
			});
		});
	});

	describe('dispatch 3', function() {
		it('option negotiation', function(done) {
			ctx = new Context();
			ctx.socket = {
				end: function() {}
			};
			dispatcher = new Dispatcher(ctx);

			dispatcher.__proto__.sendreply = function(status, ctx, callback) {
				callback(0);
			};
			dispatcher.__proto__.optionneg = function(data, macro, callback) {
				callback(SMFIS._SMFIS_OPTIPNS);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.OPTNEG, data, function(err) {
				expect(ctx.state).to.equal(ST.OPTS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('connection info', function(done) {
			dispatcher.__proto__.connectinfo = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.CONNECT, data, function(err) {
				expect(ctx.state).to.equal(ST.CONN);
				expect(err).to.equal(0);
				done();
			});
		});

		it('helo', function(done) {
			dispatcher.__proto__.helo = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.HELO, data, function(err) {
				expect(ctx.state).to.equal(ST.HELO);
				expect(err).to.equal(0);
				done();
			});
		});

		it('mail from', function(done) {
			dispatcher.__proto__.sender = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.MAIL, data, function(err) {
				expect(ctx.state).to.equal(ST.MAIL);
				expect(err).to.equal(0);
				done();
			});
		});

		it('abort', function(done) {
			dispatcher.__proto__.abort = function(data, macro, callback) {
				callback(SMFIS.CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(SMFIC.ABORT, data, function(err) {
				expect(ctx.state).to.equal(ST.ABRT);
				expect(err).to.equal(0);
				done();
			});
		});
	});
});
