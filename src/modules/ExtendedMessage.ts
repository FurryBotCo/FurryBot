import * as Eris from "eris";
import FurryBot from "@FurryBot";
import UserConfig from "./config/UserConfig";
import GuildConfig from "./config/GuildConfig";
import config from "../config";
import { Logger } from "../util/LoggerV8";
import deasync from "deasync";
import Command from "../util/CommandHandler/lib/Command";
import Category from "../util/CommandHandler/lib/Category";
import { db, mdb } from "./Database";

interface ExtendedTextChannel extends Eris.TextChannel {
	furpile: {
		active: boolean;
		inPile: string[];
		timeout: NodeJS.Timeout;
		member: Eris.Member | Eris.User;
	};
	conga: {
		active: boolean;
		inConga: string[];
		timeout: NodeJS.Timeout;
		member: Eris.Member | Eris.User;
	};
	awoo: {
		active: boolean;
		inAwoo: string[];
		timeout: NodeJS.Timeout;
	};
	startTyping: (maxRounds?: number) => Promise<Map<string, NodeJS.Timeout>>;
	stopTyping: () => Promise<boolean>;
	readonly isTyping: boolean;
}

class ExtendedMessage extends Eris.Message {
	id: string;
	channel: ExtendedTextChannel;
	timestamp: number;
	type: number;
	author: Eris.User & { tag: string; };
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
	// response: AutoResponse;
	client: FurryBot;
	_client: Eris.Client;
	c: string;
	user: {
		isDeveloper: boolean;
		isBooster: boolean;
	};
	private _gConfig: GuildConfig;
	private _uConfig: UserConfig;
	private _cmd: {
		cmd: Command;
		cat: Category;
	};
	private _args: string[];
	constructor(msg: Eris.Message, client: FurryBot) {
		if (!msg.channel) return;
		// if (!mdb) throw new TypeError("missing mdb");
		// if (!uc) throw new TypeError("missing user config");
		// if (!gc) throw new TypeError("missing guild config");

		const data: {
			attachments?: Eris.Attachment[];
			author?: Eris.User;
			channel_id?: string;
			channelMentions?: string[];
			roleMentions?: string[];
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
		if (![undefined].includes(msg.roleMentions) && msg.roleMentions instanceof Array) data.roleMentions = msg.roleMentions;
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
		super(data, client instanceof Eris.Client ? client : (client as any).eris);
		this.client = client;
		// this property doesn't seem to be set properly
		this.timestamp = !isNaN(msg.timestamp) ? msg.timestamp : Date.now();

		if (!this.author.tag) Object.defineProperty(this.author, "tag", {
			get(this: Eris.User) { return `${this.username}#${this.discriminator}`; }
		});
	}

	async _load() {
		const client = this.client;
		this._uConfig = await db.getUser(this.author.id);
		if ([Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(this.channel.type)) {
			this._gConfig = await db.getGuild(this.channel.guild.id);
			this.user = {
				get isDeveloper() {
					return config.developers.includes(this.user.id);
				},
				isBooster: await client.f.checkBooster(this.author.id, client)
			};
		} else {
			this._gConfig = null;
			this.user = {
				get isDeveloper() {
					return config.developers.includes(this.user.id);
				},
				isBooster: false
			};
		}
		const ch = this.channel;

		if (typeof this.channel.startTyping === "undefined") Object.defineProperty(this.channel, "startTyping", {
			value: (async (maxRounds = 6) => {
				ch.sendTyping();
				let i = 1;
				const k = setInterval(async () => {
					if (i >= maxRounds) clearInterval(k);
					else {
						await ch.sendTyping();
						i++;
					}
				}, 1e4);
				client.channelTyping.set(ch.id, k);
				return k;
			})
		});

		if (typeof this.channel.stopTyping === "undefined") Object.defineProperty(this.channel, "stopTyping", {
			value: (async () => {
				if (client.channelTyping.has(ch.id)) {
					clearInterval(client.channelTyping.get(ch.id));
					return client.channelTyping.delete(ch.id);
				} else return false;
			})
		});

		if (typeof this.channel.isTyping === "undefined") Object.defineProperty(this.channel, "isTyping", {
			get() {
				return client.channelTyping.has(ch.id);
			}
		});
	}

	get prefix() {
		return ![
			Eris.Constants.ChannelTypes.GUILD_TEXT,
			Eris.Constants.ChannelTypes.GUILD_NEWS
		].includes(this.channel.type) ? null : this.content.startsWith(`<@${this._client.user.id}>`) ? `<@${this._client.user.id}` : this.content.startsWith(`<@!${this._client.user.id}>`) ? `<@!${this._client.user.id}>` : this.gConfig && this.gConfig.settings.prefix ? this.gConfig.settings.prefix : config.defaultPrefix;
	}

	get args() {
		if (!(this._args instanceof Array)) {
			try {
				return this._args = this.content.slice(this.prefix.length).trim().match(/[^\s"]+|"[^"]+"/g).map(s => s.replace(/\"/g, "")).slice(1); // eslint-disable-line no-useless-escape
			} catch (e) {
				try {
					return this._args = this.content.slice(this.prefix.length).trim().split(/\s/).slice(1);
				} catch (e) {
					return this._args = [];
				}
			}
		} else return this._args;
	}

	set args(a: string[]) {
		this._args = a;
	}

	get unparsedArgs() {
		return this.content.slice(this.prefix.length).trim().split(/\s+/).slice(1);
	}

	get cmd() {
		if (!this._cmd) {
			try {
				if (!this.content.toLowerCase().startsWith(this.prefix.toLowerCase())) return null;
				const t = this.content.slice(this.prefix.length).trim().match(/[^\s"]+|"[^"]+"/g).map(s => s.replace(/\"/g, ""))[0].toLowerCase();
				const c = this.client.cmd.getCommand(t);
				if (c) return this._cmd = c;
				else return this._cmd = null;
			} catch (e) {
				Logger.error("Message Parse", `Error parsing command:`);
				Logger.error("Message Parse", e);
				return this._cmd = null;
			}
		} else return this._cmd;
	}

	get uConfig() {
		return this._uConfig;
	}

	/*set uConfig(f) {
		if (!this._uConfig) this._uConfig = deasync(this.fetchDBConfig).call(this, "user");
		this._uConfig.edit(f).then(d => d.reload());
	}*/

	get gConfig() {
		return this._gConfig;
	}

	/*set gConfig(f) {
		if (!this._gConfig) this._gConfig = deasync(this.fetchDBConfig).call(this, "guild");
		this._gConfig.edit(f).then(d => d.reload());
	}*/

	get mentionMap(): {
		users: Eris.User[],
		members: Eris.Member[],
		roles: Eris.Role[],
		channels: Eris.AnyGuildChannel[]
	} {
		if (this.channel instanceof Eris.GuildChannel) return {
			users: !this.mentions ? [] : [...this.mentions].reverse(),
			members: !this.mentions ? [] : [...this.mentions].map(c => this.channel.guild.members.get(c.id)).reverse(),
			roles: !this.roleMentions ? [] : [...this.roleMentions].map(r => this.channel.guild.roles.get(r)),
			channels: !this.channelMentions ? [] : [...this.channelMentions].map(c => this.channel.guild.channels.get(c))
		};
		else return {
			users: !this.mentions ? [] : [...this.mentions].reverse(),
			members: [],
			roles: [],
			channels: []
		};
	}

	get guild(): Eris.Guild {
		return this.channel.guild;
	}

	async reply(msg: Eris.MessageContent, attachments?: Eris.MessageFile): Promise<Eris.Message> {
		if (typeof msg === "string") return this.channel.createMessage(`<@!${this.author.id}>, ${msg}`, attachments);
		else return this.channel.createMessage({
			...msg,
			content: msg.content ? `<@!${this.author.id}>, ${msg.content}` : ""
		}, attachments);
	}

	async getUserFromArgs(argPosition = 0, unparsed = false, join = false, mentionPosition = 0): Promise<Eris.User> {
		if (!this) throw new TypeError("invalid message");
		if (![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(this.channel.type)) return;
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		if (!this.guild) throw new TypeError("invalid or missing guild on this");

		// member mention
		if (this.mentionMap.users.length >= mentionPosition + 1) return this.mentionMap.users[mentionPosition];
		// user ID
		if (![undefined, null, ""].includes(args[argPosition]) && !isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) {
			if (this.guild.members.has(args[argPosition])) return this.guild.members.get(args[argPosition]).user;
		}

		// username
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
		if (!this) throw new TypeError("invalid message");
		if (![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(this.channel.type)) return;
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		if (!this.guild) throw new TypeError("invalid or missing guild on this");

		// member mention
		if (this.mentionMap.members.length >= mentionPosition + 1) return this.mentionMap.members[mentionPosition];

		// member ID
		if (!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) return this.guild.members.get(args[argPosition]);

		// username
		if (isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) return this.guild.members.find(c => c.user.username.toLowerCase() === args[argPosition].toLowerCase());

		// nothing found
		return null;
	}

	async getChannelFromArgs(argPosition = 0, unparsed = false, join = false, mentionPosition = 0): Promise<Eris.AnyGuildChannel> {
		if (!this) throw new TypeError("invalid message");
		if (![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(this.channel.type)) return;
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		if (!this.guild) throw new TypeError("invalid or missing guild on this");

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
		if (!this) throw new TypeError("invalid message");
		if (![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(this.channel.type)) return;
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}

		// role id
		if (!isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this.guild.roles.get(args[argPosition]);

		// role name
		if (isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this.guild.roles.find(r => r.name.toLowerCase() === args[argPosition].toLowerCase());

		// nothing found
		return null;
	}

	async getServerFromArgs(argPosition = 0, unparsed = false, join = false): Promise<Eris.Guild> {
		if (!this) throw new TypeError("invalid message");
		if (![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(this.channel.type)) return;
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

	async errorEmbed(type?: "INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL" | "INVALID_SERVER", custom = false, title = "", description = "", fields: any[] = [], color: number = Math.floor(Math.random() * 0xFFFFFF)): Promise<Eris.Message> {
		if (!type) type = "" as any;
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
				title,
				description,
				fields,
				color,
				timestamp: new Date().toISOString(),
				author: {
					name: this.author.tag,
					icon_url: this.author.avatarURL
				}
			}
		});
	}
}

export default ExtendedMessage;
