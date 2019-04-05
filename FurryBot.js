const { Base } = require("eris-sharder"),
	config = require("./config"),
	MessageCollector = require("./util/MessageCollector"),
	Eris = require("eris");

/**
 * main client
 * @extends Base
 */
class FurryBot extends Base {
	/**
	 * creates client
	 * @param {Eris.Client} bot - eris client
	 */
	constructor(bot) {
		super(bot);
		this.fs = require("fs");
		this.log = require("./util/LoggerV5");
		this.MongoClient = require("mongodb").MongoClient;
		Object.assign(this,require("./util/functions"));
		this.MessageCollector = new MessageCollector(this.bot);
		this.config = config;
		this.Trello = require("trello");
		this.tclient = new this.Trello(config.apis.trello.apiKey,config.apis.trello.apiToken);
		this.os = require("os");
		this.util = require("util");
		this.request = this.util.promisify(require("request"));
		this.uuid = require("uuid/v4");
		this.listStats = require("./util/ListStats");
		this.fs = require("fs");
		this.MongoClient = require("mongodb").MongoClient,
		this.Logger = require("./util/LoggerV5");
		this.log = this.Logger.log;
		this.varParse = require("./util/varHandler");
		this.lang = require("./lang")(this);
		this.path = require("path");
		this.colors = require("console-colors-2");
		this.Canvas = require("canvas-constructor").Canvas,
		this.fsn = require("fs-nextra");
		this.chalk = require("chalk");
		this.chunk = require("chunk");
		this.ytdl = require("ytdl-core");
		this.furpile = {},
		this.server = new (require("./server"))(config.serverOptions);
		this.yiffNoticeViewed = new Set();
		this._ = require("lodash");
		this.perf = require("perf_hooks");
		this.performance = this.perf.performance;
		this.PerformanceObserver = this.perf.PerformanceObserver;
		this.child_process = require("child_process"),
		this.shell = this.child_process.exec;
		this.truncate = require("truncate");
		this.wordGen = require("random-words");
		this.Eris = Eris;
		this.deasync = require("deasync");
		this.logger = new this.Logger.FurryBotLogger();
		
		console.log = this.logger.log;
		console.warn = this.logger.warn;
		console.error = this.logger.error;
		console.debug = this.logger.debug;
		console.info = this.logger.info;
		console._log = this.logger._log;
		console._getCallerFile = this.logger._getCallerFile;
		console._getDate = this.logger._getDate;
	}

	/**
	 * main function to start bot
	 * @async
	 */
	async launch() {
		this.bot.trackEvent = this.trackEvent;
		this.bot.logger = this.logger;
		this.bot.log = this.log;
		this.bot.memory = this.memory;
		this.mongo = await this.MongoClient.connect(`mongodb://${this.config.db.main.host}:${this.config.db.main.port}/${this.config.db.main.database}`,this.config.db.main.opt);
		this.mdb = this.mongo.db(this.config.db.main.database);
		Object.assign(this.bot,{
			MongoClient: this.MongoClient,
			mongo: this.mongo,
			mdb: this.mdb
		});
		require("./handlers/ready").call(this);
		this.loadCommands();

		const ev = this.fs.readdirSync("./handlers/events/Client");
		ev.forEach(evnt => {
			if (!evnt.endsWith(".js")) return;
			const event = require(`./handlers/events/Client/${evnt}`),
				eventName = evnt.split(".")[0];
			this.bot.on(eventName, event.bind(this));
			/*this.trackEvent({
				group: "LOAD",
				event: `events.${eventName}.load`,
				properties: {
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.os.hostname()
					}
				}
			});*/
			this.logger.log(`[EventManager]: Loaded Client#${eventName} event`);
			delete require.cache[require.resolve(`./handlers/events/Client/${evnt}`)];
		});
	}

