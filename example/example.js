var nodemilter = require('../index');
var async = require('async');

var flags = 0
	| nodemilter.SMFIF_ADDHDRS
	| nodemilter.SMFIF_CHGHDRS
	| nodemilter.SMFIF_CHGBODY
	| nodemilter.SMFIF_ADDRCPT
	| nodemilter.SMFIF_ADDRCPT_PAR
	| nodemilter.SMFIF_DELRCPT
	| nodemilter.SMFIF_QUARANTINE
	| nodemilter.SMFIF_CHGFROM
	| nodemilter.SMFIF_SETSYMLIST
	;

var milter = nodemilter.createMilter({name: 'test-milter', flags: flags});

milter.setCallback('negotiate', function(ctx, f1, f2, f3, f4, callback) {
	console.log('negotiate %s %s %s %s',
		f1.toString(16), f2.toString(16), f3.toString(16), f4.toString(16));
	callback(nodemilter.SMFIS_ALL_OPTS);
});

milter.setCallback('connect', function(ctx, hostname, address, port, callback) {
	console.log('connect [%s][%s][%d]', hostname, address, port);
	callback(nodemilter.SMFIS_CONTINUE);
});

milter.setCallback('helo', function(ctx, helohost, callback) {
	console.log('helo [%s]', helohost);
	callback(nodemilter.SMFIS_CONTINUE);
});

milter.setCallback('envfrom', function(ctx, argv, callback) {
	console.log('envfrom [%s]', argv[0]);
	callback(nodemilter.SMFIS_CONTINUE);
});

milter.setCallback('envrcpt', function(ctx, argv, callback) {
	console.log('envrcpt [%s]', argv[0]);
	callback(nodemilter.SMFIS_CONTINUE);
});

milter.setCallback('data', function(ctx,  callback) {
	console.log('data');
	callback(nodemilter.SMFIS_CONTINUE);
});

milter.setCallback('header', function(ctx, field, value, callback) {
	console.log('header [%s][%s]', field, value);
	callback(nodemilter.SMFIS_CONTINUE);
});

milter.setCallback('eoh', function(ctx, callback) {
	console.log('eoh');
	callback(nodemilter.SMFIS_CONTINUE);
});

milter.setCallback('body', function(ctx, data, callback) {
	console.log('body len = %d', data.length);
	callback(nodemilter.SMFIS_CONTINUE);
});

milter.setCallback('eom', function(ctx, callback) {
	console.log('eom');

	async.waterfall([
		function(callback) {
			milter.addheader(ctx, 'X-foo', 'foo', function(result) {
				if (result !== nodemilter.MI_SUCCESS) {
					callback('addheader error');
					return;
				}

				callback();
			});
		},
		function(callback) {
			milter.insheader(ctx, 0, 'X-boo', 'boo', function(result) {
				if (result !== nodemilter.MI_SUCCESS) {
					callback('insheader error');
					return;
				}

				callback();
			});
		},
		function(callback) {
			milter.chgheader(ctx, 'X-boo2', 0, 'boo2', function(result) {
				if (result !== nodemilter.MI_SUCCESS) {
					callback('chgheader error');
					return;
				}

				callback();
			});
		},
		function(callback) {
			milter.chgfrom(ctx, 'ktk.mitani@gmail.com', function(result) {
				if (result !== nodemilter.MI_SUCCESS) {
					callback('chgfrom error');
					return;
				}

				callback();
			});
		},
		function(callback) {
			milter.addrcpt(ctx, 'ktk.mitani@gmail.com', function(result) {
				if (result !== nodemilter.MI_SUCCESS) {
					callback('addrcpt error');
					return;
				}

				callback();
			});
		},
		function(callback) {
			milter.addrcpt_par(ctx, 'ktk.mitani2@gmail.com', function(result) {
				if (result !== nodemilter.MI_SUCCESS) {
					callback('addrcpt_par error');
					return;
				}

				callback();
			});
		},
		function(callback) {
			milter.delrcpt(ctx, 'ktk.mitani@gmail.com', function(result) {
				if (result !== nodemilter.MI_SUCCESS) {
					callback('delrcpt error');
					return;
				}

				callback();
			});
		},
		function(callback) {
			milter.replacebody(ctx, 'replace body', function(result) {
				if (result !== nodemilter.MI_SUCCESS) {
					callback('replacebody error');
					return;
				}

				callback();
			});
		},
		function(callback) {
			milter.progress(ctx,  function(result) {
				if (result !== nodemilter.MI_SUCCESS) {
					callback('progress error');
					return;
				}

				callback();
			});
		},
		function(callback) {
			milter.quarantine(ctx,  'test', function(result) {
				if (result !== nodemilter.MI_SUCCESS) {
					callback('quarantine error');
					return;
				}

				callback();
			});
		}
	], function(err) {
		if (err) {
			console.log(err);
			callback(nodemilter.SMFIS_TEMPFAIL);
			return;
		}

		callback(nodemilter.SMFIS_CONTINUE);
	});
});

milter.setCallback('abort', function(ctx, callback) {
	console.log('abort');
	callback(nodemilter.SMFIS_CONTINUE);
});

milter.setCallback('unknown', function(ctx, data, callback) {
	console.log('unknown');
	callback(nodemilter.SMFIS_CONTINUE);
});

milter.listen(10025, function() {
	console.log('milter started on port 10025');
});
