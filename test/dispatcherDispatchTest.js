var expect = require('chai').expect;
var Context = require('../lib/context').Context;
var Dispatcher = require('../lib/dispatcher').Dispatcher;
var getNextStates = require('../lib/dispatcher').getNextStates;
var setNextStates = require('../lib/dispatcher').setNextStates;
var COMMANDS =  require('../lib/dispatcher').COMMANDS;
var STATES = require('../lib/dispatcher').STATES;
var STATUS_CODES = require('../lib/dispatcher').STATUS_CODES;
var SMFI_VERSION = require('../lib/constants').SMFI_VERSION;

var ctx;
var dispatcher;

describe('Dispatcher', function() {
	var next_states;

	beforeEach(function() {
		next_states = getNextStates();
	});

	afterEach(function() {
		setNextStates(next_states);
	});

	describe('dispatch 1', function() {
		it('unknown command', function(done) {
			ctx = new Context({});
			ctx.socket = {
				end: function() {}
			};
			dispatcher = new Dispatcher(ctx);

			var data = new Buffer(0);

			dispatcher.dispatch('Z', data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_INIT);
				expect(err).to.equal(-1);
				done();
			});
		});

		it('option negotiation', function(done) {
			dispatcher.__proto__.sendreply = function(status, ctx, callback) {
				callback(0);
			};
			dispatcher.__proto__.optionneg = function(data, callback) {
				callback(STATUS_CODES._SMFIS_OPTIPNS);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_OPTNEG, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_OPTS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('connection info', function(done) {
			dispatcher.__proto__.connectinfo = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_CONNECT, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_CONN);
				expect(err).to.equal(0);
				done();
			});
		});

		it('helo', function(done) {
			dispatcher.__proto__.helo = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_HELO, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_HELO);
				expect(err).to.equal(0);
				done();
			});
		});

		it('mail from', function(done) {
			dispatcher.__proto__.sender = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_MAIL, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_MAIL);
				expect(err).to.equal(0);
				done();
			});
		});

		it('rcpt to', function(done) {
			dispatcher.__proto__.rcpt = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_RCPT, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_RCPT);
				expect(err).to.equal(0);
				done();
			});
		});

		it('data', function(done) {
			dispatcher.__proto__.data = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_DATA, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_DATA);
				expect(err).to.equal(0);
				done();
			});
		});

		it('headers 1', function(done) {
			dispatcher.__proto__.header = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_HEADER, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_HDRS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('headers 2', function(done) {
			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_HEADER, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_HDRS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('end of headers', function(done) {
			dispatcher.__proto__.eoh = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_EOH, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_EOHS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('body 1', function(done) {
			dispatcher.__proto__.bodychunk = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_BODY, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_BODY);
				expect(err).to.equal(0);
				done();
			});
		});

		it('body 2', function(done) {
			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_BODY, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_BODY);
				expect(err).to.equal(0);
				done();
			});
		});

		it('end of message', function(done) {
			dispatcher.__proto__.bodyend = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_BODYEOB, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_ENDM);
				expect(err).to.equal(0);
				done();
			});
		});

		it('quit', function(done) {
			dispatcher.__proto__.quit = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_QUIT, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_QUIT);
				expect(err).to.equal(0);
				done();
			});
		});
	});

	describe('dispatch 2', function() {
		it('option negotiation', function(done) {
			ctx = new Context({});
			ctx.socket = {
				end: function() {}
			};
			dispatcher = new Dispatcher(ctx);

			dispatcher.__proto__.sendreply = function(status, ctx, callback) {
				callback(0);
			};
			dispatcher.__proto__.optionneg = function(data, callback) {
				callback(STATUS_CODES._SMFIS_OPTIPNS);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_OPTNEG, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_OPTS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('connection info', function(done) {
			dispatcher.__proto__.connectinfo = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_CONNECT, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_CONN);
				expect(err).to.equal(0);
				done();
			});
		});

		it('helo', function(done) {
			dispatcher.__proto__.helo = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_HELO, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_HELO);
				expect(err).to.equal(0);
				done();
			});
		});

		it('mail from', function(done) {
			dispatcher.__proto__.sender = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_MAIL, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_MAIL);
				expect(err).to.equal(0);
				done();
			});
		});

		it('rcpt to', function(done) {
			dispatcher.__proto__.rcpt = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_RCPT, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_RCPT);
				expect(err).to.equal(0);
				done();
			});
		});

		it('data', function(done) {
			dispatcher.__proto__.data = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_DATA, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_DATA);
				expect(err).to.equal(0);
				done();
			});
		});

		it('headers', function(done) {
			dispatcher.__proto__.header = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_HEADER, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_HDRS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('end of headers', function(done) {
			dispatcher.__proto__.eoh = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_EOH, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_EOHS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('body', function(done) {
			dispatcher.__proto__.bodychunk = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_BODY, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_BODY);
				expect(err).to.equal(0);
				done();
			});
		});

		it('end of message', function(done) {
			dispatcher.__proto__.bodyend = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_BODYEOB, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_ENDM);
				expect(err).to.equal(0);
				done();
			});
		});

		it('quit, new connection follows', function(done) {
			dispatcher.__proto__.quit = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_QUIT_NC, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_Q_NC);
				expect(err).to.equal(0);
				done();
			});
		});
	});

	describe('dispatch 3', function() {
		it('option negotiation', function(done) {
			ctx = new Context({});
			ctx.socket = {
				end: function() {}
			};
			dispatcher = new Dispatcher(ctx);

			dispatcher.__proto__.sendreply = function(status, ctx, callback) {
				callback(0);
			};
			dispatcher.__proto__.optionneg = function(data, callback) {
				callback(STATUS_CODES._SMFIS_OPTIPNS);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_OPTNEG, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_OPTS);
				expect(err).to.equal(0);
				done();
			});
		});

		it('connection info', function(done) {
			dispatcher.__proto__.connectinfo = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_CONNECT, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_CONN);
				expect(err).to.equal(0);
				done();
			});
		});

		it('helo', function(done) {
			dispatcher.__proto__.helo = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_HELO, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_HELO);
				expect(err).to.equal(0);
				done();
			});
		});

		it('mail from', function(done) {
			dispatcher.__proto__.sender = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_MAIL, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_MAIL);
				expect(err).to.equal(0);
				done();
			});
		});

		it('abort', function(done) {
			dispatcher.__proto__.abort = function(data, callback) {
				callback(STATUS_CODES.SMFIS_CONTINUE);
			};

			var data = new Buffer(0);

			dispatcher.dispatch(COMMANDS.SMFIC_ABORT, data, function(err) {
				expect(ctx.state).to.equal(STATES.ST_ABRT);
				expect(err).to.equal(0);
				done();
			});
		});
	});
});