	loadCommands() {
		this.commands = require("./commands");
		this.responses = require("./responses");
		this.categories = require("./commands");
		this.commandList = this.commands.map(c => c.commands.map(cc => cc.triggers)).reduce((a,b) => a.concat(b)).reduce((a,b) => a.concat(b));
		this.responseList = this.responses.map(r => r.triggers).reduce((a,b) => a.concat(b));
		this.categoryList = this.categories.map(c => c.name);
		this.commandTimeout = {};
		this.commandList.forEach((cmd) => {
			this.commandTimeout[cmd] = new Set();
		});
		this.responseList.forEach((resp) => {
			this.commandTimeout[resp] = new Set();
		});

		Object.assign(this.bot,{
			commands: this.commands,
			responses: this.responses,
			categories: this.categories,
			commandList: this.commandList,
			responseList: this.responseList,
			categoryList: this.categoryList
		});
	}

	getCategory(lookup) {
		if(!lookup) return null;
		let a;
		if(this.commandList.includes(lookup.toLowerCase())) a = this.commands.filter(c => c.commands.map(cc => cc.triggers).reduce((a,b) => a.concat(b)).includes(lookup.toLowerCase()));
		else if(this.categoryList.includes(lookup.toLowerCase())) a = this.categories.filter(cat => cat.name.toLowerCase() === lookup.toLowerCase());
		else return null;
		//this.logger.log(this.commands);
		return a.length === 0 ? null : a[0];
	}

	getCommand(command) {
		if(!command) return null;
		let a = this.commands.map(c => c.commands).reduce((a,b) => a.concat(b)).filter(cc => cc.triggers.includes(command));
		return a.length === 0 ? null : a[0];
	}

	getResponse(response) {
		if(!response) return null;
		let a = this.responses.filter(r => r.triggers.includes(response));
		return a.length === 0 ? null : a[0];
	}

	/**
	 * handler for ready event
	 * @async
	 */
	async ready() {
		this.log("ready");
	}

