const { Message, Client } = require("eris"),
	{ MongoClient, mongo, mdb } = require("./Database"),
	config = require("../config"),
	GuildConfig = require("./config/GuildConfig"),
	UserConfig = require("./config/UserConfig");

/**
 * @typedef {import("eris").Client} Client
 */

/**
 * @typedef {import("eris").Message} Message
 */

/**
 * Represents an extended message
 * @prop {Client} client - the client the message was broadcasted for
 */
class ExtendedMessage extends Message {
	constructor(data,client) {
		super(data,client);
		this.client = client;

		this.author.tag = `${this.author.username}#${this.author.discriminator}`;
	}

	/**
	 * Get embed defaults for this message
	 * @param {String[]} without - properties to omit from defaults
	 * @returns {Object} - the defaults
	 */
	embed_defaults(...without) {
		let def;

		def = {
			footer: {
				text: `Shard ${![undefined,null].includes(this.channel.guild.shard) ? `${parseInt(this.channel.guild.shard.id,10) + 1}/${this._client.shards.size}`: "1/1"} | Bot Version ${config.bot.version}`
			},
			author: {
				name: `${this.author.username}#${this.author.discriminator}`,
				icon_url: this.author.avatarURL
			},
			color: this.randomColor(),
			timestamp: this.getCurrentTimestamp()
		};
		without.forEach((wth) => {
			if(typeof def[wth] !== "undefined") delete def[wth];
		});
		return def;
	}

	/**
	 * Get embed defaults without an author
	 * @param  {String[]} without - properties to omit from defaults
	 * @returns {Object} - the defaults
	 */
	embed_defaults_na(...without) {
		let def;
		def = {
			footer: {
				text: `Shard ${![undefined,null].includes(this.channel.guild.shard) ? `${parseInt(this.channel.guild.shard.id,10) + 1}/${this._client.shards.size}`: "1/1"} | Bot Version ${config.bot.version}`
			},
			color: this.randomColor(),
			timestamp: this.getCurrentTimestamp()
		};
		without.forEach((wth) => {
			if(typeof def[wth] !== "undefined") delete def[wth];
		});
		return def;
	}

	/**
	 * the config for the guild this message is from
	 */
	get gConfig() {
		return mdb.collection("guilds").findOne({ id: this.channel.guild.id }).then(async(res) => {
			if(!res) {
				await mdb.collection("guilds").insertOne(Object.assign({id: this.channel.guild.id }, config.default.guildConfig));
				console.debug(`Created Guild Entry "${this.channel.guild.id}`);
				return mdb.collection("guilds").findOne({ id: this.channel.guild.id });
			} else return res;
		}).then(res => new GuildConfig(res));
	}

	/**
	 * the config for the author of this message
	 */
	get uConfig() {
		return mdb.collection("users").findOne({ id: this.author.id }).then(async(res) => {
			if(!res) {
				await mdb.collection("users").insertOne(Object.assign({id: this.author.id }, config.default.userConfig));
				console.debug(`Created User Entry "${this.author.id}`);
				return mdb.collection("users").findOne({ id: this.author.id });
			} else return res;
		}).then(res => new UserConfig(res));
	}

	/**
	 * the prefix used in this message
	 */
	get prefix() {
		return this.content.startsWith(`<@${this._client.user.id}>`) ? `<@${this._client.user.id}` : this.content.startsWith(`<@!${this._client.user.id}>`) ? `<@!${this._client.user.id}>` : config.beta || config.alpha ? config.defaultPrefix : this.gConfig.prefix.toLowerCase();
	}

	/**
	 * command arguments
	 */
	get args() {
		try {
			return this.content.replace(new RegExp(this.prefix,"i"),"").trim().match(/[^\s"]+|"[^"]+"/g).map(s => s.replace(/\"/g,"")); // eslint-disable-line no-useless-escape
		} catch(e) {
			try {
				return this.content.replace(new RegExp(this.prefix,"i"),"").trim().split(/\s/);
			} catch(e) {
				return [];
			}
		}
	}

	/**
	 * non-parsed arguments (quotes)
	 */
	get unparsedArgs() {
		const a = this.content.slice(this.prefix.length).trim().split(/\s+/);
		a.shift();
		return a;
	}

	/**
	 * command used in the message
	 */
	get command() {
		return this.args.shift().toLowerCase();
	}

	/**
	 * some attributes about the message author
	 */
	get user() {
		return {
			isDeveloper: config.developers.includes(this.author.id)
		};
	}

	get mentionMap() {
		return {
			users: this.mentions,
			members: this.mentions.map(j => this.channel.guild.members.get(j.id)),
			roles: this.roleMentions.map(j => this.channel.guild.roles.get(j)),
			channels: this.channelMentions.map(j => this.channel.guild.channels.get(j))
		};
	}

	get guild() {
		return this.channel.guild;
	}

	/**
	 * Reply to the author of the last message
	 * @async
	 * @param {msg} - message to reply to
	 */
	async reply(msg) {
		return this.channel.createMessage(`<@!${this.author.id}>, ${msg}`);
	}

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
	}

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
		
		// channel mention
		if(this.mentionMap.channels.length >= mentionPosition+1) return this.mentionMap.channels.slice(mentionPosition)[mentionPosition];
		
		// channel ID
		if(!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.channels.length >= mentionPosition+1)) return this.guild.channels.get(args[argPosition]);
		
		// channel name
		if(isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.channels.length >= mentionPosition+1)) return this.guild.channels.find(c => c.name.toLowerCase()===args[argPosition].toLowerCase());

		// nothing found
		return false;
	}

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

		// role mention
		if(this.mentionMap.roles.length >= mentionPosition+1) return this.mentionMap.roles.slice(mentionPosition)[mentionPosition];
		
		// role ID
		if(!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.roles.length >= mentionPosition+1)) return this.guild.roles.get(args[argPosition]);
		
		// role name
		if(isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.roles.length >= mentionPosition+1)) return this.guild.roles.find(r => r.name.toLowerCase()===args[argPosition].toLowerCase());

		// nothing found
		return false;
	}

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
		// server id
		if(!isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this._client.guilds.get(args[argPosition]);

		// server name
		if(isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this._client.guilds.find(g => g.name.toLowerCase()===args[argPosition].toLowerCase());

		// nothing found
		return false;
	}

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
	}

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
		let member = ![undefined,null,""].includes(user) ? user instanceof User ? this.guild.members.get(user.id) : user instanceof Member ? user : !isNaN(user) ? this.guild.members.get(user) : false : this.member;
		if(!(member instanceof Member)) throw new Error("invalid member");
		return {
			isDeveloper: config.developers.includes(member.id),
			isServerModerator: member.permissions.has("manageServer"),
			isServerAdministrator: member.permissions.has("administrator")
		};
	}

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
	async errorEmbed(type = "", custom = false, title = "", description = "", fields = [], color = this._client.randomColor()) {
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

			case "INVALID_SERVER":
				title = "Server Not Found",
				description = "The specified server was not found, please provide a valid server id the bot is in.",
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
			fields,
			color
		},this.embed_defaults("color")))});
	}
}