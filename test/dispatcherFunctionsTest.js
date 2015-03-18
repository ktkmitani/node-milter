var expect = require('chai').expect;
var Dispatcher = require('../lib/dispatcher');
var STATES = Dispatcher.STATES;

describe('Dispatcher', function() {
	describe('trans_ok', function() {
		[
			{name: 'ST_INIT -> ST_INIT', p1: STATES.ST_INIT, p2: STATES.ST_INIT, res: false},
			{name: 'ST_INIT -> ST_OPTS', p1: STATES.ST_INIT, p2: STATES.ST_OPTS, res: true},
			{name: 'ST_INIT -> ST_CONN', p1: STATES.ST_INIT, p2: STATES.ST_CONN, res: false},
			{name: 'ST_INIT -> ST_HELO', p1: STATES.ST_INIT, p2: STATES.ST_HELO, res: false},
			{name: 'ST_INIT -> ST_MAIL', p1: STATES.ST_INIT, p2: STATES.ST_MAIL, res: false},
			{name: 'ST_INIT -> ST_RCPT', p1: STATES.ST_INIT, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_INIT -> ST_DATA', p1: STATES.ST_INIT, p2: STATES.ST_DATA, res: false},
			{name: 'ST_INIT -> ST_HDRS', p1: STATES.ST_INIT, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_INIT -> ST_EOHS', p1: STATES.ST_INIT, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_INIT -> ST_BODY', p1: STATES.ST_INIT, p2: STATES.ST_BODY, res: false},
			{name: 'ST_INIT -> ST_ENDM', p1: STATES.ST_INIT, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_INIT -> ST_QUIT', p1: STATES.ST_INIT, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_INIT -> ST_ABRT', p1: STATES.ST_INIT, p2: STATES.ST_ABRT, res: false},
			{name: 'ST_INIT -> ST_UNKN', p1: STATES.ST_INIT, p2: STATES.ST_UNKN, res: false},
			{name: 'ST_INIT -> ST_Q_NC', p1: STATES.ST_INIT, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_INIT -> ST_SKIP', p1: STATES.ST_INIT, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_OPTS -> ST_INIT', p1: STATES.ST_OPTS, p2: STATES.ST_INIT, res: false},
			{name: 'ST_OPTS -> ST_OPTS', p1: STATES.ST_OPTS, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_OPTS -> ST_CONN', p1: STATES.ST_OPTS, p2: STATES.ST_CONN, res: true},
			{name: 'ST_OPTS -> ST_HELO', p1: STATES.ST_OPTS, p2: STATES.ST_HELO, res: false},
			{name: 'ST_OPTS -> ST_MAIL', p1: STATES.ST_OPTS, p2: STATES.ST_MAIL, res: false},
			{name: 'ST_OPTS -> ST_RCPT', p1: STATES.ST_OPTS, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_OPTS -> ST_DATA', p1: STATES.ST_OPTS, p2: STATES.ST_DATA, res: false},
			{name: 'ST_OPTS -> ST_HDRS', p1: STATES.ST_OPTS, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_OPTS -> ST_EOHS', p1: STATES.ST_OPTS, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_OPTS -> ST_BODY', p1: STATES.ST_OPTS, p2: STATES.ST_BODY, res: false},
			{name: 'ST_OPTS -> ST_ENDM', p1: STATES.ST_OPTS, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_OPTS -> ST_QUIT', p1: STATES.ST_OPTS, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_OPTS -> ST_ABRT', p1: STATES.ST_OPTS, p2: STATES.ST_ABRT, res: false},
			{name: 'ST_OPTS -> ST_UNKN', p1: STATES.ST_OPTS, p2: STATES.ST_UNKN, res: true},
			{name: 'ST_OPTS -> ST_Q_NC', p1: STATES.ST_OPTS, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_OPTS -> ST_SKIP', p1: STATES.ST_OPTS, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_CONN -> ST_INIT', p1: STATES.ST_CONN, p2: STATES.ST_INIT, res: false},
			{name: 'ST_CONN -> ST_OPTS', p1: STATES.ST_CONN, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_CONN -> ST_CONN', p1: STATES.ST_CONN, p2: STATES.ST_CONN, res: false},
			{name: 'ST_CONN -> ST_HELO', p1: STATES.ST_CONN, p2: STATES.ST_HELO, res: true},
			{name: 'ST_CONN -> ST_MAIL', p1: STATES.ST_CONN, p2: STATES.ST_MAIL, res: true},
			{name: 'ST_CONN -> ST_RCPT', p1: STATES.ST_CONN, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_CONN -> ST_DATA', p1: STATES.ST_CONN, p2: STATES.ST_DATA, res: false},
			{name: 'ST_CONN -> ST_HDRS', p1: STATES.ST_CONN, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_CONN -> ST_EOHS', p1: STATES.ST_CONN, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_CONN -> ST_BODY', p1: STATES.ST_CONN, p2: STATES.ST_BODY, res: false},
			{name: 'ST_CONN -> ST_ENDM', p1: STATES.ST_CONN, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_CONN -> ST_QUIT', p1: STATES.ST_CONN, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_CONN -> ST_ABRT', p1: STATES.ST_CONN, p2: STATES.ST_ABRT, res: false},
			{name: 'ST_CONN -> ST_UNKN', p1: STATES.ST_CONN, p2: STATES.ST_UNKN, res: true},
			{name: 'ST_CONN -> ST_Q_NC', p1: STATES.ST_CONN, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_CONN -> ST_SKIP', p1: STATES.ST_CONN, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_HELO -> ST_INIT', p1: STATES.ST_HELO, p2: STATES.ST_INIT, res: false},
			{name: 'ST_HELO -> ST_OPTS', p1: STATES.ST_HELO, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_HELO -> ST_CONN', p1: STATES.ST_HELO, p2: STATES.ST_CONN, res: false},
			{name: 'ST_HELO -> ST_HELO', p1: STATES.ST_HELO, p2: STATES.ST_HELO, res: true},
			{name: 'ST_HELO -> ST_MAIL', p1: STATES.ST_HELO, p2: STATES.ST_MAIL, res: true},
			{name: 'ST_HELO -> ST_RCPT', p1: STATES.ST_HELO, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_HELO -> ST_DATA', p1: STATES.ST_HELO, p2: STATES.ST_DATA, res: false},
			{name: 'ST_HELO -> ST_HDRS', p1: STATES.ST_HELO, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_HELO -> ST_EOHS', p1: STATES.ST_HELO, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_HELO -> ST_BODY', p1: STATES.ST_HELO, p2: STATES.ST_BODY, res: false},
			{name: 'ST_HELO -> ST_ENDM', p1: STATES.ST_HELO, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_HELO -> ST_QUIT', p1: STATES.ST_HELO, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_HELO -> ST_ABRT', p1: STATES.ST_HELO, p2: STATES.ST_ABRT, res: false},
			{name: 'ST_HELO -> ST_UNKN', p1: STATES.ST_HELO, p2: STATES.ST_UNKN, res: true},
			{name: 'ST_HELO -> ST_Q_NC', p1: STATES.ST_HELO, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_HELO -> ST_SKIP', p1: STATES.ST_HELO, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_MAIL -> ST_INIT', p1: STATES.ST_MAIL, p2: STATES.ST_INIT, res: false},
			{name: 'ST_MAIL -> ST_OPTS', p1: STATES.ST_MAIL, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_MAIL -> ST_CONN', p1: STATES.ST_MAIL, p2: STATES.ST_CONN, res: false},
			{name: 'ST_MAIL -> ST_HELO', p1: STATES.ST_MAIL, p2: STATES.ST_HELO, res: false},
			{name: 'ST_MAIL -> ST_MAIL', p1: STATES.ST_MAIL, p2: STATES.ST_MAIL, res: false},
			{name: 'ST_MAIL -> ST_RCPT', p1: STATES.ST_MAIL, p2: STATES.ST_RCPT, res: true},
			{name: 'ST_MAIL -> ST_DATA', p1: STATES.ST_MAIL, p2: STATES.ST_DATA, res: false},
			{name: 'ST_MAIL -> ST_HDRS', p1: STATES.ST_MAIL, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_MAIL -> ST_EOHS', p1: STATES.ST_MAIL, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_MAIL -> ST_BODY', p1: STATES.ST_MAIL, p2: STATES.ST_BODY, res: false},
			{name: 'ST_MAIL -> ST_ENDM', p1: STATES.ST_MAIL, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_MAIL -> ST_QUIT', p1: STATES.ST_MAIL, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_MAIL -> ST_ABRT', p1: STATES.ST_MAIL, p2: STATES.ST_ABRT, res: true},
			{name: 'ST_MAIL -> ST_UNKN', p1: STATES.ST_MAIL, p2: STATES.ST_UNKN, res: true},
			{name: 'ST_MAIL -> ST_Q_NC', p1: STATES.ST_MAIL, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_MAIL -> ST_SKIP', p1: STATES.ST_MAIL, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_RCPT -> ST_INIT', p1: STATES.ST_RCPT, p2: STATES.ST_INIT, res: false},
			{name: 'ST_RCPT -> ST_OPTS', p1: STATES.ST_RCPT, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_RCPT -> ST_CONN', p1: STATES.ST_RCPT, p2: STATES.ST_CONN, res: false},
			{name: 'ST_RCPT -> ST_HELO', p1: STATES.ST_RCPT, p2: STATES.ST_HELO, res: false},
			{name: 'ST_RCPT -> ST_MAIL', p1: STATES.ST_RCPT, p2: STATES.ST_MAIL, res: false},
			{name: 'ST_RCPT -> ST_RCPT', p1: STATES.ST_RCPT, p2: STATES.ST_RCPT, res: true},
			{name: 'ST_RCPT -> ST_DATA', p1: STATES.ST_RCPT, p2: STATES.ST_DATA, res: true},
			{name: 'ST_RCPT -> ST_HDRS', p1: STATES.ST_RCPT, p2: STATES.ST_HDRS, res: true},
			{name: 'ST_RCPT -> ST_EOHS', p1: STATES.ST_RCPT, p2: STATES.ST_EOHS, res: true},
			{name: 'ST_RCPT -> ST_BODY', p1: STATES.ST_RCPT, p2: STATES.ST_BODY, res: true},
			{name: 'ST_RCPT -> ST_ENDM', p1: STATES.ST_RCPT, p2: STATES.ST_ENDM, res: true},
			{name: 'ST_RCPT -> ST_QUIT', p1: STATES.ST_RCPT, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_RCPT -> ST_ABRT', p1: STATES.ST_RCPT, p2: STATES.ST_ABRT, res: true},
			{name: 'ST_RCPT -> ST_UNKN', p1: STATES.ST_RCPT, p2: STATES.ST_UNKN, res: true},
			{name: 'ST_RCPT -> ST_Q_NC', p1: STATES.ST_RCPT, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_RCPT -> ST_SKIP', p1: STATES.ST_RCPT, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_DATA -> ST_INIT', p1: STATES.ST_DATA, p2: STATES.ST_INIT, res: false},
			{name: 'ST_DATA -> ST_OPTS', p1: STATES.ST_DATA, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_DATA -> ST_CONN', p1: STATES.ST_DATA, p2: STATES.ST_CONN, res: false},
			{name: 'ST_DATA -> ST_HELO', p1: STATES.ST_DATA, p2: STATES.ST_HELO, res: false},
			{name: 'ST_DATA -> ST_MAIL', p1: STATES.ST_DATA, p2: STATES.ST_MAIL, res: false},
			{name: 'ST_DATA -> ST_RCPT', p1: STATES.ST_DATA, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_DATA -> ST_DATA', p1: STATES.ST_DATA, p2: STATES.ST_DATA, res: false},
			{name: 'ST_DATA -> ST_HDRS', p1: STATES.ST_DATA, p2: STATES.ST_HDRS, res: true},
			{name: 'ST_DATA -> ST_EOHS', p1: STATES.ST_DATA, p2: STATES.ST_EOHS, res: true},
			{name: 'ST_DATA -> ST_BODY', p1: STATES.ST_DATA, p2: STATES.ST_BODY, res: false},
			{name: 'ST_DATA -> ST_ENDM', p1: STATES.ST_DATA, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_DATA -> ST_QUIT', p1: STATES.ST_DATA, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_DATA -> ST_ABRT', p1: STATES.ST_DATA, p2: STATES.ST_ABRT, res: true},
			{name: 'ST_DATA -> ST_UNKN', p1: STATES.ST_DATA, p2: STATES.ST_UNKN, res: false},
			{name: 'ST_DATA -> ST_Q_NC', p1: STATES.ST_DATA, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_DATA -> ST_SKIP', p1: STATES.ST_DATA, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_HDRS -> ST_INIT', p1: STATES.ST_HDRS, p2: STATES.ST_INIT, res: false},
			{name: 'ST_HDRS -> ST_OPTS', p1: STATES.ST_HDRS, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_HDRS -> ST_CONN', p1: STATES.ST_HDRS, p2: STATES.ST_CONN, res: false},
			{name: 'ST_HDRS -> ST_HELO', p1: STATES.ST_HDRS, p2: STATES.ST_HELO, res: false},
			{name: 'ST_HDRS -> ST_MAIL', p1: STATES.ST_HDRS, p2: STATES.ST_MAIL, res: false},
			{name: 'ST_HDRS -> ST_RCPT', p1: STATES.ST_HDRS, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_HDRS -> ST_DATA', p1: STATES.ST_HDRS, p2: STATES.ST_DATA, res: false},
			{name: 'ST_HDRS -> ST_HDRS', p1: STATES.ST_HDRS, p2: STATES.ST_HDRS, res: true},
			{name: 'ST_HDRS -> ST_EOHS', p1: STATES.ST_HDRS, p2: STATES.ST_EOHS, res: true},
			{name: 'ST_HDRS -> ST_BODY', p1: STATES.ST_HDRS, p2: STATES.ST_BODY, res: false},
			{name: 'ST_HDRS -> ST_ENDM', p1: STATES.ST_HDRS, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_HDRS -> ST_QUIT', p1: STATES.ST_HDRS, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_HDRS -> ST_ABRT', p1: STATES.ST_HDRS, p2: STATES.ST_ABRT, res: true},
			{name: 'ST_HDRS -> ST_UNKN', p1: STATES.ST_HDRS, p2: STATES.ST_UNKN, res: false},
			{name: 'ST_HDRS -> ST_Q_NC', p1: STATES.ST_HDRS, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_HDRS -> ST_SKIP', p1: STATES.ST_HDRS, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_EOHS -> ST_INIT', p1: STATES.ST_EOHS, p2: STATES.ST_INIT, res: false},
			{name: 'ST_EOHS -> ST_OPTS', p1: STATES.ST_EOHS, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_EOHS -> ST_CONN', p1: STATES.ST_EOHS, p2: STATES.ST_CONN, res: false},
			{name: 'ST_EOHS -> ST_HELO', p1: STATES.ST_EOHS, p2: STATES.ST_HELO, res: false},
			{name: 'ST_EOHS -> ST_MAIL', p1: STATES.ST_EOHS, p2: STATES.ST_MAIL, res: false},
			{name: 'ST_EOHS -> ST_RCPT', p1: STATES.ST_EOHS, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_EOHS -> ST_DATA', p1: STATES.ST_EOHS, p2: STATES.ST_DATA, res: false},
			{name: 'ST_EOHS -> ST_HDRS', p1: STATES.ST_EOHS, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_EOHS -> ST_EOHS', p1: STATES.ST_EOHS, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_EOHS -> ST_BODY', p1: STATES.ST_EOHS, p2: STATES.ST_BODY, res: true},
			{name: 'ST_EOHS -> ST_ENDM', p1: STATES.ST_EOHS, p2: STATES.ST_ENDM, res: true},
			{name: 'ST_EOHS -> ST_QUIT', p1: STATES.ST_EOHS, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_EOHS -> ST_ABRT', p1: STATES.ST_EOHS, p2: STATES.ST_ABRT, res: true},
			{name: 'ST_EOHS -> ST_UNKN', p1: STATES.ST_EOHS, p2: STATES.ST_UNKN, res: false},
			{name: 'ST_EOHS -> ST_Q_NC', p1: STATES.ST_EOHS, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_EOHS -> ST_SKIP', p1: STATES.ST_EOHS, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_BODY -> ST_INIT', p1: STATES.ST_BODY, p2: STATES.ST_INIT, res: false},
			{name: 'ST_BODY -> ST_OPTS', p1: STATES.ST_BODY, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_BODY -> ST_CONN', p1: STATES.ST_BODY, p2: STATES.ST_CONN, res: false},
			{name: 'ST_BODY -> ST_HELO', p1: STATES.ST_BODY, p2: STATES.ST_HELO, res: false},
			{name: 'ST_BODY -> ST_MAIL', p1: STATES.ST_BODY, p2: STATES.ST_MAIL, res: false},
			{name: 'ST_BODY -> ST_RCPT', p1: STATES.ST_BODY, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_BODY -> ST_DATA', p1: STATES.ST_BODY, p2: STATES.ST_DATA, res: false},
			{name: 'ST_BODY -> ST_HDRS', p1: STATES.ST_BODY, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_BODY -> ST_EOHS', p1: STATES.ST_BODY, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_BODY -> ST_BODY', p1: STATES.ST_BODY, p2: STATES.ST_BODY, res: true},
			{name: 'ST_BODY -> ST_ENDM', p1: STATES.ST_BODY, p2: STATES.ST_ENDM, res: true},
			{name: 'ST_BODY -> ST_QUIT', p1: STATES.ST_BODY, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_BODY -> ST_ABRT', p1: STATES.ST_BODY, p2: STATES.ST_ABRT, res: true},
			{name: 'ST_BODY -> ST_UNKN', p1: STATES.ST_BODY, p2: STATES.ST_UNKN, res: false},
			{name: 'ST_BODY -> ST_Q_NC', p1: STATES.ST_BODY, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_BODY -> ST_SKIP', p1: STATES.ST_BODY, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_ENDM -> ST_INIT', p1: STATES.ST_ENDM, p2: STATES.ST_INIT, res: false},
			{name: 'ST_ENDM -> ST_OPTS', p1: STATES.ST_ENDM, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_ENDM -> ST_CONN', p1: STATES.ST_ENDM, p2: STATES.ST_CONN, res: false},
			{name: 'ST_ENDM -> ST_HELO', p1: STATES.ST_ENDM, p2: STATES.ST_HELO, res: false},
			{name: 'ST_ENDM -> ST_MAIL', p1: STATES.ST_ENDM, p2: STATES.ST_MAIL, res: true},
			{name: 'ST_ENDM -> ST_RCPT', p1: STATES.ST_ENDM, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_ENDM -> ST_DATA', p1: STATES.ST_ENDM, p2: STATES.ST_DATA, res: false},
			{name: 'ST_ENDM -> ST_HDRS', p1: STATES.ST_ENDM, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_ENDM -> ST_EOHS', p1: STATES.ST_ENDM, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_ENDM -> ST_BODY', p1: STATES.ST_ENDM, p2: STATES.ST_BODY, res: false},
			{name: 'ST_ENDM -> ST_ENDM', p1: STATES.ST_ENDM, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_ENDM -> ST_QUIT', p1: STATES.ST_ENDM, p2: STATES.ST_QUIT, res: true},
			{name: 'ST_ENDM -> ST_ABRT', p1: STATES.ST_ENDM, p2: STATES.ST_ABRT, res: false},
			{name: 'ST_ENDM -> ST_UNKN', p1: STATES.ST_ENDM, p2: STATES.ST_UNKN, res: true},
			{name: 'ST_ENDM -> ST_Q_NC', p1: STATES.ST_ENDM, p2: STATES.ST_Q_NC, res: true},
			{name: 'ST_ENDM -> ST_SKIP', p1: STATES.ST_ENDM, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_QUIT -> ST_INIT', p1: STATES.ST_QUIT, p2: STATES.ST_INIT, res: false},
			{name: 'ST_QUIT -> ST_OPTS', p1: STATES.ST_QUIT, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_QUIT -> ST_CONN', p1: STATES.ST_QUIT, p2: STATES.ST_CONN, res: false},
			{name: 'ST_QUIT -> ST_HELO', p1: STATES.ST_QUIT, p2: STATES.ST_HELO, res: false},
			{name: 'ST_QUIT -> ST_MAIL', p1: STATES.ST_QUIT, p2: STATES.ST_MAIL, res: false},
			{name: 'ST_QUIT -> ST_RCPT', p1: STATES.ST_QUIT, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_QUIT -> ST_DATA', p1: STATES.ST_QUIT, p2: STATES.ST_DATA, res: false},
			{name: 'ST_QUIT -> ST_HDRS', p1: STATES.ST_QUIT, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_QUIT -> ST_EOHS', p1: STATES.ST_QUIT, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_QUIT -> ST_BODY', p1: STATES.ST_QUIT, p2: STATES.ST_BODY, res: false},
			{name: 'ST_QUIT -> ST_ENDM', p1: STATES.ST_QUIT, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_QUIT -> ST_QUIT', p1: STATES.ST_QUIT, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_QUIT -> ST_ABRT', p1: STATES.ST_QUIT, p2: STATES.ST_ABRT, res: false},
			{name: 'ST_QUIT -> ST_UNKN', p1: STATES.ST_QUIT, p2: STATES.ST_UNKN, res: false},
			{name: 'ST_QUIT -> ST_Q_NC', p1: STATES.ST_QUIT, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_QUIT -> ST_SKIP', p1: STATES.ST_QUIT, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_ABRT -> ST_INIT', p1: STATES.ST_ABRT, p2: STATES.ST_INIT, res: false},
			{name: 'ST_ABRT -> ST_OPTS', p1: STATES.ST_ABRT, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_ABRT -> ST_CONN', p1: STATES.ST_ABRT, p2: STATES.ST_CONN, res: false},
			{name: 'ST_ABRT -> ST_HELO', p1: STATES.ST_ABRT, p2: STATES.ST_HELO, res: false},
			{name: 'ST_ABRT -> ST_MAIL', p1: STATES.ST_ABRT, p2: STATES.ST_MAIL, res: false},
			{name: 'ST_ABRT -> ST_RCPT', p1: STATES.ST_ABRT, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_ABRT -> ST_DATA', p1: STATES.ST_ABRT, p2: STATES.ST_DATA, res: false},
			{name: 'ST_ABRT -> ST_HDRS', p1: STATES.ST_ABRT, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_ABRT -> ST_EOHS', p1: STATES.ST_ABRT, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_ABRT -> ST_BODY', p1: STATES.ST_ABRT, p2: STATES.ST_BODY, res: false},
			{name: 'ST_ABRT -> ST_ENDM', p1: STATES.ST_ABRT, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_ABRT -> ST_QUIT', p1: STATES.ST_ABRT, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_ABRT -> ST_ABRT', p1: STATES.ST_ABRT, p2: STATES.ST_ABRT, res: false},
			{name: 'ST_ABRT -> ST_UNKN', p1: STATES.ST_ABRT, p2: STATES.ST_UNKN, res: false},
			{name: 'ST_ABRT -> ST_Q_NC', p1: STATES.ST_ABRT, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_ABRT -> ST_SKIP', p1: STATES.ST_ABRT, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_UNKN -> ST_INIT', p1: STATES.ST_UNKN, p2: STATES.ST_INIT, res: false},
			{name: 'ST_UNKN -> ST_OPTS', p1: STATES.ST_UNKN, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_UNKN -> ST_CONN', p1: STATES.ST_UNKN, p2: STATES.ST_CONN, res: false},
			{name: 'ST_UNKN -> ST_HELO', p1: STATES.ST_UNKN, p2: STATES.ST_HELO, res: true},
			{name: 'ST_UNKN -> ST_MAIL', p1: STATES.ST_UNKN, p2: STATES.ST_MAIL, res: true},
			{name: 'ST_UNKN -> ST_RCPT', p1: STATES.ST_UNKN, p2: STATES.ST_RCPT, res: true},
			{name: 'ST_UNKN -> ST_DATA', p1: STATES.ST_UNKN, p2: STATES.ST_DATA, res: true},
			{name: 'ST_UNKN -> ST_HDRS', p1: STATES.ST_UNKN, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_UNKN -> ST_EOHS', p1: STATES.ST_UNKN, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_UNKN -> ST_BODY', p1: STATES.ST_UNKN, p2: STATES.ST_BODY, res: true},
			{name: 'ST_UNKN -> ST_ENDM', p1: STATES.ST_UNKN, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_UNKN -> ST_QUIT', p1: STATES.ST_UNKN, p2: STATES.ST_QUIT, res: true},
			{name: 'ST_UNKN -> ST_ABRT', p1: STATES.ST_UNKN, p2: STATES.ST_ABRT, res: true},
			{name: 'ST_UNKN -> ST_UNKN', p1: STATES.ST_UNKN, p2: STATES.ST_UNKN, res: true},
			{name: 'ST_UNKN -> ST_Q_NC', p1: STATES.ST_UNKN, p2: STATES.ST_Q_NC, res: true},
			{name: 'ST_UNKN -> ST_SKIP', p1: STATES.ST_UNKN, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_Q_NC -> ST_INIT', p1: STATES.ST_Q_NC, p2: STATES.ST_INIT, res: false},
			{name: 'ST_Q_NC -> ST_OPTS', p1: STATES.ST_Q_NC, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_Q_NC -> ST_CONN', p1: STATES.ST_Q_NC, p2: STATES.ST_CONN, res: true},
			{name: 'ST_Q_NC -> ST_HELO', p1: STATES.ST_Q_NC, p2: STATES.ST_HELO, res: false},
			{name: 'ST_Q_NC -> ST_MAIL', p1: STATES.ST_Q_NC, p2: STATES.ST_MAIL, res: false},
			{name: 'ST_Q_NC -> ST_RCPT', p1: STATES.ST_Q_NC, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_Q_NC -> ST_DATA', p1: STATES.ST_Q_NC, p2: STATES.ST_DATA, res: false},
			{name: 'ST_Q_NC -> ST_HDRS', p1: STATES.ST_Q_NC, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_Q_NC -> ST_EOHS', p1: STATES.ST_Q_NC, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_Q_NC -> ST_BODY', p1: STATES.ST_Q_NC, p2: STATES.ST_BODY, res: false},
			{name: 'ST_Q_NC -> ST_ENDM', p1: STATES.ST_Q_NC, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_Q_NC -> ST_QUIT', p1: STATES.ST_Q_NC, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_Q_NC -> ST_ABRT', p1: STATES.ST_Q_NC, p2: STATES.ST_ABRT, res: false},
			{name: 'ST_Q_NC -> ST_UNKN', p1: STATES.ST_Q_NC, p2: STATES.ST_UNKN, res: true},
			{name: 'ST_Q_NC -> ST_Q_NC', p1: STATES.ST_Q_NC, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_Q_NC -> ST_SKIP', p1: STATES.ST_Q_NC, p2: STATES.ST_SKIP, res: false},

			{name: 'ST_SKIP -> ST_INIT', p1: STATES.ST_SKIP, p2: STATES.ST_INIT, res: false},
			{name: 'ST_SKIP -> ST_OPTS', p1: STATES.ST_SKIP, p2: STATES.ST_OPTS, res: false},
			{name: 'ST_SKIP -> ST_CONN', p1: STATES.ST_SKIP, p2: STATES.ST_CONN, res: false},
			{name: 'ST_SKIP -> ST_HELO', p1: STATES.ST_SKIP, p2: STATES.ST_HELO, res: false},
			{name: 'ST_SKIP -> ST_MAIL', p1: STATES.ST_SKIP, p2: STATES.ST_MAIL, res: false},
			{name: 'ST_SKIP -> ST_RCPT', p1: STATES.ST_SKIP, p2: STATES.ST_RCPT, res: false},
			{name: 'ST_SKIP -> ST_DATA', p1: STATES.ST_SKIP, p2: STATES.ST_DATA, res: false},
			{name: 'ST_SKIP -> ST_HDRS', p1: STATES.ST_SKIP, p2: STATES.ST_HDRS, res: false},
			{name: 'ST_SKIP -> ST_EOHS', p1: STATES.ST_SKIP, p2: STATES.ST_EOHS, res: false},
			{name: 'ST_SKIP -> ST_BODY', p1: STATES.ST_SKIP, p2: STATES.ST_BODY, res: false},
			{name: 'ST_SKIP -> ST_ENDM', p1: STATES.ST_SKIP, p2: STATES.ST_ENDM, res: false},
			{name: 'ST_SKIP -> ST_QUIT', p1: STATES.ST_SKIP, p2: STATES.ST_QUIT, res: false},
			{name: 'ST_SKIP -> ST_ABRT', p1: STATES.ST_SKIP, p2: STATES.ST_ABRT, res: false},
			{name: 'ST_SKIP -> ST_UNKN', p1: STATES.ST_SKIP, p2: STATES.ST_UNKN, res: false},
			{name: 'ST_SKIP -> ST_Q_NC', p1: STATES.ST_SKIP, p2: STATES.ST_Q_NC, res: false},
			{name: 'ST_SKIP -> ST_SKIP', p1: STATES.ST_SKIP, p2: STATES.ST_SKIP, res: false},
		].forEach(function(test) {
			it(test.name, function() {
				var result = Dispatcher._trans_ok(test.p1, test.p2);
				expect(result).to.equal(test.res);
			});
		});
	});

	describe('dec_argv', function() {
		it('no element', function() {
			var buf = new Buffer(0);

			var result = Dispatcher._dec_argv(buf);
			expect(result).to.be.length(0);
		});

		it('one element', function() {
			var buf = new Buffer(0);
			buf = Buffer.concat([buf, new Buffer('abc'), new Buffer([0])]);

			var result = Dispatcher._dec_argv(buf);
			expect(result).to.be.length(1);
			expect(result[0].toString()).to.equal('abc');
		});

		it('two elements', function() {
			var buf = new Buffer(0);
			buf = Buffer.concat([buf, new Buffer('abc'), new Buffer([0])]);
			buf = Buffer.concat([buf, new Buffer('def'), new Buffer([0])]);

			var result = Dispatcher._dec_argv(buf);
			expect(result).to.be.length(2);
			expect(result[0].toString()).to.equal('abc');
			expect(result[1].toString()).to.equal('def');
		});

		it('offset', function() {
			var buf = new Buffer(0);
			buf = Buffer.concat([buf, new Buffer('abc'), new Buffer([0])]);

			var result = Dispatcher._dec_argv(buf, 1);
			expect(result).to.be.length(1);
			expect(result[0].toString()).to.equal('bc');
		});
	});
});
