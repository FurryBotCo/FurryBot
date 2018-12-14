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
    	Object.assign(this, /*require(`${process.cwd()}/util/logger`), */require(`${process.cwd()}/util/misc`), require(`${process.cwd()}/util/functions`));
		this.util = require("util");
		this.config = config;
		this.stats = {
			messagesSinceStart: 0,
			messagesSinceLastPost: 0,
			dmMessagesSinceStart: 0,
			dmMessagesSinceLastPost: 0,
			commandTotalsSinceStart: 0,
			commandTotalsSinceLastPost: 0
		};
		for(let key in this.config.overrides) this[this.config.overrides[key]] = false;
		this.Discord = Discord;
		this.os = require("os");
		this.request = this.util.promisify(require("request").defaults({encoding:null}));
		this.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
		this.Mixpanel = require("mixpanel");
		this.uuid = require("uuid/v4");
		this.fetch = require("node-fetch");
		this.postStats = require("./util/listStats");
		this.mixpanel = this.Mixpanel.init(this.config.mixpanel.token, {
			protocol: "https"
		});
    	this.fs = require("fs");
		this.r = require("rethinkdbdash")(this.config.db.bot);
<<<<<<< HEAD
		//this.ro = require("rethinkdbdash")(this.config.db.other);
=======
		this.ro = require("rethinkdbdash")(this.config.db.other);
