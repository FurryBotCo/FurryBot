const Discord = require("discord.js"),
	config = require("../config");

class BaseClient extends Discord.Client {
	constructor(ClientOptions) {
		super(ClientOptions);
		Object.assign(this,require(`./functions`));
		this.util = require("util");
		this.config = require("../config");
		this.stats = {
			messagesSinceStart: 0,
			messagesSinceLastPost: 0,
			dmMessagesSinceStart: 0,
			dmMessagesSinceLastPost: 0,
			commandTotalsSinceStart: 0,
			commandTotalsSinceLastPost: 0
		};
		const Trello = require("trello"),
			perf = require("perf_hooks"),
			child_process = require("child-process-promise"),
			util = require("util");
		Object.assign(this,{
			Discord,
			tclient: new Trello(config.apis.trello.apiKey,config.apis.trello.apiToken),
			os: require("os"),
			util,
			request: util.promisify(require("request").defaults({encoding:null})),
			uuid: require("uuid/v4"),
			postStats: require("./listStats"),
			fs: require("fs"),
			MongoClient: require("mongodb").MongoClient,
			FurryBotDatabase: require(`./dbFunctions`),
			FurryBotLogger: require(`./loggerV4`),
			varParse: require(`./varHandler`),
			listStats: require("./listStats"),
			lang: require(`../lang`)(this),
			path: require("path"),
			colors: require("console-colors-2"),
			Canvas: require("canvas-constructor").Canvas,
			fsn: require("fs-nextra"),
			chalk: require("chalk"),
			chunk: require("chunk"),
			ytdl: require("ytdl-core"),
			furpile: {},
			server: new (require("../server"))(config.serverOptions),
			yiffNoticeViewed: new Set(),
			_: require("lodash"),
			perf,
			dbStats: require(`./dbStats`),
			performance: perf.performance,
			PerformanceObserver: perf.PerformanceObserver,
			child_process,
			shell: child_process.exec,
			truncate: require("truncate"),
			wordGen: require("random-words")
		});
		for(let key in this.config.overrides) this[this.config.overrides[key]] = false;
		Object.assign(this.Discord.Message.prototype,require("./messageAddons"));
	}

	async imageAPIRequest (animal = true,category = null,json = true, safe = false) {
		return new Promise(async(resolve, reject) => {
			let s, j;
			if([undefined,null,""].includes(json)) json = true;
			s = await this.request(`https://api.furry.bot/${animal ? "animals" : `furry/${safe?"sfw":"nsfw"}`}/${category?category.toLowerCase():safe?"hug":"bulge"}${json?"":"/image"}`);
			try {
				j = JSON.parse(s.body);
				resolve(j);
			} catch(error) {
				reject({error:error,response:s.body});
			}
		});
	}

	async download (url, filename) {
		return new Promise((resolve,reject) => {
			require("request")(url).pipe(this.fsn.createWriteStream(filename)).on("close", resolve);
		});
	}

	async reloadModules () {
		for(let key in require.cache){
			if(key.indexOf("\\node_modules") !== -1){
				delete require.cache[key];
			}
		}
		console.debug("Reloaded all modules");
		return true;
	}

	async reloadAll () {
		this.reloadModules();
	}

	async random (len=10,keyset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
		if(len > 500 && !this[this.config.overrides.random]) throw new Error("Cannot generate string of specified length, please set global override to override this.");
		let rand = "";
		for (var i = 0; i < len; i++)
			rand += keyset.charAt(Math.floor(Math.random() * keyset.length));

		return rand;
	}

