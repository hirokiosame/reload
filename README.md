# *reload* for *[requireJS](https://github.com/requirejs/requirejs)*

*reload* enables Hot Module Replacement (HMR) with requireJS. With HMR, you will not have to refresh the page to view changes made to particular modules.

## Installation
```
bower install hirokiosame/reload --save-dev
```

## Usage

```
define([
	'jquery',
	'reload'
], function (
	$,
	reload
) {

	// Some logic...

	// Files we want to watch
	var reload1 = reload(['file/in/development'], function (DevFile) {
	
		// Re-render module
		$(document.body).html(DevFile.render());
	});


	// To stop reload
	reload1.stop();
});
```

### Caveats
reload uses polling to watch changes to a file every *n* seconds (defaulting to 2 seconds and can be overwritten via the third argument). This will not stop until `.stop()` is invoked; be careful! I'm considering using sockets to pipe change events instead for a future release.

The current implementation of polling also checks the header for `Last-Modified` changes. This means that this will not work for servers that do not return this header property. Checking only the header gives us the benefit of making `HEAD` requests to reduce latency and bandwidth consumption. Will add an option to make `GET` requests so the content of the files are compared in future versions.