>>>>>>> c77c41c9b1cfbe01522a74ffc45914cc0b9f5de4
		this.FurryBotDatabase = require(`${process.cwd()}/util/dbFunctions`);
		this.FurryBotLogger = require(`${this.config.rootDir}/util/loggerV3`);
		this.commandTimeout = {};
		this.varParse = require(`${process.cwd()}/util/varHandler`);
		this.listStats = require("./util/listStats");
		this.lang = require(`${process.cwd()}/lang`)(this);
		this.colors = require("console-colors-2");
		this.Canvas = require("canvas-constructor").Canvas;
		this.fsn = require("fs-nextra");
		this.chalk = require("chalk");
		this.chunk = require("chunk");
		this.ytdl = require("ytdl-core");
		this.furpile = {};
		this.server = new (require("./server"))(this.config.serverOptions);
		this.yiffNoticeViewed = new Set();
		this._ = require("lodash");
		this.perf = require("perf_hooks");
		this.dbStats = require(`${this.config.rootDir}/util/dbStats`);
   		this.performance = this.perf.performance;
		this.PerformanceObserver = this.perf.PerformanceObserver;
		this.child_process = require('child-process-promise');
		this.shell = this.child_process.exec;
		this.truncate = require("truncate");
		this.webhooks = {};
		for(let key in this.config.webhooks) {
			this.webhooks[key] = new this.Discord.WebhookClient(this.config.webhooks[key].id,this.config.webhooks[key].token,{disableEveryone:true});
			console.debug(`Setup ${key} webhook`);
		}
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
		console.log("[loadEvent]: start load");
		this.mixpanel.track("bot.load.start", {
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

	async imageAPIRequest (safe=true,category=null,json=true,filetype=null) {
		return new Promise(async(resolve, reject)=>{
			if([undefined,null,""].includes(json)) json = true;
			var s = await this.request(`https://api.furrybot.me/${safe?"sfw":"nsfw"}/${category?category.toLowerCase():safe?"hug":"bulge"}/${json?"json":"image"}${filetype?`/${filetype}`:""}`);
			try {
				var j = JSON.parse(s.body);
				resolve(j);
			} catch(e) {
				reject({error:e,response:s.body});
			}
		});
	}

	async download (url, filename) {
		return new Promise((resolve,reject)=>{
			require("request")(url).pipe(this.fsn.createWriteStream(filename)).on('close', resolve)
		});
	}

	async reloadModules () {
		for(var key in require.cache){
			if(key.indexOf("\\node_modules") !== -1){
				delete require.cache[key];
			}
		}
		console.debug("Reloaded all modules");
		return true;
	}

	async reloadCommands () {
		var resp = await this.request("https://api.furrybot.me/commands", {
				method: "GET",
				headers: {
						Authorization: `Key ${this.config.apiKey}`
				}
		});
		var response = JSON.parse(resp.body);
		this.config.commandList = {fullList: response.return.fullList, all: response.return.all};
		this.config.commandList.all.forEach((command)=>{
				this.commandTimeout[command] = new Set();
		});
		this.debug("Command Timeouts & Command List reloaded");
	}

	async reloadAll () {
		this.reloadCommands();
		this.reloadModules();
	}

	async random (len=10,keyset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
		if(len > 500 && !this[this.config.overrides.random]) throw new Error("Cannot generate string of specified length, please set global override to override this.");
		let rand = ""
		for (var i = 0; i < len; i++)
		rand += keyset.charAt(Math.floor(Math.random() * keyset.length));

		return rand;
	}

	async shortenUrl (url) {
		this.r.tableList().then((list)=>{
			if(!list.includes("shorturl")) {
				this.r.tableCreate("shorturl");
				console.log(`[ShortURL]: Created Short URL table`);
			}
		});
		const create = (async(url)=>{
			var count = await this.r.table("shorturl").count();
			var c = count;
			if(c === 0) c = 1;
			c = Math.floor(c/62);
			/*62 = 26 (a-z) + 26 (A-Z) + 10 (0-9)*/
			if(c === count) c++;
			if(c < 5) c = c+Math.abs(c-5);
			var rand = await this.random(Math.ceil(c));
			var createdTimestamp = Date.now();
			var created = new Date().toISOString();
			var a = await this.r.table("shorturl").insert({id:rand,url,linkNumber:count+1,createdTimestamp,created,length:c,link:`https://furry.services/r/${rand}`});
			if(a.errors === 1) {
				return create(url);
			} else {
				return {code:rand,url,link:`https://furry.services/r/${rand}`,new:true,linkNumber:count+1,createdTimestamp,created,length:c};
			}
		});

		var res = await this.r.table("shorturl").filter({url});
		
		switch(res.length) {
			case 0:
				// create
				return create(url);
				break;

			case 1:
				// return
				var a = res[0];
				return {code:a.id,url,link:`https://furry.services/r/${a.id}`,new:false};
				break;

			default:
				// delete & recreate
				console.log("[ShortURL]: Duplicate records found, deleting");
				this.r.table("shorturl").filter({url}).forEach((short)=>{
					return this.r.table("shorturl").get(short("id")).delete();
				});
				return create(url);
		}
	}

	async deleteAll (table,database = "furrybot") {
		if(["rethinkdb"].includes(database)) throw new Error("{code:2,error:'ERR_ILLEGAL_DB',description:'illegal database'}");
		if(["guilds","users"].includes(table)) throw new Error("{code:1,error:'ERR_ILLEGAL_TABLE',description:'illegal database'}");
		var dbList = await this.r.dbList();
		if(!dbList.includes(database)) throw new Error(`{code:3,error:"ERR_INVALID_DB",description:"invalid database"}`);
		var tableList = await this.r.db(database).tableList();
		if(!tableList.includes(table)) throw new Error(`{code:4,error:"ERR_INVALID_TABLE",description:"invalid table"}`);
		return this.r.db(database).table(table).delete();/*.forEach((entry)=>{
			return this.r.db(database).table(table).get(entry("id")).delete();
		});*/
	}

	get clearTable() {return this.deleteAll}

	async getSong (str) {
		const res = await this.request(`http://${this.config.restnode.host}:${this.config.restnode.port}/loadtracks`,{
			qs: {
				identifier: str
			},
			headers: {
				Authorization: this.config.restnode.password
			}
		}).catch(err => {
			console.error(err);
			return null;
		});
		if (!res) throw "There was an error, try again";
		if (res.body.length === 0) throw `No tracks found`;
		return JSON.parse(res.body);
	}

	async songSearch (strSearch,platform="youtube") {
		return new Promise(async(resolve,reject)=>{
			if(!strSearch) reject(new Error("Missing parameters"));
			switch(platform) {
				case "youtube":
					var res = await this.request(`http://${this.config.musicPlayer.restnode.host}:${this.config.musicPlayer.restnode.port}/loadtracks?identifier=ytsearch:${strSearch}`,{
						method: "GET",
						headers: {
							Authorization: this.config.musicPlayer.restnode.secret
						}
					});
					resolve(JSON.parse(res.body));
					break;
				
				default:
					reject(new Error("Invalid platform"));
			}
		});
	}

	async playSong (channel,song,platform="youtube") {
		return new Promise(async(resolve,reject)=>{
			if(!channel || !song) reject(new Error("Missing parameters"));
		
			channel.join().catch((e)=>{
				reject(e);
			}).then(async(ch)=>{
				switch(platform) {
					case "youtube":
						try {
							resolve(ch.play(this.ytdl(song.uri, { quality: 'highestaudio' })));
						}catch(err){
							ch.disconnect().then(()=>{
								channel.leave()
							}).then(()=>{
								reject(err);
							});
						}
						break;

					default:
						reject("invalid platform");
				}
			})
		});
	}

	async songMenu (pageNumber,pageCount,songs,msg,ma,mb) {
		return new Promise(async(resolve,reject)=>{
			if(!pageNumber || !pageCount || !songs || !msg) reject(new Error("missing parameters."));
			if(typeof ma !== "undefined" && typeof mb !== "undefined") {
				ma.edit(`Multiple songs found, please specify the number you would like to play\n\n${rt[pageNumber-1].join("\n")}\n\nPage ${pageNumber}/${pageCount}\nTotal: **${songs.tracks.length}**`);
			} else {
				var mid = await msg.channel.send(`Multiple songs found, please specify the number you would like to play\n\n${songs.list[pageNumber-1].join("\n")}\n\nPage ${pageNumber}/${pageCount}\nTotal: **${songs.tracks.length}**`);
				var ma = mid;
				var mb = msg;
			}
			ma.channel.awaitMessages(m=>m.author.id === mb.author.id,{max:1,time: 1e4,errors:["time"]}).then(async(m)=>{
				var res = songs.list[pageNumber];
				var resultCount = songs.list.length;
				var s = m.first().content.split(" ");
				if(s[0] === "cancel") throw new Error("CANCEL");
				if(s[0] === "page") {
					if(pageNumber === s[1]) {
						m.first().reply("You are already on that page.");
						resolve(this.songMenu(pageNumber,pageCount,songs,msg,ma,mb));
					}
					if(pageCount - s[1] < 0) {
						m.first().reply("Invalid page!");
						resolve(this.songMenu(pageNumber,pageCount,songs,m,ma,mb));
					}  else {
						resolve(this.songMenu(s[1],pageCount,songs,m,ma,mb));
					}
				} else {
					if(resultCount.length < s[0]) {
						m.first().reply("Invalid Selection!");
						resolve(this.songMenu(pageNumber,pageCount,songs,m,ma,mb));
					} else {
						var song = songs.tracks[pageNumber * 10 - Math.abs(s[0]-10) - 1];
						resolve({song,msg:ma});
					}
				}
			}).catch(resolve);
		});
	}

	async getSong (strIdentifier) {
		return new Promise(async(resolve,reject)=>{
			if(!strIdentifier) reject(new Error("Missing parameters"));
			var res = await this.request(`http://${config.musicPlayer.restnode.host}:${config.musicPlayer.restnode.port}/loadtracks?identifier=${strIdentifier}`,{
				headers: {
					Authorization: config.musicPlayer.restnode.secret
				}
			});
			if(res.body.length === 0) return resolve(res.body);
			return resolve(JSON.parse(res.body));
		})
	}

	async resolveUser (user) {
		if(!user) return false;
		if(user instanceof this.Discord.GuildMember) {
			// can check permissions
			var u = {
				isDeveloper: this.config.developers.includes(user.id),
				isServerModerator: user.permissions.has("MANAGE_GUILD"),
				isServerAdministrator: user.permissions.has("ADMINISTRATOR")
			}
		} else if (user instanceof this.Discord.User) {
			// only dev checking
			var u = {
				isDeveloper: this.config.developers.includes(user.id)
			}
		} else {
			console.log(user);
			throw new Error("Invalid user provided");
		}
		return u;
	}

	async runAs (messageContent,user,channel) {
		if(!(user instanceof this.Discord.User)) user = this.users.get(user);
		if(!(channel instanceof this.Discord.TextChannel)) channel = this.channels.get(channel);
		if(!messageContent || !channel || !user) return;
		var msg = new this.Discord.Message(this,{
			type: 0,
			content: messageContent,
			author: user,
			embeds: [],
			attachments: [],
			timestamp: Date.now(),
			reactions: [],
			mentions: [],
			mention_roles: [],
			mention_everyone: false
		},channel);
		return require(`${this.config.rootDir}/handlers/events/message.js`)(this,msg);
	}

	/*async rotatingStatus() {
		this.user.setActivity(`🐾 Debugging! 🐾`,{type: "PLAYING"});
		setTimeout(()=>{
			this.user.setActivity(`🐾 ${this.config.defaultPrefix}help for help! 🐾`,{type: "PLAYING"});
		},15e3);
		setTimeout(()=>{
			this.user.setActivity(`🐾 ${this.config.defaultPrefix}help in ${this.guilds.size} guilds! 🐾`,{type: "PLAYING"});
		},3e4);
		setTimeout(()=>{
			this.user.setActivity(`🐾 ${this.config.defaultPrefix}help with ${this.users.size} users! 🐾`,{type: "WATCHING"});
		},45e3);
		setTimeout(()=>{
			this.user.setActivity(`🐾 ${this.config.defaultPrefix}help in ${this.channels.size} channels! 🐾`,{type: "LISTENING"});
		},6e4);
	}*/
}

const client = new FurryBot(config.bot.clientOptions);

//console.log(client.db.getGuild);

client.login(config.bot.token);

process.on("SIGINT", async () => {
	if(!client) {
		process.kill(process.pid, "SIGTERM");
	} else {
		if(!client.logger) {
			console.debug("Started termination via CTRL+C");
			client.voiceConnections.forEach((v)=>v.disconnect());
			console.debug("Terminated all voice connections");
		} else {
			client.logger.debug("Started termination via CTRL+C");
			client.voiceConnections.forEach((v)=>v.disconnect());
			client.logger.debug("Terminated all voice connections");
		}
		client.destroy();
		console.log("Terminated client");
		process.kill(process.pid,"SIGTERM");
	}
});

process.on('unhandledRejection', (p) => {
	if(client.logger !== undefined) {
		client.logger.error("Unhandled Promise Rejection:");
		client.logger.error(p);
	} else {
		console.error("Unhandled Promise Rejection:");
		console.error(p);
	}
});