	async shortenUrl (url) {
		this.mdb.listCollections().toArray().then(res => res.map(c => c.name)).then(async(list) => {
			if(!list.includes("shorturl")) {
				await this.mdb.createCollection("shorturl");
				console.log("[ShortURL]: Created Short URL table");
			}
		});
		const create = (async(url) => {
			const rand = await this.random(this.config.shortLength),
				createdTimestamp = Date.now(),
				created = new Date().toISOString(),
				count = await this.mdb.collection("shorturl").stats().then(res => res.count),
				a = await this.mdb.collection("shorturl").insertOne({id:rand,url,linkNumber:count+1,createdTimestamp,created,length:url.length,link:`https://furry.services/r/${rand}`});
			if(a.errors === 1) {
				return create(url);
			} else {
				return {code:rand,url,link:`https://furry.services/r/${rand}`,new:true,linkNumber:count+1,createdTimestamp,created,length:url.length};
			}
		});

		let res = await this.mdb.collection("shorturl").find({url}).toArray();
		
		switch(res.length) {
		case 0:
			// create
			return create(url);
			break; // eslint-disable-line no-unreachable

		case 1:
			// return
			var a = res[0];
			return {code:a.id,url,link:`https://furry.services/r/${a.id}`,new:false};
			break; // eslint-disable-line no-unreachable

		default:
			// delete & recreate
			console.log("[ShortURL]: Duplicate records found, deleting");
			this.mdb.collection("shorturl").find({url}).forEach((short) => {
				return this.mdb.collection("shorturl").deleteOne({id: short.id});
			});
			return create(url);
		}
	}

	async deleteAll (table,database = "furrybot") {
		if(["rethinkdb"].includes(database)) throw new Error("{code:2,error:'ERR_ILLEGAL_DB',description:'illegal database'}");
		if(["guilds","users"].includes(table)) throw new Error("{code:1,error:'ERR_ILLEGAL_TABLE',description:'illegal database'}");
		var dbList = await this.mdb.admin().listDatabases().then(res => res.databases.map(d => d.name));
		if(!dbList.includes(database)) throw new Error("{code:3,error:\"ERR_INVALID_DB\",description:\"invalid database\"}");
		var tableList = await this.mongo.db(database).listCollections().then(res => res.map(c => c.name));
		if(!tableList.includes(table)) throw new Error("{code:4,error:\"ERR_INVALID_TABLE\",description:\"invalid table\"}");
		return this.mongo.db(database).collection(table).remove({});
	}

