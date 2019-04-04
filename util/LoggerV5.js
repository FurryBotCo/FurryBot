class FurryBotLogger {
	constructor() {

	}

	log(msg) {
		return this._log("log",msg);
	}

	warn(msg) {
		return this._log("warn",msg);
	}

	error(msg) {
		return this._log("error",msg);
	}

	info(msg) {
		return this._log("info",msg);
	}

	debug(msg) {
		return this._log("debug",msg);
	}

	command(msg) {
		return this._log("info",msg);
	}

	_log(name,msg) {
		msg = msg instanceof Object ? require("util").inspect(msg) : msg;
		msg = `[${require("path").basename(this._getCallerFile())}][${new Date().toString().split(" ")[4]}]: ${msg}`;
		if(require("fs").existsSync(`${require("../config").rootDir}/logs`)) require("fs").appendFileSync(`${require("../config").rootDir}/logs/${this._getDate()}.txt`,`${msg}\n`);
		else process.send({ name: "error", msg: "Error logging to file: logs directory not found" });
		return process.send({ name, msg });
	}

	_getCallerFile() {
		try {
			var err = new Error();
			var callerfile;
			var currentfile;
	
			Error.prepareStackTrace = function (err, stack) { return stack; };
	
			currentfile = err.stack.shift().getFileName();
	
			while (err.stack.length) {
				callerfile = err.stack.shift().getFileName();
	
				if(currentfile !== callerfile) return callerfile;
			}
		} catch (error) {}
		return undefined;
	}

	_getDate() {
		var date = new Date();
		return `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`;
	}
}

module.exports = {
	FurryBotLogger,
	log: ((msg, name = "log") => {
		const date = Date().toString().split(" ").slice(1, 5).join(" ");
		msg = msg instanceof Object ? require("util").inspect(msg) : msg;
		return process.send({ name, msg });
	})
};