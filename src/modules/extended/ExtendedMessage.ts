import * as Eris from "eris";
import UserConfig from "@modules/config/UserConfig";
import GuildConfig from "@modules/config/GuildConfig";
import { mdb } from "@modules/Database";
import config from "@config";
import functions from "@util/functions";
import FurryBot from "@FurryBot";
import Command from "@modules/cmd/Command";
import Category from "@modules/cmd/Category";
import AutoResponse from "@modules/cmd/AutoResponse";
import ExtendedTextChannel from "@modules/extended/ExtendedTextChannel";
import ExtendedUser from "@modules/extended/ExtendedUser";

class ExtendedMessage extends Eris.Message {
	id: string;
	channel: ExtendedTextChannel;
	timestamp: number;
	type: number;
	author: ExtendedUser;
	member: Eris.Member;
	mentions: Eris.User[];
	content: string;
	cleanContent: string;
	roleMentions: string[];
	channelMentions: string[];
	editedTimestamp: number;
	tts: boolean;
	mentionEveryone: boolean;
	attachments: Eris.Attachment[];
	embeds: Eris.Embed[];
	activity?: {};
	application?: {};
	reactions: {
		count: number,
		me: boolean
	};
	pinned: boolean;
	cmd: {
		command: Command[];
		category: Category
	};
	response: AutoResponse;
	client: FurryBot;
	_client: FurryBot;
	c: string;
	prefix: string;
	args: string[];
	unparsedArgs: string[];
	user: {
		isDeveloper: boolean;
	};
	uConfig: UserConfig;
	gConfig: GuildConfig;
	constructor(msg: Eris.Message, client: FurryBot) {

		if (!msg.channel) return;
		const data: {
			attachments?: Eris.Attachment[];
			author?: Eris.User;
			channel_id?: string;
			channelMentions?: string[];
			cleanContent?: string;
			content?: string;
			editedTimestamp?: number;
			embeds?: Eris.Embed[];
			id: string;
			member?: Eris.Member;
			mentionEveryone?: boolean;
			mentions?: Eris.User[];
			reactions?: {
				[s: string]: any;
				count: number;
				me: boolean;
			};
			roleMentions?: string[];
			timestamp?: number;
			tts?: boolean;
			type?: number;
		} = {
			id: msg.id
		};

		if (![undefined].includes(msg.attachments) && msg.attachments instanceof Array) data.attachments = msg.attachments;
		if (![undefined].includes(msg.author)) data.author = msg.author;
		if (![undefined].includes(msg.channel)) data.channel_id = msg.channel.id;
		if (![undefined].includes(msg.channelMentions) && msg.channelMentions instanceof Array) data.channelMentions = msg.channelMentions;
		if (![undefined].includes(msg.cleanContent)) data.cleanContent = msg.cleanContent;
		if (![undefined].includes(msg.content)) data.content = msg.content;
		if (![undefined].includes(msg.editedTimestamp)) data.editedTimestamp = msg.editedTimestamp;
		if (![undefined].includes(msg.embeds) && msg.embeds instanceof Array) data.embeds = msg.embeds;
		if (![undefined].includes(msg.member)) data.member = msg.member;
		if (![undefined].includes(msg.mentionEveryone)) data.mentionEveryone = msg.mentionEveryone;
		if (![undefined].includes(msg.mentions) && msg.mentions instanceof Array) data.mentions = msg.mentions;
		if (![undefined].includes(msg.reactions) && msg.reactions instanceof Array) data.reactions = msg.reactions;
		if (![undefined].includes(msg.roleMentions) && msg.roleMentions instanceof Array) data.roleMentions = msg.roleMentions;
		// if (![undefined].includes(msg.timestamp)) data.timestamp = msg.timestamp
		// else data.timestamp = Date.now();
		if (![undefined].includes(msg.tts)) data.tts = msg.tts;
		if (![undefined].includes(msg.type)) data.type = msg.type;
		super(data, client);
		this.client = client;

		// this property doesn't seem to be set properly
		this.timestamp = !isNaN(msg.timestamp) ? msg.timestamp : Date.now();

	}