	get clearTable() {return this.deleteAll;}

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
		if (res.body.length === 0) throw "No tracks found";
		return JSON.parse(res.body);
	}

	async songSearch (strSearch,platform="youtube") {
		return new Promise(async(resolve,reject) => {
			if(!strSearch) reject(new Error("Missing parameters"));
			switch(platform) {
			case "youtube":
				var res = await this.request(`http://${this.config.lavalink.host}:${this.config.lavalink.port}/loadtracks?identifier=ytsearch:${strSearch}`,{
					method: "GET",
					headers: {
						Authorization: this.config.lavalink.secret
					}
				});
				resolve(JSON.parse(res.body));
				break;
				
			default:
				reject(new Error("Invalid platform"));
			}
		});
	}

	async joinChannel(channel) {
		if(this.voiceConnections.filter(g => g.channel.guild.id === channel.guild.id).size < 1) {
			return channel.join().catch((err) => {
				return err;
			}).then(async(ch) => {
				return ch;
			});
		} else {
			return this.voiceConnections.filter(g => g.channel.guild.id === channel.guild.id).first();
		}
	}

	//client.voiceConnections.filter(g => g.channel.guild.id===message.guild.id).first().dispatcher.streamTime

	async playSong (channel,song,platform="youtube") {
		if(!channel || !(channel instanceof this.Discord.VoiceChannel)) return new Error("Missing/invalid channel");
		if(!song) return new Error("Missing song");
	
		let queue, user, data, embed, a, chn, ch, player;
		ch = await this.joinChannel(channel);
		switch(platform) {
		case "youtube":
			//try {
			player = ch.play(this.ytdl(song.uri, { quality: "highestaudio" }));
			await this.mdb.collection("guilds").findOneAndUpdate({id: channel.guild.id},{
				$set: {
					"music.playing": true
				}
			});
			player.once("finish",async() => {
				console.log("finished");
				queue = await this.mdb.collection("guilds").findOne({id: channel.guild.id}).then(res => res.music.queue);
				queue.shift();
				if(queue.length >= 1) {
					this.playSong(channel,queue[0]);
					await this.mdb.collection("guilds").findOneAndUpdate({id: channel.guild.id},{
						$set: {
							"music.queue": queue,
							"music.playing": true
						}
					});
					user = this.users.has(queue[0].addedBy) ? this.users.get(queue[0].addedBy) : await this.users.fetch(queue[0].addedBy);
					data = {
						title: "Now Playing",
						description: `**${queue[0].title}** by *${queue[0].author}* is now playing in ${channel.name}`,
						color: 2424780,
						timestamp: new Date().toISOString(),
						footer: {
							icon_url: user.displayAvatarURL(),
							text: `Added by ${user.tag}`
						}
					};
					embed = new this.Discord.MessageEmbed(data);
					a = await this.mdb.collection("guilds").findOne({id: channel.guild.id});
					if(a.music.textChannel !== null) {
						chn = this.channels.get(a.music.textChannel);
						if(!chn || !(chn instanceof this.Discord.TextChannel)) chn = null;
					}
					if(chn !== null && chn instanceof this.Discord.TextChannel) {
						chn.send(embed);
					}
				} else {
					await this.mdb.collection("guilds").findOneAndUpdate({id: channel.guild.id},{
						$set: {
							"music.playing": false
						}
					});
					data = {
						"title": "Queue Empty",
						"description": `The queue for ${channel.name} is now empty.`,
						"color": 2424780,
						"timestamp": new Date().toISOString()
					};
					embed = new this.Discord.MessageEmbed(data);
					a = await this.mdb.collection("guilds").findOne({id: channel.guild.id});
					if(a.music.textChannel !== null) {
						chn = this.channels.get(a.music.textChannel);
						if(!chn || !(chn instanceof this.Discord.TextChannel)) chn = null;
					}
					if(chn !== null && chn instanceof this.Discord.TextChannel) {
						chn.send(embed);
					}
					await client.mdb.collection("guilds").findOneAndUpdate({id: channel.guild.id},{
						$set: {
							"music.queue": []
						}
					});
					channel.leave();
				}
			});
			return player;
			/*}catch(err){
					this.logger.error(err);
					channel.leave();
					//ch.disconnect();
					return err;
				}*/
			break; // eslint-disable-line no-unreachable

		default:
			return new Error("invalid platform");
		}
	}

	async songMenu (pageNumber,pageCount,songs,msg,ma,mb) {
		return new Promise(async(resolve,reject) => {
			if(!pageNumber || !pageCount || !songs || !msg) reject(new Error("missing parameters."));
			let mid, res, resultCount, s, song;
			if(typeof ma !== "undefined" && typeof mb !== "undefined") {
				ma.edit(`Multiple songs found, please specify the number you would like to play\n\n${songs.list[pageNumber-1].join("\n")}\n\nPage ${pageNumber}/${pageCount}\nTotal: **${songs.tracks.length}**`);
			} else {
				mid = await msg.channel.send(`Multiple songs found, please specify the number you would like to play\n\n${songs.list[pageNumber-1].join("\n")}\n\nPage ${pageNumber}/${pageCount}\nTotal: **${songs.tracks.length}**`);
				ma = mid;
				mb = msg;
			}
			ma.channel.awaitMessages(m => m.author.id === mb.author.id,{max:1,time: 1e4,errors:["time"]}).then(async(m) => {
				res = songs.list[pageNumber];
				resultCount = songs.list.length;
				s = m.first().content.split(" ");
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
						song = songs.tracks[pageNumber * 10 - Math.abs(s[0]-10) - 1];
						resolve({song,msg:ma});
					}
				}
			}).catch(resolve);
		});
	}

	async runAs (messageContent,user,channel) {
		if(!(user instanceof this.Discord.User)) user = this.users.get(user);
		if(!(channel instanceof this.Discord.TextChannel)) channel = this.channels.get(channel);
		if(!messageContent || !channel || !user) return;
		let msg = new this.Discord.Message(this,{
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
		return require(`${this.config.rootDir}/handlers/events/message.js`)(msg);
	}

	getDateTime() {
		let date, hour, min, sec;
		date = new Date();
		hour = date.getHours();
		min = date.getMinutes();
		sec = date.getSeconds();
		hour = (hour < 10 ? "0" : "") + hour;
		min = (min < 10 ? "0" : "") + min;
		sec = (sec < 10 ? "0" : "") + sec;
		return `${hour}:${min}:${sec}`;
	}

	gen(type,len = 1) {
		let res, keyset, tmp, rq;
		if(isNaN(len)) len = 1;
		res = [];
		switch(type.toLowerCase()) {
		case "ip":
			// (Math.floor(Math.random() * 255) + 1)+"."+(Math.floor(Math.random() * 255) + 0)+"."+(Math.floor(Math.random() * 255) + 0)+"."+(Math.floor(Math.random() * 255) + 0);
			for(let i = 0;i<len;i++) {
				res.push(`${Math.floor(Math.random()*250)+1}.${Math.floor(Math.random()*250)+0}.${Math.floor(Math.random()*250)+0}.${Math.floor(Math.random()*250)+0}`);
			}
			break;
	
		case "word":
		case "words":
			for(let i = 0;i<len;i++) {
				res.push(this.wordGen({exactly:1,maxLength:Math.floor(Math.random()*7)+1,wordsPerString:Math.floor(Math.random()*4)+1}));
			}
			break;
	
		default:
			keyset = "abcdefghijklmnopqrstuvwxyz";
			for(let i = 0;i<len;i++) {
				tmp = "";
				rq = Math.floor(Math.random()*(32-5))+6;
				for(let ii = 0;ii<rq;ii++) {
					tmp += keyset.charAt(Math.floor(Math.random()*keyset.length));
				}
				res.push(tmp);
			}
		}
		
		return res;
	}

	async memeRequest(path,avatars = [],text = "") {
		avatars = typeof avatars === "string" ? [avatars] : avatars;
		return this.request(`https://dankmemer.services/api${path}`,{
			method: "POST",
			json: {avatars,text},
			headers: {
				Authorization: this.config.apis.dankMemer.token,
				"User-Agent": this.config.userAgent,
				"Content-Type": "application/json"
			}
		});
	}

	async getLogs(guild,action,target,skipChecks = {target: false,action: false,executor: false}) {
		if(!guild || !action || !target) throw new Error("missing params");
		let g, log;
		if(target instanceof this.Discord.Base) target = target.id;
		if(guild instanceof this.Discord.Guild) guild = guild.id;
		if(!this.guilds.has(guild)) throw new Error("invalid guild");
		g = this.guilds.get(guild);
		if(!g.me.permissions.has("VIEW_AUDIT_LOG")) return null;
		log = await g.fetchAuditLogs({limit:1,action});
		if(log.entries.size < 1) return false;
		log = log.entries.first();
		if(!(![undefined,null,""].includes(skipChecks.target) && skipChecks.target === true) && log.target.id !== target) return false;
		if(!(![undefined,null,""].includes(skipChecks.action) && skipChecks.action === true) && log.action !== action) return false;
		if(!(![undefined,null,""].includes(skipChecks.executor) && skipChecks.executor === true) && !(log.executor instanceof this.Discord.User || log.executor instanceof this.Discord.GuildMember)) return false;
		return {executor:log.executor,reason:log.executor.bot ? log.reson === null ? "None Provided" : log.reason : "Not Applicable"};
	}
}

module.exports = BaseClient;