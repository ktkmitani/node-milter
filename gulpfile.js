var gulp = require('gulp');
var connect = require('gulp-connect');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

gulp.task('connect', function() {
	return connect.server({
		port: 8000,
		livereload: true
	});
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
