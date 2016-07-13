define([
	'jquery'
], function ($) {

	'use strict';

	var cache = {};

	function getLastModified (path) {

		var promise = $.Deferred();
		var url = requirejs.s.contexts._.config.baseUrl + path + '.js';

		var xhr = $.ajax({
			type: 'HEAD',
			url: url + '?' + Date.now(),
			success: function () {
				promise.resolve([path, xhr.getResponseHeader('Last-Modified')]);
			}
		});

		return promise;
	}

	function checkOutdated (lastModifiedDates) {

		var outdated = false;

		lastModifiedDates.forEach(function (arg) {
			var path = arg[0];
			var lastModified = arg[1];

			if (cache[path] !== lastModified) {
				outdated = true;
			}

			cache[path] = lastModified;
		});

		return outdated;
	}

	function watch (paths, callback) {

		function checkFileChanges () {

			$.when.apply($, paths.map(function (path) {

				requirejs.undef(path);

				return getLastModified(path);

			})).done(function () {

				var lastModifiedDates = [].slice.apply(arguments);
				var reload = checkOutdated(lastModifiedDates);

				if (reload) {
					console.info('Reloading', paths);
					require(paths, callback);
				}
			});
		}

		checkFileChanges();

		return checkFileChanges;
	}

	function reload (paths, callback, interval) {

		var watchFiles = setInterval(watch(paths, callback), interval || 2000);

		return {
			stop: function () {

				clearInterval(watchFiles);

				paths.forEach(function (path) {
					cache[path] = undefined;
				});
			}
		};
	}

	return reload;
});