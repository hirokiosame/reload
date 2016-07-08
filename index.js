define([
	'jquery'
], function ($) {

	'use strict';

	var cache = {};

	function ping (path) {

		var promise = $.Deferred();
		var url = requirejs.s.contexts._.config.baseUrl + path + '.js';

		var xhr = $.ajax({
			type: 'HEAD',
			url: url + '?' + Date.now(),
			success: function() {
				promise.resolve([path, xhr.getResponseHeader('Last-Modified')]);
			}
		});

		return promise;
	}

	function watch(paths, callback) {

		var pingReload = function () {

			// Start watching
			$.when.apply($, paths.map(function (path) {

				requirejs.undef(path);
				return ping(path);

			})).done(function(){

				var args = [].slice.apply(arguments);

				var reload = false;

				args.forEach(function(arg){
					var path = arg[0];
					var lastModified = arg[1];

					if (cache[path] !== lastModified) {
						reload = true;
					}

					cache[path] = lastModified;
				});

				if (reload) {
					console.info('Reloading', paths);
					require(paths, callback);
				}
			});
		};

		pingReload();

		return pingReload;
	}

	function reload (paths, callback, interval) {

		var watchFiles = setInterval(watch(paths, callback), interval || 2000);

		return {
			stop: function () {
				clearInterval(watchFiles);
			}
		};
	}

	return reload;
});