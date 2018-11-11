const Discord = require("discord.js");
const config = require("./config");

/**
  * Main Class
  *	@contructor
  * @param {clientOptions} options - Object of options to pass to parent.
  * @extends Discord.Client
  * @see {@link https://discord.js.org/#/docs/master/typedef/ClientOptions|ClientOptions}
  * @see {@link https://discord.js.org/#/docs/master/class/Client|Discord.Client}
  */
class FurryBot extends Discord.Client {
	constructor(options) {
		var opt = options || {};
   		super(opt);
    	Object.assign(this, require(`${process.cwd()}/util/logger`), require(`${process.cwd()}/util/misc`), require(`${process.cwd()}/util/functions`));
		this.util = require("util");
		this.config = config;
		for(let key in this.config.overrides) this[this.config.overrides[key]] = false;
		this.Discord = Discord;
		this.os = require("os");
		this.request = require("async-request");
		this.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
		this.Mixpanel = require("mixpanel");
		this.uuid = require("uuid/v4");
		this.fetch = require("node-fetch");
		this.mixpanel = this.Mixpanel.init(this.config.mixpanel, {
			protocol: 'https'
		});
    	this.fs = require("fs");
    	this.r = require("rethinkdbdash")(this.config.db);
		this.db = require(`${process.cwd()}/util/dbFunctions`)(this);
		this.commandTimeout = {};
		this.varParse = require(`${process.cwd()}/util/varHandler`);
		this.lang = require(`${process.cwd()}/lang`)(this);
		this.colors = require("console-colors-2");
		this.Canvas = require("canvas-constructor");
		this.fsn = require("fs-nextra");
		this.furpile = {};
		this._ = require("lodash");
		this.imageAPIRequest = (async(safe=true,category=null,json=true,filetype=null)=>{
			return new Promise(async(resolve, reject)=>{
				if(!self) var self = this;
				if([undefined,null,""].includes(json)) json = true;
				var url=`https://api.furrybot.me/${safe?"sfw":"nsfw"}/${category?category.toLowerCase():safe?"hug":"bulge"}/${json?"json":"image"}${filetype?`/${filetype}`:""}`;
				var r = await self.request(url);
				try {
					var j = JSON.parse(r.body);
					resolve(j);
				} catch(e) {
					reject({error:e,response:r.body});
				}
			});
		});
		this.download = ((url, filename)=>{
			return new Promise((resolve,reject)=>{
				if(!self) var self = this;
				self.request(url).pipe(self.fsn.createWriteStream(filename)).on('close', resolve)
			});
		});
		this.reloadModules = (async()=>{
			for(var key in require.cache){
				if(key.indexOf("\\node_modules") != -1){
					delete require.cache[key];
				}
			}
			console.debug("Reloaded all modules");
			return true;
		});
		this.reloadCommands = (async()=>{
			if(!self) var self = this;
			var resp = await self.request("https://api.furrybot.me/commands", {
					method: "GET",
					headers: {
							Authorization: `Key ${self.config.apiKey}`
					}
			});
			var response = JSON.parse(resp.body);
			self.config.commandList = {fullList: response.return.fullList, all: response.return.all};
			self.config.commandList.all.forEach((command)=>{
					self.commandTimeout[command] = new Set();
			});
			self.debug("Command Timeouts & Command List reloaded");
		});
		this.reloadAll = (async()=>{
			if(!self) var self = this;
				self.reloadCommands();
				self.reloadModules();
		});
		this.random = ((len=10,keyset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")=>{
			if(len > 250 && !self[self.config.overrides.random]) throw new Error("Cannot generate string of specified length, please set global override to override this.");
			let rand = ""
			for (var i = 0; i < len; i++)
			rand += keyset.charAt(Math.floor(Math.random() * keyset.length));

			return rand;
		});
		this.shortenUrl = (async(url)=>{
			if(!self) var self = this;
			self.r.tableList().then((list)=>{
				if(!list.includes("shorturl")) {
					self.r.tableCreate("shorturl");
					console.log(`[ShortURL]: Created Short URL table`);
				}
			});
			const create = (async(url)=>{
				var rand = self.random(5);
				var a = await self.r.table("shorturl").insert({id:rand,url});
				if(a.errors === 1) {
					return create(url);
				} else {
					return a.id;
				}
			});

			var res = await self.r.table("shorturl").filter({url});
			const rand = self.random(5);
			
			switch(res.length) {
				case 0:
					// create
					return create(url);
					break;

				case 1:
					// return
					return res[0];
					break;

				default:
					// delete & recreate
					console.log(`[ShortURL]: Duplicate records found, deleting`);
					self.r.table("shorturl").filter({url}).forEach((short)=>{
						return self.r.table("shorturl").get(short("id")).delete();
					});
					return create(url);
			}
		})
		this.mixpanel.track('bot.setup', {
			distinct_id: this.uuid(),
			timestamp: new Date().toISOString(),
			filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
		});
    	this.load.apply(this);
	}
	
	/**
	  * Load Function
	  */
	load() {
		console.log(`[loadEvent]: start load`);
		this.mixpanel.track('bot.load.start', {
			distinct_id: this.uuid(),
			timestamp: new Date().toISOString(),
			filename: __filename.indexOf("/") === 0 ? __filename.split("/").reverse()[0] : __filename.split("\\").reverse()[0]
		});
		this.fs.readdir(`${process.cwd()}/handlers/events/`, (err, files) => {
		    if (err) return console.error(err);
		    files.forEach(file => {
				if (!file.endsWith(".js")) return;
				const event = require(`./handlers/events/${file}`),
				 eventName = file.split(".")[0];

				this.on(eventName, event.bind(null,this));
				console.log(`[EventManager]: Loaded ${eventName} event`);
				delete require.cache[require.resolve(`./handlers/events/${file}`)];
		    });
		});
		
		console.log("[loadEvent]: end of load");
	}
}

const client = new FurryBot({disableEveryone:true});

//console.log(client.db.getGuild);

client.login(config.bot.token);

process.on("SIGINT", async () => {
	self = client;
	console.debug(`${self.colors.fg.red}${self.colors.sp.bold}Force close via CTRL+C${self.colors.sp.reset}`);
	self.destroy();
	process.kill(process.pid, 'SIGTERM' );
});