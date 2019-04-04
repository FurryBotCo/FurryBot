/* eslint-disable no-undef */

const config = require("../config.js");

module.exports= ((message, extra = {client: {shard: {id: 0, count: 1}}, type: "log"}) => {
	try {
		if(typeof colors == "undefined") {
			var colors=require("console-colors-2");
		}
		if (typeof extra == "undefined") return new Error("missing extra (object) parameter.");
		if (extra.length < 1) return new Error("extra must not be empty.");
		//if (typeof extra.shard == "undefined") return new Error("missing shard parameter in extra.");
		if(typeof extra.client === "undefined") {
			no_display_shard=true;
		} else {
			no_display_shard=false;
			if (typeof extra.client.shard !== "undefined" && extra.client.shard !== null) {
				shard_id=extra.client.shard.id;
				shard_count=extra.client.shard.count;
			} else {
				shard_id=0;
				shard_count=1;
			}
		}
		if(typeof extra.type == "undefined") return new Error("missing type in extra.");
		var time = Date().toString().split(" ").slice(1, 5)[3];
		message = message instanceof Object ? require("util").inspect(message) : message;
		switch(extra.type.toLowerCase()) {
		case "log":
			type_color="green";
			type="LOG";
			break;
			
		case "commandexecuted":
			type_color="green";
			type="COMMAND EXECUTED";
			break;
				
		case "warn":
			type_color="yellow";
			type="WARN";
			break;
				
		case "error":
			type_color="red";
			type="ERROR";
			break;
			
		case "debug":
			type_color="cyan";
			type="DEBUG";
			break;
				
		case "settingsupdate":
			type_color="cyan";
			type="SETTINGS UPDATE";
			break;
				
		case "info":
			type_color="white";
			type="INFO";
			break;
				
		case "rethinkdblog":
			type_color="cyan";
			type="RETHINKDB";
			break;
				
		default:
			return new Error("invalid log type");
		}
		switch(no_display_shard) {
		case true:
			process.stdout.write(`${colors.sp.reset}[${colors.fg[type_color]}${type}${colors.sp.reset}][${colors.fg.cyan}${colors.sp.bold}${time}${colors.sp.reset}][${colors.fg.magenta}${colors.sp.bold}General${colors.sp.reset}]: ${colors.fg[type_color]}${colors.sp.bold}${message}${colors.sp.reset}\n`);
			break;
				
		default:
			process.stdout.write(`${colors.sp.reset}[${colors.fg[type_color]}${type}${colors.sp.reset}][${colors.fg.cyan}${colors.sp.bold}${time}${colors.sp.reset}][${colors.fg.magenta}${colors.sp.bold}Shard ${shard_id+1}/${shard_count}${colors.sp.reset}]: ${colors.fg[type_color]}${colors.sp.bold}${message}${colors.sp.reset}\n`);
		}
	}catch(e){return new Error(e);}
});

module.exports.log=((message, client) => {
	var extra = {type: "log"};
	if(typeof client !== "undefined") {
		Object.assign(extra, {client:client});
	}
	
	var l=module.exports(message,extra);
	if(l instanceof Error) return new Error(l);
	return true;
});

module.exports.warn=((message, client) => {
	var extra = {type: "warn"};
	if(typeof client !== "undefined") {
		Object.assign(extra, {client:client});
	}
	
	var l=module.exports(message,extra);
	if(l instanceof Error) return new Error(l);
	return true;
});

module.exports.error=((message, client) => {
	var extra = {type: "error"};
	if(typeof client !== "undefined") {
		Object.assign(extra, {client:client});
	}
	
	var l=module.exports(message,extra);
	if(l instanceof Error) return new Error(l);
	return true;
});

module.exports.debug=((message, client) => {
	if(typeof config == "undefined") {
		const config = require("../config.js");
	}
	if(typeof config.debug !== "undefined" && config.debug == true) {
		var extra = {type: "debug"};
		if(typeof client !== "undefined") {
			Object.assign(extra, {client:client});
		}
		
		var l=module.exports(message,extra);
		if(l instanceof Error) return new Error(l);
		return true;
	}
});

module.exports.info=((message, client) => {
	var extra = {type: "info"};
	if(typeof client !== "undefined") {
		Object.assign(extra, {client:client});
	}
	var l=module.exports(message,extra);
	if(l instanceof Error) return new Error(l);
	return true;
});

module.exports.rethinkdblog=((message, client) => {
	var extra = {type: "rethinkdblog"};
	if(typeof client !== "undefined") {
		Object.assign(extra, {client:client});
	}
	var l=module.exports(message,extra);
	if(l instanceof Error) return new Error(l);
	return true;
});

module.exports.settingslog=((message, client) => {
	var extra = {type: "settingsupdate"};
	if(typeof client !== "undefined") {
		Object.assign(extra, {client:client});
	}
	var l=module.exports(message,extra);
	if(l instanceof Error) return new Error(l);
	return true;
});

module.exports.commandlog=((message, client) => {
	var extra = {type: "commandexecuted"};
	if(typeof client !== "undefined") {
		Object.assign(extra, {client:client});
	}
	var l=module.exports(message,extra);
	if(l instanceof Error) return new Error(l);
	return true;
});

module.exports.clear=((reason) => {
	process.stdout.write("\033[2J");
	if(typeof reason !== "undefined") {
		module.exports.log(`Console Cleared: ${reason}`);
	} else {
		module.exports.log("Console Cleared");
	}
});

global.console.log=module.exports.log;
global.console.warn=module.exports.warn;
global.console.error=module.exports.error;
global.console.debug=module.exports.debug;
global.console.info=module.exports.info;
global.console.rethinkdblog=module.exports.rethinkdblog;
global.console.settingslog=module.exports.settingslog;
global.console.commandlog=module.exports.commandlog;
global.console.clear=module.exports.clear;