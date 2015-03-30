var gulp = require('gulp');
var webserver = require('gulp-webserver');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

gulp.task('webserver', function() {
	gulp.src('.')
		.pipe(webserver({
			port: 8000,
			directoryListing: true,
			livereload: true
		}));
});

gulp.task('test', function(cb) {
	gulp.src(['lib/**/*.js'])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on('finish', function() {
			gulp.src(['test/**/*Test.js'])
				.pipe(mocha())
				.pipe(istanbul.writeReports())
				.on('end', cb);
		});
});