	/**
	 * adds additional properties to a message
	 * @async
	 * @param {Message} message - the message to assign properties to
	 * @returns {Message} - message with extra properties added
	 */
	async setupMessage(message) {
		const m = {};
		/**
		 * embed defaults
		 * @param {...String} without - properties to omit from the defaults
		 */
		const {
			Collection,
			User,
			Member,
			Role,
			TextChannel
		} = require("eris");
		m.embed_defaults = ((...without)  => {
			let def;
			def = {
				footer: {
					text: `Shard ${![undefined,null].includes(message.channel.guild.shard) ? `${+message.channel.guild.shard.id+1}/${this.bot.options.maxShards}`: "1/1"} | Bot Version ${this.config.bot.version}`
				},
				author: {
					name: `${message.author.username}#${message.author.discriminator}`,
					icon_url: message.author.avatarURL
				},
				color: this.randomColor(),
				timestamp: this.getCurrentTimestamp()
			};
			without.forEach((wth) => {
				if(typeof def[wth] !== "undefined") delete def[wth];
			});
			return def;
		});
		/**
		 * embed defaults without an author
		 * @param {...String} - properties to omit from the defaults
		 */
		m.embed_defaults_na = ((...without) => {
			let def;
			def = {
				footer: {
					text: `Shard ${![undefined,null].includes(message.channel.guild.shard) ? `${+message.channel.guild.shard.id+1}/${this.bot.options.maxShards}`: "1/1"} | Bot Version ${this.config.bot.version}`
				},
				color: this.randomColor(),
				timestamp: this.getCurrentTimestamp()
			};
			without.forEach((wth) => {
				if(typeof def[wth] !== "undefined") delete def[wth];
			});
			return def;
		});
		m.gConfig = await this.mdb.collection("guilds").findOne({id: message.channel.guild.id});
		if(!m.gConfig) {
			await this.mdb.collection("guilds").insertOne(Object.assign({id: message.channel.guild.id},this.config.default.guildConfig));
			this.logger.debug(`Created Guild Entry "${message.channel.guild.id}"`);
			m.gConfig = this.config.default.guildConfig;
		}
		m.uConfig = await this.mdb.collection("users").findOne({id: message.author.id});
		if(!m.uConfig) {
			await this.mdb.collection("users").insertOne(Object.assign({id: message.author.id},this.config.default.userConfig));
			this.logger.debug(`Created user "${message.author.id}"`);
			m.uConfig = this.config.default.userConfig;
		}
		m.prefix = message.content.startsWith(`<@${this.bot.user.id}>`) ? `<@${this.bot.user.id}` : message.content.startsWith(`<@!${this.bot.user.id}>`) ? `<@!${this.bot.user.id}>` : this.config.beta || this.config.alpha ? this.config.defaultPrefix : m.gConfig.prefix.toLowerCase();
		try {
			m.args = message.content.replace(new RegExp(m.prefix,"i"),"").trim().match(/[^\s"]+|"[^"]+"/g).map(s => s.replace(/\"/g,"")); // eslint-disable-line no-useless-escape
		} catch(e) {
			try {
				m.args = message.content.replace(new RegExp(m.prefix,"i"),"").trim().split(/\s/);
			} catch(e) {
				m.args = [];
			}
		}
		if(m.args.length === 0 || typeof m.args === "string") m.args = ["notacommand"];
		m.unparsedArgs = message.content.slice(m.prefix.length).trim().split(/\s+/);
		m.unparsedArgs.shift();
		m.command = m.args.shift().toLowerCase();
		m.user = {
			isDeveloper: this.config.developers.includes(message.author.id)
		};

		Object.assign(m,{
			mentionMap: {
				users: message.mentions,
				members: message.mentions.map(j => message.channel.guild.members.get(j.id)),
				roles: message.roleMentions.map(j => message.channel.guild.roles.get(j)),
				channels: message.channelMentions.map(j => message.channel.guild.channels.get(j))
			},
			guild: message.channel.guild,
			/**
			 * Get a user from message args
			 * @async
			 * @param {Number} [argPosition=0] arg position to look at
			 * @param {Boolean} [unparsed=false] used parsed or unparsed args
			 * @param {Boolean} [join=false] join together all args before running
			 * @param {Number} [mentionPosition=0] which mention to look for
			 * @returns {(User|Boolean)} user that was found, or false if none were found
			 */
			async getUserFromArgs(argPosition = 0, unparsed = false, join = false, mentionPosition = 0) {
				const {
					User,
					Member,
					Message,
					Guild
				} = require("eris");
				if(!(this instanceof Message)) throw new TypeError("invalid message");
				let argObject, args;
				argObject = unparsed ? "unparsedArgs" : "args"; 
				if(!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
				if(join) {
					args = [this[argObject].join(" ")];
					argPosition = 0;
				} else {
					args = this[argObject];
				}
				
				// user mention
				if(this.mentionMap.users.length >= mentionPosition+1) return this.mentionMap.users.slice(mentionPosition)[mentionPosition];
				
				// user ID
				if(!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.users.length >= mentionPosition+1)) return this._client.getRESTUser(args[argPosition]);
				
				// username
				if(isNaN(args[argPosition]) && args[argPosition].indexOf("#") === -1 && !(args.length === argPosition || !args || this.mentionMap.users.length >= mentionPosition+1)) return this._client.users.find(t => t.username.toLowerCase()===args[argPosition].toLowerCase());
				
				// user tag
				if(isNaN(args[argPosition]) && args[argPosition].indexOf("#") !== -1 && !(this.mentionMap.users.length >= mentionPosition+1)) return this._client.users.find(t => `${t.username}#${t.discriminator}`.toLowerCase() === args[argPosition].toLowerCase());
		
				// nothing found
				return false;
			},
			/**
			 * Get a member from message args
			 * @async
			 * @param {Number} [argPosition=0] arg position to look at
			 * @param {Boolean} [unparsed=false] used parsed or unparsed args
			 * @param {Boolean} [join=false] join together all args before running
			 * @param {Number} [mentionPosition=0] which mention to look for
			 * @returns {(Member|Boolean)} guild member that was found, or false if none were found
			 */
			async getMemberFromArgs(argPosition = 0, unparsed = false, join = false, mentionPosition = 0) {
				const {
					User,
					Member,
					Message,
					Guild
				} = require("eris");
				if(!(this instanceof Message)) throw new TypeError("invalid message");
				let argObject, args;
				argObject = unparsed ? "unparsedArgs" : "args"; 
				if(!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
				if(join) {
					args = [this[argObject].join(" ")];
					argPosition = 0;
				} else {
					args = this[argObject];
				}
				if(!this.guild || !(this.guild instanceof Guild)) throw new TypeError("invalid or missing guild on this");

				// member mention
				if(this.mentionMap.members.length >= mentionPosition+1) return this.mentionMap.members.slice(mentionPosition)[mentionPosition];
				// user ID
				if(![undefined,null,""].includes(args[argPosition]) && !isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition+1)) return this.guild.members.get(args[argPosition]);
				
				// username
				if(![undefined,null,""].includes(args[argPosition]) && isNaN(args[argPosition]) && args[argPosition].indexOf("#") === -1 && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition+1)) return this.guild.members.find(m => m.user.username.toLowerCase() === args[argPosition].toLowerCase());
				
				// user tag
				if(![undefined,null,""].includes(args[argPosition]) && isNaN(args[argPosition]) && args[argPosition].indexOf("#") !== -1 && !(this.mentionMap.members.length >= mentionPosition+1)) return this.guild.members.find(m => `${m.username}#${m.discriminator}`.toLowerCase() === args[argPosition].toLowerCase());
		
				// nothing found
				return false;
			},
			/**
			 * Get a channel from message args
			 * @async
			 * @param {Number} [argPosition=0] arg position to look at
			 * @param {Boolean} [unparsed=false] used parsed or unparsed args
			 * @param {Boolean} [join=false] join together all args before running
			 * @param {Number} [mentionPosition=0] which mention to look for
			 * @returns {(TextChannel|Boolean)} channel that was found, or false if none were found
			 */
			async getChannelFromArgs(argPosition = 0, unparsed = false, join = false, mentionPosition = 0) {
				const {
					User,
					Member,
					Message,
					Guild
				} = require("eris");
				if(!(this instanceof Message)) throw new TypeError("invalid message");
				let argObject, args;
				argObject = unparsed ? "unparsedArgs" : "args"; 
				if(!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
				if(join) {
					args = [this[argObject].join(" ")];
					argPosition = 0;
				} else {
					args = this[argObject];
				}
				if(!this.guild || !(this.guild instanceof Guild)) throw new TypeError("invalid or missing guild on this");
				
				// channel mention
				if(this.mentionMap.channels.length >= mentionPosition+1) return this.mentionMap.channels.slice(mentionPosition)[mentionPosition];
				
				// channel ID
				if(!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.channels.length >= mentionPosition+1)) return this.guild.channels.get(args[argPosition]);
				
				// channel name
				if(isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.channels.length >= mentionPosition+1)) return this.guild.channels.find(c => c.name.toLowerCase()===args[argPosition].toLowerCase());
		
				// nothing found
				return false;
			},
			/**
			 * Get a role from message args
			 * @async
			 * @param {Number} [argPosition=0] arg position to look at
			 * @param {Boolean} [unparsed=false] used parsed or unparsed args
			 * @param {Boolean} [join=false] join together all args before running
			 * @param {Number} [mentionPosition=0] which mention to look for
			 * @returns {(Role|Boolean)} role that was found, or false if none were found
			 */
			async getRoleFromArgs(argPosition = 0, unparsed = false, join = false, mentionPosition = 0) {
				const {
					User,
					Member,
					Message,
					Guild
				} = require("eris");
				if(!(this instanceof Message)) throw new TypeError("invalid message");
				let argObject, args;
				argObject = unparsed ? "unparsedArgs" : "args"; 
				if(!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
				if(join) {
					args = [this[argObject].join(" ")];
					argPosition = 0;
				} else {
					args = this[argObject];
				}
				if(!this.guild || !(this.guild instanceof Guild)) throw new TypeError("invalid or missing guild on this");
		
				// role mention
				if(this.mentionMap.roles.length >= mentionPosition+1) return this.mentionMap.roles.slice(mentionPosition)[mentionPosition];
				
				// role ID
				if(!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.roles.length >= mentionPosition+1)) return this.guild.roles.get(args[argPosition]);
				
				// role name
				if(isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.roles.length >= mentionPosition+1)) return this.guild.roles.find(r => r.name.toLowerCase()===args[argPosition].toLowerCase());
		
				// nothing found
				return false;
			},
			/**
			 * Get a server from message args
			 * @async
			 * @param {Number} [argPosition=0] arg position to look at
			 * @param {Boolean} [unparsed=false] used parsed or unparsed args
			 * @param {Boolean} [join=false] join together all args before running
			 * @returns {(Guild|Boolean)} guild that was found, or false if none were found
			 */
			async getServerFromArgs(argPosition = 0, unparsed = false, join = false) {
				const {
					User,
					Member,
					Message,
					Guild
				} = require("eris");
				if(!(this instanceof Message)) throw new TypeError("invalid message");
				let argObject, args;
				argObject = unparsed ? "unparsedArgs" : "args"; 
				if(!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
				if(join) {
					args = [this[argObject].join(" ")];
					argPosition = 0;
				} else {
					args = this[argObject];
				}
				// server id
				if(!isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this._client.guilds.get(args[argPosition]);
		
				// server name
				if(isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this._client.guilds.find(g => g.name.toLowerCase()===args[argPosition].toLowerCase());
		
				// nothing found
				return false;
			},
			/**
			 * Configure user
			 * @async
			 * @param {(User|Member)} [user=null] the user to configure 
			 * @returns {Object} configured user properties
			 */
			async configureUser(user = null) {
				const {
						User,
						Member,
						Message,
						Guild
					} = require("eris"),
					config = require("./config");
				let member = ![undefined,null,""].includes(user) ? user instanceof User ? this.guild.members.get(user.id) : user instanceof this.client.Discord.GuildMember ? user : !isNaN(user) ? this.guild.members.get(user) : false : this.member;
				if(!(member instanceof Member)) throw new Error("invalid member");
				return {
					isDeveloper: config.developers.includes(member.id),
					isServerModerator: member.permissions.has("manageServer"),
					isServerAdministrator: member.permissions.has("administrator")
				};
			},
			/**
			 * send an error embed to a channel
			 * @async
			 * @param {String} [type=""] the type of embed to send
			 * @param {Boolean} [custom=false] use a custom error embed
			 * @param {String} [title=""] title for custom error embed
			 * @param {String} [description=""] description for custom error embed
			 * @param {Array} [fields=[]] fields for custom error embed
			 * @returns {Message} message that was sent to channel
			 */
			async errorEmbed(type = "", custom = false, title = "", description = "", fields = []) {
				if(!custom) {
					switch(type.replace(/(\s|-)/g,"_").toUpperCase()) {
					case "INVALID_USER":
					case "INVALID_MEMBER":
						title = "User Not Found",
						description = "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag",
						fields = [];
						break;
						
					case "INVALID_ROLE":
						title = "Role Not Found",
						description = "The specified role was not found, please provide one of the following:\nFULL role ID, FULL role name (capitals do matter), or role mention",
						fields = [];
						break;
		
					case "INVALID_CHANNEL":
						title = "Channel Not Found",
						description = "The specified channel was not found, please provide one of the following:\nFULL channel ID, FULL channel name, or channel mention",
						fields = [];
						break;
						
					default:
						title = "Default Title",
						description = "Default Description",
						fields = [];
					}
				}
				return this.channel.createMessage({embed: (Object.assign({
					title,
					description,
					fields
				},this.embed_defaults()))});
			}
		});
		return m;
	}

	/**
	 * Get a buffer containing an image from a url
	 * @async
	 * @param {URL} imageURL - url of the image to fetch
	 * @returns {Buffer} - image buffer
	 */
	async getImageFromURL(imageURL) {
		return require("util").promisify(require("request"))(imageURL,{
			encoding: null
		}).then(res => res.body);
	}

	/**
	 * compare the highest roles for two guild members
	 * @param {*} member1 - first member to test
	 * @param {*} member2 - second member to test
	 */
	compareMembers(member1,member2) {
		let a = member1.roles.map(r => member1.guild.roles.get(r));
		if(a.length > 0) a = a.filter(r => r.position === Math.max.apply(Math, a.map(p => p.position)))[0];

		let b = member2.roles.map(r => member2.guild.roles.get(r));
		if(b.length > 0) b = b.filter(r => r.position === Math.max.apply(Math, b.map(p => p.position)))[0];

		if(a.length === 0 && b.length > 0) return {
			member1: {
				higher: false,
				lower: true,
				same: false
			},
			member2: {
				higher: true,
				lower: false,
				same: false
			}
		};

		if(a.length > 0 && b.length === 0) return {
			member1: {
				higher: true,
				lower: false,
				same: false
			},
			member2: {
				higher: false,
				lower: true,
				same: false
			}
		};

		if(a.length === 0 && b.length === 0) return {
			member1: {
				higher: false,
				lower: false,
				same: true
			},
			member2: {
				higher: false,
				lower: false,
				same: true
			}
		};
		return {
			member1: {
				higher: a.position > b.position,
				lower: a.position < b.position,
				same: a.positon === b.position
			},
			member2: {
				higher: b.position > a.position,
				lower: b.position < a.position,
				same: b.positon === a.position
			}
		};
	}

	/**
	 * compare a members top role position with another roles position
	 * @param {*} member - member to test
	 * @param {*} role - role to test
	 */
	compareMemberWithRole(member,role) {
		let b = member.roles.map(r => member.guild.roles.get(r));
		b = b.filter(r => r.position === Math.max.apply(Math, b.map(p => p.position)))[0];

		return {
			higher: b.position < role.position,
			lower: b.position > role.position,
			same: b.position === role.position
		};
	}

	/**
	 * track analytics event
	 * @async
	 * @param {Object} props - tracking properties 
	 * @param {Number} [props.userId=null] - analytics user id
	 * @param {Number} [props.guildId=null] - analytics guild id
	 * @param {Number} [props.channelId=null] - analytics channel id
	 * @param {Number} [props.messageId=null] - analytics message id
	 * @param {Number} [props.roleId=null] - analytics role id
	 * @param {String} props.group - analytics group
	 * @param {String} props.event - event name
	 * @param {Object} props.properties - event properties
	 */
	async trackEvent(props) {
		const config = require("./config");
		if(!props) throw new TypeError("missing properties");
		if(!props.event) throw new TypeError("missing event");
		if(!props.group) throw new TypeError("missing group");
		if(!props.properties) props.properties = {};
		let type = config.beta ? "furrybotbeta" : "furrybot";
		return require("util").promisify(require("request"))(`https://yiff.guru/track/${type}`,{
			method: "POST",
			headers: {
				Authorization: config.universalKey
			},
			json: {
				timestamp: new Date().toISOString(),
				userId: props.userId || null,
				guildId: props.guildId || null,
				channelId: props.channelId || null,
				messageId: props.messageId || null,
				roleId: props.roleId || null,
				event: props.event,
				group: props.group,
				properties: props.properties
			}
		});
	}

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

	/**
	 * download an image to the disk
	 * @async
	 * @param {URL} url - url of image to download
	 * @param {String} filename - location to download the image to
	 * @returns {Promise<Buffer>} - image buffer
	 */
	async download (url, filename) {
		return new Promise((resolve,reject) => {
			require("request")(url).pipe(this.fsn.createWriteStream(filename)).on("close", resolve);
		});
	}

	/**
	 * clear module cache
	 * @async
	 * @returns {Boolean}
	 */
	async reloadModules () {
		for(let key in require.cache){
			if(key.indexOf("\\node_modules") !== -1){
				delete require.cache[key];
			}
		}
		console.debug("Reloaded all modules");
		return true;
	}

	/**
	 * reloads everything
	 * @async
	 * @returns {Object} - output from all reload functions
	 */
	async reloadAll () {
		return {
			module: this.reloadModules()
		};
	}

	/**
	 * generate a random string
	 * @async
	 * @param {Number} [len=10] - length to generate
	 * @param {String} [keyset=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789] - characters to use in generation
	 * @returns {String} - randomly generated string 
	 */
	random (len=10,keyset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
		if(len > 500 && !this[this.config.overrides.random]) throw new Error("Cannot generate string of specified length, please set global override to override this.");
		let rand = "";
		for (var i = 0; i < len; i++)
			rand += keyset.charAt(Math.floor(Math.random() * keyset.length));

		return rand;
	}

	// code url link new linkNumber createdTimestamp created length

	/**
 * @typedef ShortURL
 * @type {Object}
 * @property {String} code - short url code
 * @property {URL} url - shortened url
 * @property {URL} link - redirect link
 * @property {Boolean} new - wether a new entry was created
 * @property {Number} linkNumber - short url number
 * @property {Date} createdTimestamp - seconds sence january 1, 1970 at which the url was shortened
 * @property {Date} created - ISO date at which the url was shortened
 * @property {Number} length - length of the shortened url
 */

	/**
	 * 
	 * @param {URL} url - url to shorten
	 * @returns {ShortURL}
	 */
	async shortenUrl(url) {
		this.mdb.listCollections().toArray().then(res => res.map(c => c.name)).then(async(list) => {
			if(!list.includes("shorturl")) {
				await this.mdb.createCollection("shorturl");
				this.logger.log("[ShortURL]: Created Short URL table");
			}
		});
		const create = (async(url) => {
			const rand = this.random(this.config.shortLength),
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
		case 0: // create
			return create(url);
			break; // eslint-disable-line no-unreachable

		case 1: // return
			return res[0];
			break; // eslint-disable-line no-unreachable

		default:// delete & recreate
			this.logger.log("[ShortURL]: Duplicate records found, deleting");
			this.mdb.collection("shorturl").find({url}).forEach((short) => {
				return this.mdb.collection("shorturl").deleteOne({id: short.id});
			});
			return create(url);
		}
	}

	/* eslint-disable no-unreachable */

	/**
	 * get song from lavalink
	 * @async
	 * @deprecated not working with Eris
	 * @param {String} str - identifier
	 * @returns {Object}
	 * @throws {Error}
	 */
	async getSong (str) {
		throw new Error("not usable"); 
		const res = await this.request(`http://${this.config.restnode.host}:${this.config.restnode.port}/loadtracks`,{
			qs: {
				identifier: str
			},
			headers: {
				Authorization: this.config.restnode.password
			}
		}).catch(err => {
			this.logger.error(err);
			return null;
		});
		if (!res) throw new Error("There was an error, try again");
		if (res.body.length === 0) throw new Error("No tracks found");
		return JSON.parse(res.body);
	}

	/**
	 * search for a song using lavalink
	 * @async
	 * @deprecated not working with Eris
	 * @param {String} strSearch - search query
	 * @param {String} [platform="youtube"] - search platform
	 * @returns {Promise<Object>}
	 * @throws {Error}
	 */
	async songSearch (strSearch,platform = "youtube") {
		throw new Error("not usable");
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

	/**
	 * make the bot join a voice channel
	 * @deprecated not working with Eris
	 * @param {Eris.Channel}
	 * @throws {Error}
	 */
	async joinChannel(channel) {
		throw new Error("not usable");
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

	/**
	 * play a song in a voice channel
	 * @async
	 * @deprecated not working with Eris
	 * @param {Eris.Channel} channel - channel to play in
	 * @param {String} song - song to play
	 * @param {String} [platform="youtube"] - platform
	 * @throws {Error}
	 */
	async playSong (channel, song, platform = "youtube") {
		throw new Error("not usable");
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
				this.logger.log("finished");
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
							text: `Added by ${user.username}#${user.discriminator}`
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
					await this.mdb.collection("guilds").findOneAndUpdate({id: channel.guild.id},{
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

	/**
	 * menu to chose a song
	 * @async
	 * @deprecated not working with Eris
	 * @param {Number} pageNumber - song menu page number
	 * @param {Number} pageCount - page count
	 * @param {Object[]} songs - list of songs
	 * @param {Eris.Message} msg - message that triggered the menu
	 * @param {Eris.Message} ma - multiple songs message
	 * @param {Eris.Message} mb - other message
	 * @throws {Error}
	 */
	async songMenu (pageNumber,pageCount,songs,msg,ma,mb) {
		throw new Error("not usable");
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

	/* eslint-enable no-unreachable */

	/**
	 * broadcast a messageCreate event as another user
	 * @param {*} messageContent - content to send
	 * @param {*} user - author
	 * @param {*} channel - channel to send in
	 * @returns {*}
	 */
	async runAs (messageContent,user,channel) {
		if(!(user instanceof this.Eris.User)) user = this.users.get(user);
		if(!(channel instanceof this.Eris.TextChannel)) channel = this.channels.get(channel);
		if(!messageContent || !channel || !user) return;
		let msg = new this.Eris.Message({
			type: 0,
			content: messageContent,
			author: user,
			embeds: [],
			attachments: [],
			timestamp: Date.now(),
			reactions: [],
			mentions: [],
			mention_roles: [],
			mention_everyone: false,
			tts: false,
			channel_id: channel.id
		},this.bot);
		return this.bot.emit("messageCreate",msg);
	}

	/**
	 * returns the current date in hh:mm:ss
	 * @returns {String} hh:mm:ss
	 */
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

	/**
	 * generate a random set of things
	 * @param {"ip" | "word" | "words" | ""} type - type to generate
	 * @param {Number} len - amount to generate
	 * @returns {Array}
	 */
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

	/**
	 * dank memer api request
	 * @async
	 * @param {String} path - path to request
	 * @param {URL[]} [avatars=[]] - array of avatars to use in request
	 * @param {String} [text=""] - text to use in request
	 * @returns {Object}
	 */
	async memeRequest(path,avatars = [],text = "") {
		avatars = typeof avatars === "string" ? [avatars] : avatars;
		return this.request(`https://dankmemer.services/api${path}`,{
			method: "POST",
			json: {avatars,text},
			headers: {
				Authorization: this.config.apis.dankMemer.token,
				"User-Agent": this.config.userAgent,
				"Content-Type": "application/json"
			},
			encoding: null
		});
	}

	/**
	 * fetch specific audit logs
	 * @param {Eris.Guild} guild - guild to fetch from
	 * @param {String} action - {@link https://abal.moe/Eris/docs/reference|Audit Log Action}
	 * @param {(Eris.User|Eris.Member)} target - user to look for
	 * @param {Object} skipChecks - skip checks
	 * @param {Boolean} [skipChecks.target=false] - skip checks on target
	 * @param {Boolean} [skipChecks.action=false] - skip checks on action
	 * @param {Boolean} [skipChecks.executor=false] - skip checks on executor
	 * @returns {LogsReturn}
	 */

	/**
	 * @typedef LogsReturn
	 * @type {Object}
	 * @property {(Eris.User|Eris.Member)} executor - audit log blame
	 * @property {("None Provided" | "Not Applicable" | String)} reason - audit log reason
	 */
	async getLogs(guild,action,target,skipChecks = {target: false,action: false,executor: false}) {
		if(!guild || !action || !target) throw new Error("missing params");
		let g, log;
		if(target instanceof this.Eris.Base) target = target.id;
		if(guild instanceof this.Eris.Guild) guild = guild.id;
		if(!this.bot.guilds.has(guild)) throw new Error("invalid guild");
		g = this.bot.guilds.get(guild);
		if(!g.members.get(this.bot.user.id).permission.has("viewAuditLog")) return null;
		log = await g.getAuditLogs(1,null,action);
		if(log.entries.size < 1) return false; // test this, docs don't show what they return
		log = log.entries.first();
		if(!(![undefined,null,""].includes(skipChecks.target) && skipChecks.target === true) && log.target.id !== target) return false;
		if(!(![undefined,null,""].includes(skipChecks.action) && skipChecks.action === true) && log.action !== action) return false;
		if(!(![undefined,null,""].includes(skipChecks.executor) && skipChecks.executor === true) && !(log.executor instanceof this.Eris.User || log.executor instanceof this.Eris.Member)) return false;
		return {executor:log.executor,reason:log.executor.bot ? log.reson === null ? "None Provided" : log.reason : "Not Applicable"};
	}
}

module.exports = FurryBot;

process.on("unhandledRejection",(p) => {
	console.error("Unhandled Promise Rejection");
	console.error(p);
});