	async _load() {
		if (!this.channel.guild) {
			this.uConfig = null;
			this.gConfig = null;
		} else {
			this.uConfig = await mdb.collection("users").findOne({ id: this.author.id }).then(async (res) => {
				if (!res) {
					await mdb.collection("users").insertOne({ ...{ id: this.author.id }, ...config.defaults.userConfig }).catch(err => null);
					console.debug(`Created User Entry "${this.author.id}"`);
					const res = await mdb.collection("users").findOne({ id: this.author.id });
					return res;
				} else return res;
			}).then(res => new UserConfig(this.author.id, res));

			this.gConfig = await mdb.collection("guilds").findOne({ id: this.channel.guild.id }).then(async (res) => {
				if (!res) {
					await mdb.collection("guilds").insertOne({ ...{ id: this.channel.guild.id }, ...config.defaults.guildConfig }).catch(err => null);
					console.debug(`Created Guild Entry "${this.channel.guild.id}"`);
					const res = await mdb.collection("guilds").findOne({ id: this.channel.guild.id });
					return res;
				} else return res;
			}).then(res => new GuildConfig(this.channel.guild.id, res));

			// this.author.dmChannel = this.author.bot ? null : await this.author.getDMChannel();
		}


		try {
			this.prefix = this.content.startsWith(`<@${this._client.user.id}>`) ? `<@${this._client.user.id}` : this.content.startsWith(`<@!${this._client.user.id}>`) ? `<@!${this._client.user.id}>` : config.beta ? config.defaultPrefix : this.gConfig.prefix.toLowerCase();

			const a = this.content.slice(this.prefix.length).trim().split(/\s+/);
			a.shift();
			try {
				this.args = this.content.slice(this.prefix.length).trim().match(/[^\s"]+|"[^"]+"/g).map(s => s.replace(/\"/g, "")); // eslint-disable-line no-useless-escape
			} catch (e) {
				try {
					this.args = this.content.slice(this.prefix.length).trim().split(/\s/);
				} catch (e) {
					this.args = [];
				}
			}

			this.cmd = this._client.getCommand(this.args.shift().toLowerCase());
			this.response = this._client.getResponse(this.content.toLowerCase());
			this.unparsedArgs = a;

			this.user = {
				isDeveloper: config.developers.includes(this.author.id)
			};

			this.author.tag = `${this.author.username}#${this.author.discriminator}`;
		} catch (e) {
			this._client.logger.log(`Error setting up message ${this.id}: ${e}`);
		}
	}

	embed_defaults(...without: string[]): Eris.EmbedOptions {
		let def: Eris.EmbedOptions;

		def = {
			author: {
				name: `${this.author.username}#${this.author.discriminator}`,
				icon_url: this.author.avatarURL
			},
			color: functions.randomColor(),
			timestamp: new Date().toISOString()
		};
		without.forEach((wth) => {
			if (typeof def[wth] !== "undefined") delete def[wth];
		});
		return def;
	}

	embed_defaults_na(...without: string[]): Eris.EmbedOptions {
		let def: Eris.EmbedOptions;
		def = {
			color: functions.randomColor(),
			timestamp: new Date().toISOString()
		};
		without.forEach((wth) => {
			if (typeof def[wth] !== "undefined") delete def[wth];
		});
		return def;
	}

	/*get gConfig(): GuildConfig {
		return mdb.collection("guilds").findOne({ id: this.channel.guild.id }).then(async (res) => {
			if (!res) {
	await mdb.collection("guilds").insertOne({ ...{ id: this.channel.guild.id }, ...config.defaults.guildConfig});
	console.debug(`Created Guild Entry "${this.channel.guild.id}`);
	return mdb.collection("guilds").findOne({ id: this.channel.guild.id });
			} else return res;
		}).then(res => new GuildConfig(this.guild.id, res));
	}

	get uConfig(): UserConfig {
		return mdb.collection("users").findOne({ id: this.author.id }).then(async (res) => {
			if (!res) {
	await mdb.collection("users").insertOne({ ...{ id: this.author.id }, ...config.defaults.userConfig });
	console.debug(`Created User Entry "${this.author.id}`);
	return mdb.collection("users").findOne({ id: this.author.id });
			} else return res;
		}).then(res => new UserConfig(this.author.id, res));
	}*/


	get mentionMap(): {
		users: Eris.User[],
		members: Eris.Member[],
		roles: Eris.Role[],
		channels: Eris.AnyGuildChannel[]
	} {
		return {
			users: !this.mentions ? [] : this.mentions,
			members: !this.mentions ? [] : this.mentions.map(j => this.channel.guild.members.get(j.id)),
			roles: !this.roleMentions ? [] : this.roleMentions.map(j => this.channel.guild.roles.get(j)),
			channels: !this.channelMentions ? [] : this.channelMentions.map(j => this.channel.guild.channels.get(j))
		};
	}

	get guild(): Eris.Guild {
		return this.channel.guild;
	}

	async reply(msg: string, attachments?: Eris.MessageFile): Promise<Eris.Message> {
		return this.channel.createMessage(`<@!${this.author.id}>, ${msg}`, attachments);
	}

	async getUserFromArgs(argPosition = 0, unparsed = false, join = false, mentionPosition = 0): Promise<Eris.User> {
		const {
			User,
			Member,
			Message,
			Guild
		} = require("eris");
		if (!(this instanceof Message)) throw new TypeError("invalid message");
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		if (!this.guild || !(this.guild instanceof Guild)) throw new TypeError("invalid or missing guild on this");

		// member mention
		if (this.mentionMap.users.length >= mentionPosition + 1) return this.mentionMap.users.slice(mentionPosition)[mentionPosition];
		// user ID
		if (![undefined, null, ""].includes(args[argPosition]) && !isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) {
			if (this.guild.members.has(args[argPosition])) return this.guild.members.get(args[argPosition]).user;
		}

		// username
		// update this to fix error "cannot read property 'user' of undefined" at the end
		// ^ fixed
		if (![undefined, null, ""].includes(args[argPosition]) && isNaN(args[argPosition]) && args[argPosition].indexOf("#") === -1 && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) {
			try {
				return this.channel.guild.members.find(m => m.user.username.toLowerCase() === args[argPosition].toLowerCase()).user;
			} catch (e) { }
		}

		// user tag
		if (![undefined, null, ""].includes(args[argPosition]) && isNaN(args[argPosition]) && args[argPosition].indexOf("#") !== -1 && !(this.mentionMap.members.length >= mentionPosition + 1)) return this.guild.members.find(m => `${m.username}#${m.discriminator}`.toLowerCase() === args[argPosition].toLowerCase()).user;

		// nothing found
		return this._client.getRESTUser(args[argPosition]).catch(err => null);
	}

	async getMemberFromArgs(argPosition = 0, unparsed = false, join = false, mentionPosition = 0): Promise<Eris.Member> {
		const {
			User,
			Member,
			Message,
			Guild
		} = require("eris");
		if (!(this instanceof Message)) throw new TypeError("invalid message");
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		if (!this.guild || !(this.guild instanceof Guild)) throw new TypeError("invalid or missing guild on this");

		// channel mention
		if (this.mentionMap.members.length >= mentionPosition + 1) return this.mentionMap.members.slice(mentionPosition)[mentionPosition];

		// channel ID
		if (!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) return this.guild.members.get(args[argPosition]);

		// channel name
		if (isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) return this.guild.members.find(c => c.user.username.toLowerCase() === args[argPosition].toLowerCase());

		// nothing found
		return null;
	}

	async getChannelFromArgs(argPosition = 0, unparsed = false, join = false, mentionPosition = 0): Promise<Eris.AnyGuildChannel> {
		const {
			User,
			Member,
			Message,
			Guild
		} = require("eris");
		if (!(this instanceof Message)) throw new TypeError("invalid message");
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		if (!this.guild || !(this.guild instanceof Guild)) throw new TypeError("invalid or missing guild on this");

		// role mention
		if (this.mentionMap.channels.length >= mentionPosition + 1) return this.mentionMap.channels.slice(mentionPosition)[mentionPosition];

		// role ID
		if (!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.channels.length >= mentionPosition + 1)) return this.guild.channels.get(args[argPosition]);

		// role name
		if (isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.channels.length >= mentionPosition + 1)) return this.guild.channels.find(r => r.name.toLowerCase() === args[argPosition].toLowerCase());

		// nothing found
		return null;
	}

	async getRoleFromArgs(argPosition = 0, unparsed = false, join = false): Promise<Eris.Role> {
		const {
			User,
			Member,
			Message,
			Guild
		} = require("eris");
		if (!(this instanceof Message)) throw new TypeError("invalid message");
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		// server id
		if (!isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this.guild.roles.get(args[argPosition]);

		// server name
		if (isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this.guild.roles.find(g => g.name.toLowerCase() === args[argPosition].toLowerCase());

		// nothing found
		return null;
	}

	async getServerFromArgs(argPosition = 0, unparsed = false, join = false): Promise<Eris.Guild> {
		const {
			User,
			Member,
			Message,
			Guild
		} = require("eris");
		if (!(this instanceof Message)) throw new TypeError("invalid message");
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		// server id
		if (!isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this._client.guilds.get(args[argPosition]);

		// server name
		if (isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this._client.guilds.find(g => g.name.toLowerCase() === args[argPosition].toLowerCase());

		// nothing found
		return null;
	}

	async configureUser(user = null): Promise<{
		isDeveloper: boolean,
		isServerModerator: boolean,
		isServerAdministrator: boolean
	}> {
		const {
			User,
			Member,
			Message,
			Guild
		} = require("eris"),
			config = require("./config");
		const member = !user ? user instanceof User ? this.guild.members.get(user.id) : user instanceof Member ? user : !isNaN(user) ? this.guild.members.get(user) : false : this.member;
		if (!(member instanceof Member)) throw new Error("invalid member");
		return {
			isDeveloper: config.developers.includes(member.id),
			isServerModerator: member.permissions.has("manageServer"),
			isServerAdministrator: member.permissions.has("administrator")
		};
	}

	async errorEmbed(type = "", custom = false, title = "", description = "", fields: any[] = [], color: number = functions.randomColor()): Promise<Eris.Message> {
		if (!custom) {
			switch (type.replace(/(\s|-)/g, "_").toUpperCase()) {
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
		return this.channel.createMessage({
			embed: {
				...{
					title,
					description,
					fields,
					color
				}, ...this.embed_defaults("color")
			}
		});
	}
}

export default ExtendedMessage;
