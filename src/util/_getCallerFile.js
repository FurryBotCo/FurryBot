/*
This is kept in a javascript file because it throws errors in typescript
*/

module.exports = function _getCallerFile() {
	var originalFunc = Error.prepareStackTrace;

	var callerfile;
	try {
		var err = new Error();
		var currentfile;

		Error.prepareStackTrace = function (err, stack) {
			return stack;
		};

		currentfile = err.stack.shift().getFileName();

		while (err.stack.length) {
			callerfile = err.stack.shift().getFileName();

			if (currentfile !== callerfile) break;
		}
	} catch (e) {}

	Error.prepareStackTrace = originalFunc;

	return callerfile;
}