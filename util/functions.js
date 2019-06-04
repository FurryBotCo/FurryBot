/* eslint-disable no-redeclare */
const os = require("os"),
	phin = require("phin"),
	config = require("../config"),
	util = require("util"),
	request = util.promisify(require("request"));

module.exports = {
	memory: {
		process: {
			getTotal: (() => process.memoryUsage().heapTotal),
			getUsed: (() => process.memoryUsage().heapUsed),
			getRSS: (() => process.memoryUsage().rss),
			getExternal: (() => process.memoryUsage().external),
			getAll: (() => ({
				total: process.memoryUsage().heapTotal,
				used: process.memoryUsage().heapUsed,
				rss: process.memoryUsage().rss,
				external: process.memoryUsage().external
			}))
		},
		system: {
			getTotal: (() => os.totalmem()),
			getUsed: (() => os.totalmem() - os.freemem()),
			getFree: (() => os.freemem()),
			getAll: (() => ({
				total: os.totalmem(),
				used: os.totalmem() - os.freemem(),
				free: os.freemem()
			}))
		}
	},
	checkSemVer: ((ver) => require("semver").valid(ver) === ver),
	getCurrentTimestamp: (() => new Date().toISOString()),
	secondsToHours: ((sec) => {
		let sec_num = parseInt(sec, 10);
		let hours   = Math.floor(sec_num / 3600);
		let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		let seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours   < 10) hours = `0${hours}`;
		if (minutes < 10) minutes = `0${minutes}`;
		if (seconds < 10) seconds = `0${seconds}`;
		return `${hours}:${minutes}:${seconds}`;
	}),
	ucwords: ((str) => str.toString().toLowerCase().replace(/^(.)|\s+(.)/g,(r) => r.toUpperCase())),
	toReadableDate: ((date) => {
		if(!(date instanceof Date)) throw new Error("must provide javascript Date object.");
		var a = date.toISOString().replace("Z","").split("T");
		return `${a[0]} ${a[1].split(".")[0]} UTC`;
	}),
	makeSafe: ((msg) => msg.replace(/\@everyone/,"@\u200Beveryone").replace(/\@here/,"@\u200Bhere")), // eslint-disable-line no-useless-escape
	ms: ((ms) => {
		var cd = ms/1000;
		if(cd === 1) {
			var cooldown = `${cd} second`;
		} else if (cd === 0) {
			var cooldown = "none";
		} else {
			if(cd >= 60) {
				var mm=cd/60;
				if(mm === 1) {
					var cooldown = `${mm} minute`;
				} else {
					if(mm >= 60) {
						var hh = mm/60;
						if(hh === 1) {
							var cooldown = `${hh} hour`;
						} else {
							if(hh >= 24) {
								var dd = hh/24;
								if(dd === 1) {
									var cooldown = `${dd} day`;
								} else {
									var cooldown = `${dd} days`;
								}
							} else {
								var cooldown = `${hh} hours`;
							}
						}
					} else {
						var cooldown = `${mm} minutes`;
					}
				}
			} else {
				var cooldown = `${cd} seconds`;
			}
		}
		return cooldown;
	}),
	parseTime: ((time,full = false,ms = false) => {
		if(ms) var time = time / 1000;
		const methods = [
			{ name: full ? " day" : "d", count: 86400 },
			{ name: full ? " hour": "h", count: 3600 },
			{ name: full ? " minute" : "m", count: 60 },
			{ name: full ? " second" : "s", count: 1 }
		];

		const timeStr = [`${Math.floor(time / methods[0].count).toString()}${methods[0].name}${Math.floor(time / methods[0].count) > 1 && full? "s" : ""}`];
		for (let i = 0; i < 3; i++) {
			timeStr.push(`${Math.floor(time % methods[i].count / methods[i + 1].count).toString()}${methods[i + 1].name}${Math.floor(time % methods[i].count / methods[i + 1].count) > 1 && full ? "s" : ""}`);
		}
		var j = timeStr.filter(g => !g.startsWith("0")).join(", ");
		if(j.length === 0) var j = "no time";
		return j;
	}),
	randomColor: (() => Math.floor(Math.random() * 0xFFFFFF)),
	removeDuplicates: ((array) => [...new Set(array).values()]),
	processSub: (async(cmd,msg,ctx) => {
		if(msg.args.length > 0 && cmd.hasSubCommands && cmd.subCommands.map(s => s.triggers).reduce((a,b) => a.concat(b)).includes(msg.args[0].toLowerCase())) {
			const sub = msg.args.shift().toLowerCase();
			msg.unparsedArgs.shift();
			if(msg.command instanceof Array) msg.command.push(sub);
			else msg.command = [msg.command,sub];
			return cmd.subCommands.find(s => s.triggers.includes(sub)).run.call(ctx,msg);
		} else return "NOSUB";
	}),
	subCmds: ((dir,file) => {
		const fs = require("fs"),
			d = file.split(/(\\|\/)+/g).reverse()[0].split(".")[0].split("-")[0];
		if(fs.existsSync(`${dir}/${d}`)) {
			if(fs.existsSync(`${dir}/${d}/index.js`)) return require(`${dir}/${d}/index.js`);
			else {
				console.warn(`Subcommand directory found, but no index present. Attempting to auto create index..\nCommand Directory: ${dir}\nCommand File: ${file}\nSubcommand Directory: ${dir}${process.platform === "win32" ? "\\" : "/"}${d}`);
				if(fs.existsSync(`${process.cwd()}/default/subcmdindex.js`)) fs.copyFileSync(`${process.cwd()}/default/subcmdindex.js`,`${dir}/${d}/index.js`);
				if(fs.existsSync(`${dir}/${d}/index.js`)) {
					console.debug("Auto copying worked, continuing as normal..");
					return require(`${dir}/${d}/index.js`);
				} else {
					console.error(`Auto copying failed, please check that default/subcmdindex.js exists, and is readable/writable, and that I can write in ${dir}${process.platform === "win32" ? "\\" : "/"}${d}`);
				}
				return [];
			}
		}
		return null;
	}),
	hasSubCmds: ((dir,file) => require("fs").existsSync(`${dir}/${file.split(/(\\|\/)+/g).reverse()[0].split(".")[0].split("-")[0]}`)),
	_getCallerFile: (() => {
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
	}),
	_getDate: (() => {
		var date = new Date();
		return `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`;
	}),
	getImageFromURL: (async(url) => require("util").promisify(require("request"))(url,{
		encoding: null
	}).then(res => res.body)),
	/**
	 * fetch an image from the furry bot api
	 * @async
	 * @param {*} animal - fetch from animal category (true) or furry category (false)
	 * @param {*} category - image category
	 * @see {@link https://apidocs.furry.bot|Furry Bot Api Documentation}
	 * @param {*} json - fetch JSON (true) or image (false)
	 * @param {*} safe use sfw (true) or nsfw (false) category, only makes a difference if `animal` is false
	 * @returns {(Object|Buffer)} - json body from request or image buffer
	 */
	imageAPIRequest: (async(animal = true,category = null,json = true, safe = false) => {
		return new Promise(async(resolve, reject) => {
			let s;
			if([undefined,null,""].includes(json)) json = true;
			
			try {
				s = await phin({
					method: "GET",
					url: `https://api.furry.bot/${animal ? "animals" : `furry/${safe?"sfw":"nsfw"}`}/${category?category.toLowerCase():safe?"hug":"bulge"}${json?"":"/image"}`.replace(/\s/g,""),
					parse: "json"
				});
				resolve(s.body);
			} catch(error) {
				reject({
					error,
					response: s.body
				});
			}
		});
	}),
	/**
	 * dank memer api request
	 * @async
	 * @param {String} path - path to request
	 * @param {URL[]} [avatars=[]] - array of avatars to use in request
	 * @param {String} [text=""] - text to use in request
	 * @returns {Object}
	 */
	memeRequest: (async(path,avatars = [],text = "") => {
		
		avatars = typeof avatars === "string" ? [avatars] : avatars;
		return request(`https://dankmemer.services/api${path}`,{
			method: "POST",
			json: {avatars,text},
			headers: {
				Authorization: config.apis.dankMemer.token,
				"User-Agent": config.userAgent,
				"Content-Type": "application/json"
			},
			encoding: null
		});
	})
};