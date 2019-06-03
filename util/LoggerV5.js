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
		const {
			util,
			config,
			path,
			functions,
			fs
		} = require("../modules/CommandRequire");
		try {
			if(!(typeof msg === "string") && !(msg instanceof Object)) msg = msg.toString();
			else msg = msg instanceof Object ? util.inspect(msg) : msg;
		} catch(e) {}
		
		if(fs.existsSync(`${config.rootDir}/logs`)) fs.appendFileSync(`${config.rootDir}/logs/${functions._getDate()}.txt`,`[${new Date().toString().split(" ")[4]}][${path.basename(functions._getCallerFile())}][${name}]: ${msg}\n`);
		else process.send({ name: "error", msg: "Error logging to file: logs directory not found" });
		return process.send({ name, msg: `[${path.basename(functions._getCallerFile())}]: ${msg}` });
	}
}

module.exports = {
	FurryBotLogger,
	log: ((msg, name = "log") => {
		const util = require("util");
		const date = Date().toString().split(" ").slice(1, 5).join(" ");
		msg = msg instanceof Object ? util.inspect(msg) : msg;
		return process.send({ name, msg });
	})
};