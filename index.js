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
    Object.assign(this, require(`${process.cwd()}/utility/logger.js`), require(`${process.cwd()}/utility/misc`), require(`${process.cwd()}/utility/functions`));
		global.util = require("util");
		this.config = config;
		this.MessageEmbed = Discord.MessageEmbed;
		this.MessageAttachment = Discord.MessageAttachment;
		this.os = require("os");
		this.request = require("async-request");
		this.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    this.fs = require("fs");
    this.r = require("rethinkdbdash")(this.config.db);
		this.db = require(`${process.cwd()}/utility/dbFunctions`)(this);
		this.commandTimeout = {};
		this.varParse = require(`${process.cwd()}/utility/varHandler`);
		this.lang = require(`${process.cwd()}/lang`)(this);
		this.colors = require("console-colors-2");
		this.Canvas = require("canvas-constructor");
		this.fsn = require("fs-nextra");
		this.furpile = {};
		this._ = require("lodash")
		this.imageAPIRequest = (async(safe=true,category=null,json=true,filetype=null)=>{
			return new Promise(async(resolve, reject)=>{
				if(!self) var self = this;
				var url=`https://api.furrybot.me/${safe?"sfw":"nsfw"}/${category?category.toLowerCase():safe?"hug":"bulge"}/${json?"json":"image"}${filetype?filetype:""}`;
				var r = await self.request(url);
				return resolve(JSON.parse(r.body));
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
			self.debug("Reloaded all modules");
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
		this.reload = (async()=>{
			if(!self) var self = this;
				self.reloadCommands();
				self.reloadModules();
		});
    this.load.apply(this);
	}
	
	/**
	  * Load Function
	  */
	load() {
		this.log("load");
		this.fs.readdir(`${process.cwd()}/handlers/events/`, (err, files) => {
		    if (err) return console.error(err);
		    files.forEach(file => {
				if (!file.endsWith(".js")) return;
				const event = require(`./handlers/events/${file}`);
				let eventName = file.split(".")[0];

				this.on(eventName, event.bind(null,this));
				this.log(`Loaded ${eventName} event`);
				delete require.cache[require.resolve(`./handlers/events/${file}`)];
		    });
		});
		this.log("end of load");
	}
}

const client = new FurryBot({disableEveryone:true});

//console.log(client.db.getGuild);

client.login(config.bot.token);

process.on("SIGINT", async () => {
	self = client;
	self.debug(`${self.colors.fg.red}${self.colors.sp.bold}Force close via CTRL+C${self.colors.sp.reset}`);
	self.destroy();
	process.kill(process.pid, 'SIGTERM' );
});