/*
FurryBot Custom Logger V2
9-13-18
*/

const config = require("../config.js");

module.exports = {
	
	main: ((message,type) => {
		try {
			if(typeof colors === "undefined") {
				var colors=require("console-colors-2");
			}
			if(type.length == 0) var type = "log";
			
			/*if(typeof self !== "undefined") {
				var no_shard = false;
				try {
					var shard_id = self.shard.id;
					var shard_count = self.shard.count;
				}catch(e){
					var shard_id = 0;
					var shard_count = 1;
				}
			} else {*/
				var no_shard = true;
			//}
			
			var time = Date().toString().split(' ')[4];
			var message = message instanceof Object ? require('util').inspect(message) : message;
			
			switch(type.toLowerCase()) {
				case "log":
					var type_color = "green";
					var type = "LOG";
					break;
					
				case "command":
					var type_color = "green";
					var type = "COMMAND";
					break;
					
				case "warn":
					var type_color = "yellow";
					var type = "WARN";
					break;
					
				case "error":
					var type_color = "red";
					var type = "ERROR";
					break;
					
				case "debug":
					var type_color = "cyan";
					var type = "DEBUG";
					break;
					
				case "info":
					var type_color = "white";
					var type = "info";
					break;
					
				case "rethinkdb":
					var type_color = "cyan";
					var type = "RETHINKDB";
					break;
					
				default:
					return new Error("invalid log type");
			}
			
			var ext=config.beta?`[${colors.fg.magenta}BETA${colors.sp.reset}]`:"";
			
			if(no_shard) {
				process.stdout.write(`${colors.sp.reset}${ext}[${colors.fg[type_color]}${type}${colors.sp.reset}][${colors.fg.cyan}${colors.sp.bold}${time}${colors.sp.reset}][${colors.fg.magenta}${colors.sp.bold}General${colors.sp.reset}]: ${colors.fg[type_color]}${colors.sp.bold}${message}${colors.sp.reset}\n`);
			} else {
				process.stdout.write(`${colors.sp.reset}${ext}[${colors.fg[type_color]}${type}${colors.sp.reset}][${colors.fg.cyan}${colors.sp.bold}${time}${colors.sp.reset}][${colors.fg.magenta}${colors.sp.bold}Shard ${shard_id+1}/${shard_count}${colors.sp.reset}]: ${colors.fg[type_color]}${colors.sp.bold}${message}${colors.sp.reset}\n`);
			}
		}catch(e){
			return e;
		}
	}),
	log: ((message) => {
		var l=module.exports.main(message,"log");
		if(l instanceof Error) return l;
		return true;
	}),
	warn: ((message) => {
		var l=module.exports.main(message,"warn");
		if(l instanceof Error) return l;
		return true;
	}),
	error: ((message) => {
		var l=module.exports.main(message,"error");
		if(l instanceof Error) return l;
		return true;
	}),
	debug: ((message) => {
		var l=module.exports.main(message,"debug");
		if(l instanceof Error) return l;
		return true;
	}),
	info: ((message) => {
		var l=module.exports.main(message,"info");
		if(l instanceof Error) return l;
		return true;
	}),
	command: ((message) => {
		var l=module.exports.main(message,"command");
		if(l instanceof Error) return l;
		return true;
	}),
	get commandlog() {
		return module.exports.command;
	},
	rethinkdb: ((message) => {
		var l=module.exports.main(message,"rethinkdb");
		if(l instanceof Error) return l;
		return true;
	}),
	get rethinkdblog() {
		return module.exports.rethinkdb;
	},
	clear: ((reason) => {
		process.stdout.write("\033[2J");
		if(typeof reason !== "undefined") {
			module.exports.log(`Console Cleared: ${reason}`);
		} else {
			module.exports.log(`Console Cleared`);
		}
	})
};

global.console.log=module.exports.log;
global.console.warn=module.exports.warn;
global.console.error=module.exports.error;
global.console.debug=module.exports.debug;
global.console.info=module.exports.info;
global.console.rethinkdb=module.exports.rethinkd;
global.console.rethinkdblog=module.exports.rethinkdblog;
global.console.command=module.exports.command;
global.console.commandlog=module.exports.commandlog;
global.console.clear=module.exports.clear;