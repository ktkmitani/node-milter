var expect = require('chai').expect;
var async = require('async');
var sinon = require('sinon');

var Context = require('../lib/context').Context;

var constants = require('../lib/constants');
var ST = constants.ST;
var SMFIS = constants.SMFIS;
var SMFIC = constants.SMFIC;
var SMFI_VERSION = constants.SMFI_VERSION;

var Dispatcher = require('../lib/dispatcher').Dispatcher;
var getNextStates = require('../lib/dispatcher').getNextStates;
var setNextStates = require('../lib/dispatcher').setNextStates;

describe('Dispatcher dispatch', function() {
	var next_states;

	beforeEach(function() {
		next_states = getNextStates();
	});

	afterEach(function() {
		setNextStates(next_states);
	});

	it('dispatch 1', function(done) {
		var socketend = false;
		var ctx = new Context();
		ctx._socket = {
			end: function() {
				socketend = true;
			}
		};

		var dispatcher = new Dispatcher(ctx);
		var stubs = [];
		stubs.push(sinon.stub(dispatcher, '_sendreply').callsArgWith(1, 0));
		stubs.push(sinon.stub(dispatcher, '_optionneg').callsArgWith(2, SMFIS._OPTIONS));
		stubs.push(sinon.stub(dispatcher, '_connectinfo').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_helo').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_sender').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_rcpt').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_data').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_header').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_eoh').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_bodychunk').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_bodyend').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_quit').callsArgWith(2, SMFIS.CONTINUE));

		var data = new Buffer(0);

		async.waterfall([
			function(done) {
				dispatcher._dispatch('Z', data, function(err) {
					expect(ctx._state).to.equal(ST.INIT);
					expect(err).to.equal(-1);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.OPTNEG, data, function(err) {
					expect(ctx._state).to.equal(ST.OPTS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.CONNECT, data, function(err) {
					expect(ctx._state).to.equal(ST.CONN);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.HELO, data, function(err) {
					expect(ctx._state).to.equal(ST.HELO);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.MAIL, data, function(err) {
					expect(ctx._state).to.equal(ST.MAIL);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.RCPT, data, function(err) {
					expect(ctx._state).to.equal(ST.RCPT);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.DATA, data, function(err) {
					expect(ctx._state).to.equal(ST.DATA);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.HEADER, data, function(err) {
					expect(ctx._state).to.equal(ST.HDRS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.HEADER, data, function(err) {
					expect(ctx._state).to.equal(ST.HDRS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.EOH, data, function(err) {
					expect(ctx._state).to.equal(ST.EOHS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.BODY, data, function(err) {
					expect(ctx._state).to.equal(ST.BODY);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.BODY, data, function(err) {
					expect(ctx._state).to.equal(ST.BODY);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.BODYEOB, data, function(err) {
					expect(ctx._state).to.equal(ST.ENDM);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.QUIT, data, function(err) {
					expect(ctx._state).to.equal(ST.QUIT);
					expect(err).to.equal(0);
					done();
				});
			}
		], function(err) {
			expect(socketend).to.equal(true);

			stubs.forEach(function(stub) {
				stub.restore();
			});

			done();
		});
	});

	it('dispatch 2', function(done) {
		var socketend = false;
		var ctx = new Context();
		ctx._socket = {
			end: function() {
				socketend = true;
			}
		};

		var dispatcher = new Dispatcher(ctx);
		var stubs = [];
		stubs.push(sinon.stub(dispatcher, '_sendreply').callsArgWith(1, 0));
		stubs.push(sinon.stub(dispatcher, '_optionneg').callsArgWith(2, SMFIS._OPTIONS));
		stubs.push(sinon.stub(dispatcher, '_connectinfo').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_helo').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_sender').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_rcpt').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_data').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_header').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_eoh').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_bodychunk').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_bodyend').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_quit').callsArgWith(2, SMFIS.CONTINUE));

		var data = new Buffer(0);

		async.waterfall([
			function(done) {
				dispatcher._dispatch(SMFIC.OPTNEG, data, function(err) {
					expect(ctx._state).to.equal(ST.OPTS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.CONNECT, data, function(err) {
					expect(ctx._state).to.equal(ST.CONN);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.HELO, data, function(err) {
					expect(ctx._state).to.equal(ST.HELO);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.MAIL, data, function(err) {
					expect(ctx._state).to.equal(ST.MAIL);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.RCPT, data, function(err) {
					expect(ctx._state).to.equal(ST.RCPT);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.DATA, data, function(err) {
					expect(ctx._state).to.equal(ST.DATA);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.HEADER, data, function(err) {
					expect(ctx._state).to.equal(ST.HDRS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.EOH, data, function(err) {
					expect(ctx._state).to.equal(ST.EOHS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.BODY, data, function(err) {
					expect(ctx._state).to.equal(ST.BODY);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.BODYEOB, data, function(err) {
					expect(ctx._state).to.equal(ST.ENDM);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.QUIT_NC, data, function(err) {
					expect(ctx._state).to.equal(ST.Q_NC);
					expect(err).to.equal(0);
					done();
				});
			}
		], function(err) {
			expect(socketend).to.equal(false);

			stubs.forEach(function(stub) {
				stub.restore();
			});

			done();
		});
	});

	it('dispatch 3', function(done) {
		var socketend = false;
		var ctx = new Context();
		ctx._socket = {
			end: function() {
				socketend = true;
			}
		};

		var dispatcher = new Dispatcher(ctx);
		var stubs = [];
		stubs.push(sinon.stub(dispatcher, '_sendreply').callsArgWith(1, 0));
		stubs.push(sinon.stub(dispatcher, '_optionneg').callsArgWith(2, SMFIS._OPTIONS));
		stubs.push(sinon.stub(dispatcher, '_connectinfo').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_helo').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_sender').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_rcpt').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_data').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_header').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_eoh').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_bodychunk').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_bodyend').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_quit').callsArgWith(2, SMFIS.CONTINUE));

		var data = new Buffer(0);

		async.waterfall([
			function(done) {
				dispatcher._dispatch(SMFIC.OPTNEG, data, function(err) {
					expect(ctx._state).to.equal(ST.OPTS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.CONNECT, data, function(err) {
					expect(ctx._state).to.equal(ST.CONN);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.HELO, data, function(err) {
					expect(ctx._state).to.equal(ST.HELO);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.MAIL, data, function(err) {
					expect(ctx._state).to.equal(ST.MAIL);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.ABORT, data, function(err) {
					expect(ctx._state).to.equal(ST.ABRT);
					expect(err).to.equal(0);
					done();
				});
			}
		], function(err) {
			expect(socketend).to.equal(false);

			stubs.forEach(function(stub) {
				stub.restore();
			});

			done();
		});
	});

	it('dispatch 4', function(done) {
		var socketend = false;
		var abortcall = false;
		var ctx = new Context();
		ctx._socket = {
			end: function() {
				socketend = true;
			}
		};
		ctx._milter = {
			_abort: function() {
				abortcall = true;
			}
		};

		var dispatcher = new Dispatcher(ctx);
		var stubs = [];
		stubs.push(sinon.stub(dispatcher, '_sendreply').callsArgWith(1, 0));
		stubs.push(sinon.stub(dispatcher, '_optionneg').callsArgWith(2, SMFIS._OPTIONS));
		stubs.push(sinon.stub(dispatcher, '_connectinfo').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_helo').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_sender').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_rcpt').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_data').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_header').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_eoh').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_bodychunk').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_bodyend').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_quit').callsArgWith(2, SMFIS.CONTINUE));

		var data = new Buffer(0);

		async.waterfall([
			function(done) {
				dispatcher._dispatch(SMFIC.OPTNEG, data, function(err) {
					expect(ctx._state).to.equal(ST.OPTS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.CONNECT, data, function(err) {
					expect(ctx._state).to.equal(ST.CONN);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.HELO, data, function(err) {
					expect(ctx._state).to.equal(ST.HELO);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.MAIL, data, function(err) {
					expect(ctx._state).to.equal(ST.MAIL);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.OPTNEG, data, function(err) {
					expect(ctx._state).to.equal(ST.MAIL);
					expect(err).to.equal(1);
					done();
				});
			},
		], function(err) {
			expect(socketend).to.equal(false);
			expect(abortcall).to.equal(true);

			stubs.forEach(function(stub) {
				stub.restore();
			});

			done();
		});
	});

	it('dispatch 5', function(done) {
		var ctx = new Context();
		var dispatcher = new Dispatcher(ctx);
		var stubs = [];
		stubs.push(sinon.stub(dispatcher, '_sendreply').callsArgWith(1, -1));
		stubs.push(sinon.stub(dispatcher, '_optionneg').callsArgWith(2, SMFIS._OPTIONS));

		var data = new Buffer(0);

		async.waterfall([
			function(done) {
				dispatcher._dispatch(SMFIC.OPTNEG, data, function(err) {
					expect(err).to.equal(-1);
					done();
				});
			},
		], function(err) {
			stubs.forEach(function(stub) {
				stub.restore();
			});

			done();
		});
	});

	it('dispatch 6', function(done) {
		var ctx = new Context();
		var dispatcher = new Dispatcher(ctx);
		var stubs = [];
		stubs.push(sinon.stub(dispatcher, '_sendreply').callsArgWith(1, 0));
		stubs.push(sinon.stub(dispatcher, '_optionneg').callsArgWith(2, SMFIS._OPTIONS));
		stubs.push(sinon.stub(dispatcher, '_connectinfo').callsArgWith(2, SMFIS.ACCEPT));

		var data = new Buffer(0);

		async.waterfall([
			function(done) {
				dispatcher._dispatch(SMFIC.OPTNEG, data, function(err) {
					expect(ctx._state).to.equal(ST.OPTS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.CONNECT, data, function(err) {
					expect(ctx._state).to.equal(ST.CONN);
					expect(err).to.equal(0);
					done();
				});
			},
		], function(err) {
			stubs.forEach(function(stub) {
				stub.restore();
			});

			done();
		});
	});

	it('dispatch 7', function(done) {
		var ctx = new Context();
		var dispatcher = new Dispatcher(ctx);
		var stubs = [];
		stubs.push(sinon.stub(dispatcher, '_sendreply').callsArgWith(1, 0));
		stubs.push(sinon.stub(dispatcher, '_optionneg').callsArgWith(2, SMFIS._OPTIONS));
		stubs.push(sinon.stub(dispatcher, '_connectinfo').callsArgWith(2, SMFIS.REJECT));

		var data = new Buffer(0);

		async.waterfall([
			function(done) {
				dispatcher._dispatch(SMFIC.OPTNEG, data, function(err) {
					expect(ctx._state).to.equal(ST.OPTS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.CONNECT, data, function(err) {
					expect(ctx._state).to.equal(ST.CONN);
					expect(err).to.equal(0);
					done();
				});
			},
		], function(err) {
			stubs.forEach(function(stub) {
				stub.restore();
			});

			done();
		});
	});

	it('dispatch 8', function(done) {
		var ctx = new Context();
		var dispatcher = new Dispatcher(ctx);
		var stubs = [];
		stubs.push(sinon.stub(dispatcher, '_sendreply').callsArgWith(1, 0));
		stubs.push(sinon.stub(dispatcher, '_optionneg').callsArgWith(2, SMFIS._OPTIONS));
		stubs.push(sinon.stub(dispatcher, '_connectinfo').callsArgWith(2, SMFIS.DISCARD));

		var data = new Buffer(0);

		async.waterfall([
			function(done) {
				dispatcher._dispatch(SMFIC.OPTNEG, data, function(err) {
					expect(ctx._state).to.equal(ST.OPTS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.CONNECT, data, function(err) {
					expect(ctx._state).to.equal(ST.CONN);
					expect(err).to.equal(0);
					done();
				});
			},
		], function(err) {
			stubs.forEach(function(stub) {
				stub.restore();
			});

			done();
		});
	});

	it('dispatch 9', function(done) {
		var ctx = new Context();
		var dispatcher = new Dispatcher(ctx);
		var stubs = [];
		stubs.push(sinon.stub(dispatcher, '_sendreply').callsArgWith(1, 0));
		stubs.push(sinon.stub(dispatcher, '_optionneg').callsArgWith(2, SMFIS._OPTIONS));
		stubs.push(sinon.stub(dispatcher, '_connectinfo').callsArgWith(2, SMFIS.TEMPFAIL));

		var data = new Buffer(0);

		async.waterfall([
			function(done) {
				dispatcher._dispatch(SMFIC.OPTNEG, data, function(err) {
					expect(ctx._state).to.equal(ST.OPTS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.CONNECT, data, function(err) {
					expect(ctx._state).to.equal(ST.CONN);
					expect(err).to.equal(0);
					done();
				});
			},
		], function(err) {
			stubs.forEach(function(stub) {
				stub.restore();
			});

			done();
		});
	});

	it('dispatch 10', function(done) {
		var abortcall = false;
		var closecall = false;
		var ctx = new Context();
		ctx._milter = {
			_abort: function() {
				abortcall = true;
			},
			_close: function() {
				closecall = true;
			}
		};
		var dispatcher = new Dispatcher(ctx);
		var stubs = [];
		stubs.push(sinon.stub(dispatcher, '_sendreply').callsArgWith(1, 0));
		stubs.push(sinon.stub(dispatcher, '_optionneg').callsArgWith(2, SMFIS._OPTIONS));
		stubs.push(sinon.stub(dispatcher, '_connectinfo').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_helo').callsArgWith(2, SMFIS.CONTINUE));
		stubs.push(sinon.stub(dispatcher, '_sender').callsArgWith(2, SMFIS._ABORT));

		var data = new Buffer(0);

		async.waterfall([
			function(done) {
				dispatcher._dispatch(SMFIC.OPTNEG, data, function(err) {
					expect(ctx._state).to.equal(ST.OPTS);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.CONNECT, data, function(err) {
					expect(ctx._state).to.equal(ST.CONN);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.HELO, data, function(err) {
					expect(ctx._state).to.equal(ST.HELO);
					expect(err).to.equal(0);
					done();
				});
			},
			function(done) {
				dispatcher._dispatch(SMFIC.MAIL, data, function(err) {
					expect(ctx._state).to.equal(ST.MAIL);
					expect(err).to.equal(-1);
					done();
				});
			}
		], function(err) {
			expect(abortcall).to.equal(true);
			expect(closecall).to.equal(true);

			stubs.forEach(function(stub) {
				stub.restore();
			});

			done();
		});
	});
});
