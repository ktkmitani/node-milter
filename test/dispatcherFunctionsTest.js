var expect = require('chai').expect;
var Dispatcher = require('../lib/dispatcher');
var ST = Dispatcher.ST;

describe('Dispatcher functions', function() {
	describe('trans_ok', function() {
		[
			{name: 'INIT -> INIT', p1: ST.INIT, p2: ST.INIT, res: false},
			{name: 'INIT -> OPTS', p1: ST.INIT, p2: ST.OPTS, res: true},
			{name: 'INIT -> CONN', p1: ST.INIT, p2: ST.CONN, res: false},
			{name: 'INIT -> HELO', p1: ST.INIT, p2: ST.HELO, res: false},
			{name: 'INIT -> MAIL', p1: ST.INIT, p2: ST.MAIL, res: false},
			{name: 'INIT -> RCPT', p1: ST.INIT, p2: ST.RCPT, res: false},
			{name: 'INIT -> DATA', p1: ST.INIT, p2: ST.DATA, res: false},
			{name: 'INIT -> HDRS', p1: ST.INIT, p2: ST.HDRS, res: false},
			{name: 'INIT -> EOHS', p1: ST.INIT, p2: ST.EOHS, res: false},
			{name: 'INIT -> BODY', p1: ST.INIT, p2: ST.BODY, res: false},
			{name: 'INIT -> ENDM', p1: ST.INIT, p2: ST.ENDM, res: false},
			{name: 'INIT -> QUIT', p1: ST.INIT, p2: ST.QUIT, res: false},
			{name: 'INIT -> ABRT', p1: ST.INIT, p2: ST.ABRT, res: false},
			{name: 'INIT -> UNKN', p1: ST.INIT, p2: ST.UNKN, res: false},
			{name: 'INIT -> Q_NC', p1: ST.INIT, p2: ST.Q_NC, res: false},
			{name: 'INIT -> SKIP', p1: ST.INIT, p2: ST.SKIP, res: false},

			{name: 'OPTS -> INIT', p1: ST.OPTS, p2: ST.INIT, res: false},
			{name: 'OPTS -> OPTS', p1: ST.OPTS, p2: ST.OPTS, res: false},
			{name: 'OPTS -> CONN', p1: ST.OPTS, p2: ST.CONN, res: true},
			{name: 'OPTS -> HELO', p1: ST.OPTS, p2: ST.HELO, res: false},
			{name: 'OPTS -> MAIL', p1: ST.OPTS, p2: ST.MAIL, res: false},
			{name: 'OPTS -> RCPT', p1: ST.OPTS, p2: ST.RCPT, res: false},
			{name: 'OPTS -> DATA', p1: ST.OPTS, p2: ST.DATA, res: false},
			{name: 'OPTS -> HDRS', p1: ST.OPTS, p2: ST.HDRS, res: false},
			{name: 'OPTS -> EOHS', p1: ST.OPTS, p2: ST.EOHS, res: false},
			{name: 'OPTS -> BODY', p1: ST.OPTS, p2: ST.BODY, res: false},
			{name: 'OPTS -> ENDM', p1: ST.OPTS, p2: ST.ENDM, res: false},
			{name: 'OPTS -> QUIT', p1: ST.OPTS, p2: ST.QUIT, res: false},
			{name: 'OPTS -> ABRT', p1: ST.OPTS, p2: ST.ABRT, res: false},
			{name: 'OPTS -> UNKN', p1: ST.OPTS, p2: ST.UNKN, res: true},
			{name: 'OPTS -> Q_NC', p1: ST.OPTS, p2: ST.Q_NC, res: false},
			{name: 'OPTS -> SKIP', p1: ST.OPTS, p2: ST.SKIP, res: false},

			{name: 'CONN -> INIT', p1: ST.CONN, p2: ST.INIT, res: false},
			{name: 'CONN -> OPTS', p1: ST.CONN, p2: ST.OPTS, res: false},
			{name: 'CONN -> CONN', p1: ST.CONN, p2: ST.CONN, res: false},
			{name: 'CONN -> HELO', p1: ST.CONN, p2: ST.HELO, res: true},
			{name: 'CONN -> MAIL', p1: ST.CONN, p2: ST.MAIL, res: true},
			{name: 'CONN -> RCPT', p1: ST.CONN, p2: ST.RCPT, res: false},
			{name: 'CONN -> DATA', p1: ST.CONN, p2: ST.DATA, res: false},
			{name: 'CONN -> HDRS', p1: ST.CONN, p2: ST.HDRS, res: false},
			{name: 'CONN -> EOHS', p1: ST.CONN, p2: ST.EOHS, res: false},
			{name: 'CONN -> BODY', p1: ST.CONN, p2: ST.BODY, res: false},
			{name: 'CONN -> ENDM', p1: ST.CONN, p2: ST.ENDM, res: false},
			{name: 'CONN -> QUIT', p1: ST.CONN, p2: ST.QUIT, res: false},
			{name: 'CONN -> ABRT', p1: ST.CONN, p2: ST.ABRT, res: false},
			{name: 'CONN -> UNKN', p1: ST.CONN, p2: ST.UNKN, res: true},
			{name: 'CONN -> Q_NC', p1: ST.CONN, p2: ST.Q_NC, res: false},
			{name: 'CONN -> SKIP', p1: ST.CONN, p2: ST.SKIP, res: false},

			{name: 'HELO -> INIT', p1: ST.HELO, p2: ST.INIT, res: false},
			{name: 'HELO -> OPTS', p1: ST.HELO, p2: ST.OPTS, res: false},
			{name: 'HELO -> CONN', p1: ST.HELO, p2: ST.CONN, res: false},
			{name: 'HELO -> HELO', p1: ST.HELO, p2: ST.HELO, res: true},
			{name: 'HELO -> MAIL', p1: ST.HELO, p2: ST.MAIL, res: true},
			{name: 'HELO -> RCPT', p1: ST.HELO, p2: ST.RCPT, res: false},
			{name: 'HELO -> DATA', p1: ST.HELO, p2: ST.DATA, res: false},
			{name: 'HELO -> HDRS', p1: ST.HELO, p2: ST.HDRS, res: false},
			{name: 'HELO -> EOHS', p1: ST.HELO, p2: ST.EOHS, res: false},
			{name: 'HELO -> BODY', p1: ST.HELO, p2: ST.BODY, res: false},
			{name: 'HELO -> ENDM', p1: ST.HELO, p2: ST.ENDM, res: false},
			{name: 'HELO -> QUIT', p1: ST.HELO, p2: ST.QUIT, res: false},
			{name: 'HELO -> ABRT', p1: ST.HELO, p2: ST.ABRT, res: false},
			{name: 'HELO -> UNKN', p1: ST.HELO, p2: ST.UNKN, res: true},
			{name: 'HELO -> Q_NC', p1: ST.HELO, p2: ST.Q_NC, res: false},
			{name: 'HELO -> SKIP', p1: ST.HELO, p2: ST.SKIP, res: false},

			{name: 'MAIL -> INIT', p1: ST.MAIL, p2: ST.INIT, res: false},
			{name: 'MAIL -> OPTS', p1: ST.MAIL, p2: ST.OPTS, res: false},
			{name: 'MAIL -> CONN', p1: ST.MAIL, p2: ST.CONN, res: false},
			{name: 'MAIL -> HELO', p1: ST.MAIL, p2: ST.HELO, res: false},
			{name: 'MAIL -> MAIL', p1: ST.MAIL, p2: ST.MAIL, res: false},
			{name: 'MAIL -> RCPT', p1: ST.MAIL, p2: ST.RCPT, res: true},
			{name: 'MAIL -> DATA', p1: ST.MAIL, p2: ST.DATA, res: false},
			{name: 'MAIL -> HDRS', p1: ST.MAIL, p2: ST.HDRS, res: false},
			{name: 'MAIL -> EOHS', p1: ST.MAIL, p2: ST.EOHS, res: false},
			{name: 'MAIL -> BODY', p1: ST.MAIL, p2: ST.BODY, res: false},
			{name: 'MAIL -> ENDM', p1: ST.MAIL, p2: ST.ENDM, res: false},
			{name: 'MAIL -> QUIT', p1: ST.MAIL, p2: ST.QUIT, res: false},
			{name: 'MAIL -> ABRT', p1: ST.MAIL, p2: ST.ABRT, res: true},
			{name: 'MAIL -> UNKN', p1: ST.MAIL, p2: ST.UNKN, res: true},
			{name: 'MAIL -> Q_NC', p1: ST.MAIL, p2: ST.Q_NC, res: false},
			{name: 'MAIL -> SKIP', p1: ST.MAIL, p2: ST.SKIP, res: false},

			{name: 'RCPT -> INIT', p1: ST.RCPT, p2: ST.INIT, res: false},
			{name: 'RCPT -> OPTS', p1: ST.RCPT, p2: ST.OPTS, res: false},
			{name: 'RCPT -> CONN', p1: ST.RCPT, p2: ST.CONN, res: false},
			{name: 'RCPT -> HELO', p1: ST.RCPT, p2: ST.HELO, res: false},
			{name: 'RCPT -> MAIL', p1: ST.RCPT, p2: ST.MAIL, res: false},
			{name: 'RCPT -> RCPT', p1: ST.RCPT, p2: ST.RCPT, res: true},
			{name: 'RCPT -> DATA', p1: ST.RCPT, p2: ST.DATA, res: true},
			{name: 'RCPT -> HDRS', p1: ST.RCPT, p2: ST.HDRS, res: true},
			{name: 'RCPT -> EOHS', p1: ST.RCPT, p2: ST.EOHS, res: true},
			{name: 'RCPT -> BODY', p1: ST.RCPT, p2: ST.BODY, res: true},
			{name: 'RCPT -> ENDM', p1: ST.RCPT, p2: ST.ENDM, res: true},
			{name: 'RCPT -> QUIT', p1: ST.RCPT, p2: ST.QUIT, res: false},
			{name: 'RCPT -> ABRT', p1: ST.RCPT, p2: ST.ABRT, res: true},
			{name: 'RCPT -> UNKN', p1: ST.RCPT, p2: ST.UNKN, res: true},
			{name: 'RCPT -> Q_NC', p1: ST.RCPT, p2: ST.Q_NC, res: false},
			{name: 'RCPT -> SKIP', p1: ST.RCPT, p2: ST.SKIP, res: false},

			{name: 'DATA -> INIT', p1: ST.DATA, p2: ST.INIT, res: false},
			{name: 'DATA -> OPTS', p1: ST.DATA, p2: ST.OPTS, res: false},
			{name: 'DATA -> CONN', p1: ST.DATA, p2: ST.CONN, res: false},
			{name: 'DATA -> HELO', p1: ST.DATA, p2: ST.HELO, res: false},
			{name: 'DATA -> MAIL', p1: ST.DATA, p2: ST.MAIL, res: false},
			{name: 'DATA -> RCPT', p1: ST.DATA, p2: ST.RCPT, res: false},
			{name: 'DATA -> DATA', p1: ST.DATA, p2: ST.DATA, res: false},
			{name: 'DATA -> HDRS', p1: ST.DATA, p2: ST.HDRS, res: true},
			{name: 'DATA -> EOHS', p1: ST.DATA, p2: ST.EOHS, res: true},
			{name: 'DATA -> BODY', p1: ST.DATA, p2: ST.BODY, res: false},
			{name: 'DATA -> ENDM', p1: ST.DATA, p2: ST.ENDM, res: false},
			{name: 'DATA -> QUIT', p1: ST.DATA, p2: ST.QUIT, res: false},
			{name: 'DATA -> ABRT', p1: ST.DATA, p2: ST.ABRT, res: true},
			{name: 'DATA -> UNKN', p1: ST.DATA, p2: ST.UNKN, res: false},
			{name: 'DATA -> Q_NC', p1: ST.DATA, p2: ST.Q_NC, res: false},
			{name: 'DATA -> SKIP', p1: ST.DATA, p2: ST.SKIP, res: false},

			{name: 'HDRS -> INIT', p1: ST.HDRS, p2: ST.INIT, res: false},
			{name: 'HDRS -> OPTS', p1: ST.HDRS, p2: ST.OPTS, res: false},
			{name: 'HDRS -> CONN', p1: ST.HDRS, p2: ST.CONN, res: false},
			{name: 'HDRS -> HELO', p1: ST.HDRS, p2: ST.HELO, res: false},
			{name: 'HDRS -> MAIL', p1: ST.HDRS, p2: ST.MAIL, res: false},
			{name: 'HDRS -> RCPT', p1: ST.HDRS, p2: ST.RCPT, res: false},
			{name: 'HDRS -> DATA', p1: ST.HDRS, p2: ST.DATA, res: false},
			{name: 'HDRS -> HDRS', p1: ST.HDRS, p2: ST.HDRS, res: true},
			{name: 'HDRS -> EOHS', p1: ST.HDRS, p2: ST.EOHS, res: true},
			{name: 'HDRS -> BODY', p1: ST.HDRS, p2: ST.BODY, res: false},
			{name: 'HDRS -> ENDM', p1: ST.HDRS, p2: ST.ENDM, res: false},
			{name: 'HDRS -> QUIT', p1: ST.HDRS, p2: ST.QUIT, res: false},
			{name: 'HDRS -> ABRT', p1: ST.HDRS, p2: ST.ABRT, res: true},
			{name: 'HDRS -> UNKN', p1: ST.HDRS, p2: ST.UNKN, res: false},
			{name: 'HDRS -> Q_NC', p1: ST.HDRS, p2: ST.Q_NC, res: false},
			{name: 'HDRS -> SKIP', p1: ST.HDRS, p2: ST.SKIP, res: false},

			{name: 'EOHS -> INIT', p1: ST.EOHS, p2: ST.INIT, res: false},
			{name: 'EOHS -> OPTS', p1: ST.EOHS, p2: ST.OPTS, res: false},
			{name: 'EOHS -> CONN', p1: ST.EOHS, p2: ST.CONN, res: false},
			{name: 'EOHS -> HELO', p1: ST.EOHS, p2: ST.HELO, res: false},
			{name: 'EOHS -> MAIL', p1: ST.EOHS, p2: ST.MAIL, res: false},
			{name: 'EOHS -> RCPT', p1: ST.EOHS, p2: ST.RCPT, res: false},
			{name: 'EOHS -> DATA', p1: ST.EOHS, p2: ST.DATA, res: false},
			{name: 'EOHS -> HDRS', p1: ST.EOHS, p2: ST.HDRS, res: false},
			{name: 'EOHS -> EOHS', p1: ST.EOHS, p2: ST.EOHS, res: false},
			{name: 'EOHS -> BODY', p1: ST.EOHS, p2: ST.BODY, res: true},
			{name: 'EOHS -> ENDM', p1: ST.EOHS, p2: ST.ENDM, res: true},
			{name: 'EOHS -> QUIT', p1: ST.EOHS, p2: ST.QUIT, res: false},
			{name: 'EOHS -> ABRT', p1: ST.EOHS, p2: ST.ABRT, res: true},
			{name: 'EOHS -> UNKN', p1: ST.EOHS, p2: ST.UNKN, res: false},
			{name: 'EOHS -> Q_NC', p1: ST.EOHS, p2: ST.Q_NC, res: false},
			{name: 'EOHS -> SKIP', p1: ST.EOHS, p2: ST.SKIP, res: false},

			{name: 'BODY -> INIT', p1: ST.BODY, p2: ST.INIT, res: false},
			{name: 'BODY -> OPTS', p1: ST.BODY, p2: ST.OPTS, res: false},
			{name: 'BODY -> CONN', p1: ST.BODY, p2: ST.CONN, res: false},
			{name: 'BODY -> HELO', p1: ST.BODY, p2: ST.HELO, res: false},
			{name: 'BODY -> MAIL', p1: ST.BODY, p2: ST.MAIL, res: false},
			{name: 'BODY -> RCPT', p1: ST.BODY, p2: ST.RCPT, res: false},
			{name: 'BODY -> DATA', p1: ST.BODY, p2: ST.DATA, res: false},
			{name: 'BODY -> HDRS', p1: ST.BODY, p2: ST.HDRS, res: false},
			{name: 'BODY -> EOHS', p1: ST.BODY, p2: ST.EOHS, res: false},
			{name: 'BODY -> BODY', p1: ST.BODY, p2: ST.BODY, res: true},
			{name: 'BODY -> ENDM', p1: ST.BODY, p2: ST.ENDM, res: true},
			{name: 'BODY -> QUIT', p1: ST.BODY, p2: ST.QUIT, res: false},
			{name: 'BODY -> ABRT', p1: ST.BODY, p2: ST.ABRT, res: true},
			{name: 'BODY -> UNKN', p1: ST.BODY, p2: ST.UNKN, res: false},
			{name: 'BODY -> Q_NC', p1: ST.BODY, p2: ST.Q_NC, res: false},
			{name: 'BODY -> SKIP', p1: ST.BODY, p2: ST.SKIP, res: false},

			{name: 'ENDM -> INIT', p1: ST.ENDM, p2: ST.INIT, res: false},
			{name: 'ENDM -> OPTS', p1: ST.ENDM, p2: ST.OPTS, res: false},
			{name: 'ENDM -> CONN', p1: ST.ENDM, p2: ST.CONN, res: false},
			{name: 'ENDM -> HELO', p1: ST.ENDM, p2: ST.HELO, res: false},
			{name: 'ENDM -> MAIL', p1: ST.ENDM, p2: ST.MAIL, res: true},
			{name: 'ENDM -> RCPT', p1: ST.ENDM, p2: ST.RCPT, res: false},
			{name: 'ENDM -> DATA', p1: ST.ENDM, p2: ST.DATA, res: false},
			{name: 'ENDM -> HDRS', p1: ST.ENDM, p2: ST.HDRS, res: false},
			{name: 'ENDM -> EOHS', p1: ST.ENDM, p2: ST.EOHS, res: false},
			{name: 'ENDM -> BODY', p1: ST.ENDM, p2: ST.BODY, res: false},
			{name: 'ENDM -> ENDM', p1: ST.ENDM, p2: ST.ENDM, res: false},
			{name: 'ENDM -> QUIT', p1: ST.ENDM, p2: ST.QUIT, res: true},
			{name: 'ENDM -> ABRT', p1: ST.ENDM, p2: ST.ABRT, res: false},
			{name: 'ENDM -> UNKN', p1: ST.ENDM, p2: ST.UNKN, res: true},
			{name: 'ENDM -> Q_NC', p1: ST.ENDM, p2: ST.Q_NC, res: true},
			{name: 'ENDM -> SKIP', p1: ST.ENDM, p2: ST.SKIP, res: false},

			{name: 'QUIT -> INIT', p1: ST.QUIT, p2: ST.INIT, res: false},
			{name: 'QUIT -> OPTS', p1: ST.QUIT, p2: ST.OPTS, res: false},
			{name: 'QUIT -> CONN', p1: ST.QUIT, p2: ST.CONN, res: false},
			{name: 'QUIT -> HELO', p1: ST.QUIT, p2: ST.HELO, res: false},
			{name: 'QUIT -> MAIL', p1: ST.QUIT, p2: ST.MAIL, res: false},
			{name: 'QUIT -> RCPT', p1: ST.QUIT, p2: ST.RCPT, res: false},
			{name: 'QUIT -> DATA', p1: ST.QUIT, p2: ST.DATA, res: false},
			{name: 'QUIT -> HDRS', p1: ST.QUIT, p2: ST.HDRS, res: false},
			{name: 'QUIT -> EOHS', p1: ST.QUIT, p2: ST.EOHS, res: false},
			{name: 'QUIT -> BODY', p1: ST.QUIT, p2: ST.BODY, res: false},
			{name: 'QUIT -> ENDM', p1: ST.QUIT, p2: ST.ENDM, res: false},
			{name: 'QUIT -> QUIT', p1: ST.QUIT, p2: ST.QUIT, res: false},
			{name: 'QUIT -> ABRT', p1: ST.QUIT, p2: ST.ABRT, res: false},
			{name: 'QUIT -> UNKN', p1: ST.QUIT, p2: ST.UNKN, res: false},
			{name: 'QUIT -> Q_NC', p1: ST.QUIT, p2: ST.Q_NC, res: false},
			{name: 'QUIT -> SKIP', p1: ST.QUIT, p2: ST.SKIP, res: false},

			{name: 'ABRT -> INIT', p1: ST.ABRT, p2: ST.INIT, res: false},
			{name: 'ABRT -> OPTS', p1: ST.ABRT, p2: ST.OPTS, res: false},
			{name: 'ABRT -> CONN', p1: ST.ABRT, p2: ST.CONN, res: false},
			{name: 'ABRT -> HELO', p1: ST.ABRT, p2: ST.HELO, res: false},
			{name: 'ABRT -> MAIL', p1: ST.ABRT, p2: ST.MAIL, res: false},
			{name: 'ABRT -> RCPT', p1: ST.ABRT, p2: ST.RCPT, res: false},
			{name: 'ABRT -> DATA', p1: ST.ABRT, p2: ST.DATA, res: false},
			{name: 'ABRT -> HDRS', p1: ST.ABRT, p2: ST.HDRS, res: false},
			{name: 'ABRT -> EOHS', p1: ST.ABRT, p2: ST.EOHS, res: false},
			{name: 'ABRT -> BODY', p1: ST.ABRT, p2: ST.BODY, res: false},
			{name: 'ABRT -> ENDM', p1: ST.ABRT, p2: ST.ENDM, res: false},
			{name: 'ABRT -> QUIT', p1: ST.ABRT, p2: ST.QUIT, res: false},
			{name: 'ABRT -> ABRT', p1: ST.ABRT, p2: ST.ABRT, res: false},
			{name: 'ABRT -> UNKN', p1: ST.ABRT, p2: ST.UNKN, res: false},
			{name: 'ABRT -> Q_NC', p1: ST.ABRT, p2: ST.Q_NC, res: false},
			{name: 'ABRT -> SKIP', p1: ST.ABRT, p2: ST.SKIP, res: false},

			{name: 'UNKN -> INIT', p1: ST.UNKN, p2: ST.INIT, res: false},
			{name: 'UNKN -> OPTS', p1: ST.UNKN, p2: ST.OPTS, res: false},
			{name: 'UNKN -> CONN', p1: ST.UNKN, p2: ST.CONN, res: false},
			{name: 'UNKN -> HELO', p1: ST.UNKN, p2: ST.HELO, res: true},
			{name: 'UNKN -> MAIL', p1: ST.UNKN, p2: ST.MAIL, res: true},
			{name: 'UNKN -> RCPT', p1: ST.UNKN, p2: ST.RCPT, res: true},
			{name: 'UNKN -> DATA', p1: ST.UNKN, p2: ST.DATA, res: true},
			{name: 'UNKN -> HDRS', p1: ST.UNKN, p2: ST.HDRS, res: false},
			{name: 'UNKN -> EOHS', p1: ST.UNKN, p2: ST.EOHS, res: false},
			{name: 'UNKN -> BODY', p1: ST.UNKN, p2: ST.BODY, res: true},
			{name: 'UNKN -> ENDM', p1: ST.UNKN, p2: ST.ENDM, res: false},
			{name: 'UNKN -> QUIT', p1: ST.UNKN, p2: ST.QUIT, res: true},
			{name: 'UNKN -> ABRT', p1: ST.UNKN, p2: ST.ABRT, res: true},
			{name: 'UNKN -> UNKN', p1: ST.UNKN, p2: ST.UNKN, res: true},
			{name: 'UNKN -> Q_NC', p1: ST.UNKN, p2: ST.Q_NC, res: true},
			{name: 'UNKN -> SKIP', p1: ST.UNKN, p2: ST.SKIP, res: false},

			{name: 'Q_NC -> INIT', p1: ST.Q_NC, p2: ST.INIT, res: false},
			{name: 'Q_NC -> OPTS', p1: ST.Q_NC, p2: ST.OPTS, res: false},
			{name: 'Q_NC -> CONN', p1: ST.Q_NC, p2: ST.CONN, res: true},
			{name: 'Q_NC -> HELO', p1: ST.Q_NC, p2: ST.HELO, res: false},
			{name: 'Q_NC -> MAIL', p1: ST.Q_NC, p2: ST.MAIL, res: false},
			{name: 'Q_NC -> RCPT', p1: ST.Q_NC, p2: ST.RCPT, res: false},
			{name: 'Q_NC -> DATA', p1: ST.Q_NC, p2: ST.DATA, res: false},
			{name: 'Q_NC -> HDRS', p1: ST.Q_NC, p2: ST.HDRS, res: false},
			{name: 'Q_NC -> EOHS', p1: ST.Q_NC, p2: ST.EOHS, res: false},
			{name: 'Q_NC -> BODY', p1: ST.Q_NC, p2: ST.BODY, res: false},
			{name: 'Q_NC -> ENDM', p1: ST.Q_NC, p2: ST.ENDM, res: false},
			{name: 'Q_NC -> QUIT', p1: ST.Q_NC, p2: ST.QUIT, res: false},
			{name: 'Q_NC -> ABRT', p1: ST.Q_NC, p2: ST.ABRT, res: false},
			{name: 'Q_NC -> UNKN', p1: ST.Q_NC, p2: ST.UNKN, res: true},
			{name: 'Q_NC -> Q_NC', p1: ST.Q_NC, p2: ST.Q_NC, res: false},
			{name: 'Q_NC -> SKIP', p1: ST.Q_NC, p2: ST.SKIP, res: false},

			{name: 'SKIP -> INIT', p1: ST.SKIP, p2: ST.INIT, res: false},
			{name: 'SKIP -> OPTS', p1: ST.SKIP, p2: ST.OPTS, res: false},
			{name: 'SKIP -> CONN', p1: ST.SKIP, p2: ST.CONN, res: false},
			{name: 'SKIP -> HELO', p1: ST.SKIP, p2: ST.HELO, res: false},
			{name: 'SKIP -> MAIL', p1: ST.SKIP, p2: ST.MAIL, res: false},
			{name: 'SKIP -> RCPT', p1: ST.SKIP, p2: ST.RCPT, res: false},
			{name: 'SKIP -> DATA', p1: ST.SKIP, p2: ST.DATA, res: false},
			{name: 'SKIP -> HDRS', p1: ST.SKIP, p2: ST.HDRS, res: false},
			{name: 'SKIP -> EOHS', p1: ST.SKIP, p2: ST.EOHS, res: false},
			{name: 'SKIP -> BODY', p1: ST.SKIP, p2: ST.BODY, res: false},
			{name: 'SKIP -> ENDM', p1: ST.SKIP, p2: ST.ENDM, res: false},
			{name: 'SKIP -> QUIT', p1: ST.SKIP, p2: ST.QUIT, res: false},
			{name: 'SKIP -> ABRT', p1: ST.SKIP, p2: ST.ABRT, res: false},
			{name: 'SKIP -> UNKN', p1: ST.SKIP, p2: ST.UNKN, res: false},
			{name: 'SKIP -> Q_NC', p1: ST.SKIP, p2: ST.Q_NC, res: false},
			{name: 'SKIP -> SKIP', p1: ST.SKIP, p2: ST.SKIP, res: false},
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
