/*
This is kept in a javascript file because it throws errors in typescript
*/

module.exports = (() => {
    try {
        var err = new Error();
        var callerfile;
        var currentfile;

        Error.prepareStackTrace = function (err, stack) {
            return stack;
        };

        currentfile = err.stack.shift().getFileName();

        while (err.stack.length) {
            callerfile = err.stack.shift().getFileName();

            if (currentfile !== callerfile) return callerfile;
        }
    } catch (error) {}
    return undefined;
})