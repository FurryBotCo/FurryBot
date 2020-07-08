import Eris, { MessageContent } from "eris";
import FurryBot from "../main";
import * as F from "../util/Functions";
import Language from "../util/Language";
import EmbedBuilder from "../util/EmbedBuilder";
import Command from "./CommandHandler/Command";
import Category from "./CommandHandler/Category";
import config from "../config";
import db from "./Database";
import ModLogUtil from "../util/ModLogUtil";

export interface ExtendedGuildChanel extends Eris.GuildChannel {
	createMessage(content: MessageContent, file?: Eris.MessageFile): Promise<ExtendedMessage>;
	startTyping(maxRounds: number): NodeJS.Timeout;
	stopTyping(): boolean;
	readonly isTyping: boolean;
	guild: Eris.Guild & {
		readonly me: Eris.Member;
	};
}

export default class ExtendedMessage<T extends Eris.TextableChannel = Eris.TextableChannel, A extends { [k: string]: string; } = { [k: string]: string; }> extends Eris.Message<T> {
	channel: ExtendedGuildChanel & T;
	author: Eris.User & { tag: string; };
	client: FurryBot;
	private _client: Eris.Client;
	private _cmd: {
		cmd: Command;
		cat: Category;
	};
	private _args: string[];
	private _prefix: string;
	constructor(msg: Eris.Message<T>, client: FurryBot) {
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

		super(data, client.bot);
		this.client = client;

		// this property doesn't seem to be set properly
		this.timestamp = !isNaN(msg.timestamp) ? msg.timestamp : Date.now();

		if (!this.author.tag) Object.defineProperty(this.author, "tag", {
			get(this: Eris.User) { return `${this.username}#${this.discriminator}`; }
		});

		const ch = this.channel;

		if (typeof this.channel.startTyping === "undefined") Object.defineProperty(this.channel, "startTyping", {
			value: ((maxRounds = 6) => {
				this.channel.sendTyping();
				let i = 1;
				const k = setInterval(async () => {
					if (i >= maxRounds) clearInterval(k);
					else {
						await this.channel.sendTyping();
						i++;
					}
				}, 1e4);
				client.holder.set("typing", this.channel.id, k);
				return k;
			})
		});

		if (typeof this.channel.stopTyping === "undefined") Object.defineProperty(this.channel, "stopTyping", {
			value: (() => {
				if (client.holder.has("typing", ch.id)) {
					clearInterval(client.holder.get<NodeJS.Timer>("typing", ch.id));
					return client.holder.remove("typing", ch.id);
				} else return false;
			})
		});

		if (typeof this.channel.isTyping === "undefined") Object.defineProperty(this.channel, "isTyping", {
			get(this: T) {
				return client.holder.has("typing", ch.id);
			}
		});

		if (typeof this.channel.guild !== "undefined" && typeof this.channel.guild.me === "undefined") Object.defineProperty(this.channel.guild, "me", {
			get(this: Eris.Guild) {
				return this.members.get(client.bot.user.id);
			}
		});

		this.channel.createMessage = (async (content: Eris.MessageContent, file?: Eris.MessageFile) => {
			// easier than type checking
			if (!!this.channel.guild) {
				const g = await db.getGuild(this.channel.guild.id);
				if (typeof content === "string") content = Language.get(g.settings.lang).parseString(content);
				if (typeof content === "object") {
					content.content = Language.get(g.settings.lang).parseString(content.content);
					if (content.embed instanceof EmbedBuilder) content.embed = content.embed.toJSON();
				}
			}
			return this._client.createMessage.call(this._client, this.channel.id, content, file).then(d => new ExtendedMessage(d, this.client)).catch(err => null);
		});

		this.channel.editMessage = (async (messageID: string, content: Eris.MessageContent) => {
			// easier than type checking
			if (!!this.channel.guild) {
				const g = await db.getGuild(this.channel.guild.id);
				if (typeof content === "string") content = Language.get(g.settings.lang).parseString(content);
				if (typeof content === "object") {
					content.content = Language.get(g.settings.lang).parseString(content.content);
					if (content.embed instanceof EmbedBuilder) content.embed = content.embed.toJSON();
				}
			}
			return this._client.editMessage.call(this._client, this.channel.id, messageID, content).then(d => new ExtendedMessage(d, this.client)).catch(err => null);
		});

		this.edit = (async (content: Eris.MessageContent) => {
			// easier than type checking
			if (!!this.channel.guild) {
				const g = await db.getGuild(this.channel.guild.id);
				if (typeof content === "string") content = Language.get(g.settings.lang).parseString(content);
				if (typeof content === "object") {
					content.content = Language.get(g.settings.lang).parseString(content.content);
					if (content.embed instanceof EmbedBuilder) content.embed = content.embed.toJSON();
				}
			}
			return this._client.editMessage.call(this._client, this.channel.id, this.id, content).then(d => new ExtendedMessage(d, this.client)).catch(err => null);
		});

		// no prefix if dm
		// if ((this.channel.type as any) === Eris.Constants.ChannelTypes.DM) this.prefix = "";
	}

	get prefix() {
		return ![undefined, null].includes(this._prefix) ? this._prefix : this._prefix = [
			Eris.Constants.ChannelTypes.GUILD_TEXT,
			Eris.Constants.ChannelTypes.GUILD_NEWS
		].includes(this.channel.type as any) ? this.content.startsWith(`<@${this.client.bot.user.id}>`) ? `<@${this.client.bot.user.id}` : this.content.startsWith(`<@!${this.client.bot.user.id}>`) ? `<@!${this.client.bot.user.id}>` : config.defaults.prefix : null;
	}
	set prefix(p: string) { this._prefix = p; }
	get args() { return this._args instanceof Array ? this._args : this._args = F.Message.parseArgs(this.content, this.prefix); }
	set args(a: string[]) { this._args = a; }
	get unparsedArgs() { return this.content.slice(this.prefix.length).trim().split(/\s+/).slice(1); }
	get dashedArgs() { return F.Message.parseDashedArgs<A>(this.args, this.unparsedArgs); }
	get cmd() { return this._cmd ? this._cmd : this._cmd = F.Message.parseCmd(this.content, this.prefix, this.client); }
	get mentionMap(): {
		users: Eris.User[],
		members: Eris.Member[],
		roles: Eris.Role[],
		channels: Eris.AnyGuildChannel[]
	} {
		if (this.channel instanceof Eris.GuildChannel) return {
			users: !this.mentions ? [] : this.mentions,
			members: !this.mentions ? [] : this.mentions.map(c => this.channel.guild.members.get(c.id)),
			roles: !this.roleMentions ? [] : this.roleMentions.map(r => this.channel.guild.roles.get(r)),
			channels: !this.channelMentions ? [] : this.channelMentions.map(c => this.channel.guild.channels.get(c))
		};
		else return {
			users: !this.mentions ? [] : this.mentions,
			members: [],
			roles: [],
			channels: []
		};
	}

	async reply(msg: Eris.MessageContent, attachments?: Eris.MessageFile): Promise<Eris.Message> {
		if (typeof msg === "string") return this.channel.createMessage(`<@!${this.author.id}>, ${msg}`, attachments);
		else return this.channel.createMessage({
			...msg,
			content: msg.content ? `<@!${this.author.id}>, ${msg.content}` : ""
		}, attachments);
	}

	async getUserFromArgs<U extends Eris.User = Eris.User>(this: ExtendedMessage, argPosition = 0, unparsed = false, join = false, mentionPosition?: number): Promise<U> {
		if (!this) throw new TypeError("invalid message");
		if (![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(this.channel.type)) return;
		let argObject: string, args: string[];
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (!!join) (args = [this[argObject].join(" ")].filter(a => !a.startsWith("--")), argPosition = 0);
		else args = this[argObject].filter(a => !a.startsWith("--"));

		if (!this.channel.guild) throw new TypeError("invalid or missing guild on this");
		// make mention position zero if not explicitly set
		if ([undefined, null].includes(mentionPosition)) mentionPosition = 0;

		// member mention
		if (this.mentionMap.users.length >= mentionPosition + 1) return this.mentionMap.users[mentionPosition] as U;

		// user ID
		if (![undefined, null, ""].includes(args[argPosition]) && args[argPosition].match(/[0-9]{17,19}/) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) {
			if (this.channel.guild.members.has(args[argPosition])) return this.channel.guild.members.get(args[argPosition]).user as U;
			else if (this.client.bot.users.has(args[argPosition])) return this.client.bot.users.get(args[argPosition]) as U;
			else return this.client.bot.getRESTUser(args[argPosition]).catch(err => null) as Promise<U>;
		}

		// no username or tag because we're getting a user so it's not reasonable to look for those

		// nothing found
		return null;
	}

	async getMemberFromArgs<M extends Eris.Member>(this: ExtendedMessage, argPosition = 0, unparsed = false, join = false, mentionPosition?: number): Promise<M> {
		if (!this) throw new TypeError("invalid message");
		if (![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(this.channel.type)) return;
		let argObject: string, args: string[];
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (!!join) (args = [this[argObject].join(" ")].filter(a => !a.startsWith("--")), argPosition = 0);
		else args = this[argObject].filter(a => !a.startsWith("--"));

		if (!this.channel.guild) throw new TypeError("invalid or missing guild on this");
		// make mention position zero if not explicitly set
		if ([undefined, null].includes(mentionPosition)) mentionPosition = 0;

		// member mention
		if (this.mentionMap.members.length >= mentionPosition + 1) return this.mentionMap.members[mentionPosition] as M;

		// member ID
		if (![undefined, null, ""].includes(args[argPosition]) && args[argPosition].match(/[0-9]{17,19}/) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) {
			let m = this.channel.guild.members.get(args[argPosition]);
			if (!!m) return m as M;
			else {
				m = await this.channel.guild.getRESTMember(args[argPosition]).catch(err => null);
				if (!!m) {
					this.channel.guild.members.add(m);
					return m as M;
				}
			}
		}

		// username
		// apparently "user" can be null on a guild member?!?
		if (![undefined, null, ""].includes(args[argPosition]) && !args[argPosition].match(/[0-9]{17,19}/) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) return this.channel.guild.members.find((c: M) => c.user && c.user.username && c.user.username.toLowerCase() === args[argPosition].toLowerCase()) as M;

		// nothing found
		return null;
	}

	async getChannelFromArgs<C extends Eris.AnyGuildChannel>(this: ExtendedMessage, argPosition = 0, unparsed = false, join = false, mentionPosition?: number): Promise<C> {
		if (!this) throw new TypeError("invalid message");
		if (![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(this.channel.type)) return;
		let argObject: string, args: string[];
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (!!join) (args = [this[argObject].join(" ")].filter(a => !a.startsWith("--")), argPosition = 0);
		else args = this[argObject].filter(a => !a.startsWith("--"));

		if (!this.channel.guild) throw new TypeError("invalid or missing guild on this");
		// make mention position zero if not explicitly set
		if ([undefined, null].includes(mentionPosition)) mentionPosition = 0;

		// channel mention
		if (this.mentionMap.channels.length >= mentionPosition + 1) return this.mentionMap.channels.slice(mentionPosition)[mentionPosition] as C;

		// channel ID
		if (![undefined, null, ""].includes(args[argPosition]) && !args[argPosition].match(/[0-9]{17,19}/) && !(args.length === argPosition || !args || this.mentionMap.channels.length >= mentionPosition + 1)) return this.channel.guild.channels.get(args[argPosition]) as C;

		// channel name
		if (![undefined, null, ""].includes(args[argPosition]) && args[argPosition].match(/[0-9]{17,19}/) && !(args.length === argPosition || !args || this.mentionMap.channels.length >= mentionPosition + 1)) return this.channel.guild.channels.find((r: C) => r.name.toLowerCase() === args[argPosition].toLowerCase()) as C;

		// nothing found
		return null;
	}

	async getRoleFromArgs<R extends Eris.Role>(this: ExtendedMessage, argPosition = 0, unparsed = false, join = false, mentionPosition?: number): Promise<R> {
		if (!this) throw new TypeError("invalid message");
		if (![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(this.channel.type)) return;
		let argObject: string, args: string[];
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (!!join) (args = [this[argObject].join(" ")].filter(a => !a.startsWith("--")), argPosition = 0);
		else args = this[argObject].filter(a => !a.startsWith("--"));

		if (!this.channel.guild) throw new TypeError("invalid or missing guild on this");
		// make mention position zero if not explicitly set
		if ([undefined, null].includes(mentionPosition)) mentionPosition = 0;

		// role mention
		if (this.mentionMap.roles.length >= mentionPosition + 1) return this.mentionMap.roles.slice(mentionPosition)[mentionPosition] as R;


		// role id
		if (![undefined, null, ""].includes(args[argPosition]) && args[argPosition].match(/[0-9]{17,19}/) && !(args.length === argPosition || !args)) return this.channel.guild.roles.get(args[argPosition]) as R;

		// role name
		if (![undefined, null, ""].includes(args[argPosition]) && !args[argPosition].match(/[0-9]{17,19}/) && !(args.length === argPosition || !args)) return this.channel.guild.roles.find((r: R) => r.name.toLowerCase() === args[argPosition].toLowerCase()) as R;

		// nothing found
		return null;
	}

	async getGuildFromArgs<G extends Eris.Guild>(this: ExtendedMessage, argPosition = 0, unparsed = false, join = false): Promise<G> {
		if (!this) throw new TypeError("invalid message");
		if (![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(this.channel.type)) return;
		let argObject: string, args: string[];
		argObject = unparsed ? "unparsedArgs" : "args";
		if (!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if (!!join) (args = [this[argObject].join(" ")].filter(a => !a.startsWith("--")), argPosition = 0);
		else args = this[argObject].filter(a => !a.startsWith("--"));

		// server id
		if (![undefined, null, ""].includes(args[argPosition]) && args[argPosition].match(/[0-9]{17,19}/) && !(args.length === argPosition || !args)) return this.client.bot.guilds.get(args[argPosition]) as G;

		// server name
		if (![undefined, null, ""].includes(args[argPosition]) && !args[argPosition].match(/[0-9]{17,19}/) && !(args.length === argPosition || !args)) return this.client.bot.guilds.find((g: G) => g.name.toLowerCase() === args[argPosition].toLowerCase()) as G;

		// nothing found
		return null;
	}

	async errorEmbed(this: ExtendedMessage, type?: "INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL" | "INVALID_SERVER", custom = false, title = "", description = "", fields: any[] = [], color: number = Math.floor(Math.random() * 0xFFFFFF)): Promise<Eris.Message> {
		if (!type) type = "" as any;
		if (!custom) {
			switch (type.replace(/(\s|-)/g, "_").toUpperCase()) {
				case "INVALID_USER":
				case "INVALID_MEMBER":
					title = "User Not Found";
					description = "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag";
					fields = [];
					break;

				case "INVALID_ROLE":
					title = "Role Not Found";
					description = "The specified role was not found, please provide one of the following:\nFULL role ID, FULL role name (capitals do matter), or role mention";
					fields = [];
					break;

				case "INVALID_CHANNEL":
					title = "Channel Not Found";
					description = "The specified channel was not found, please provide one of the following:\nFULL channel ID, FULL channel name, or channel mention";
					fields = [];
					break;

				case "INVALID_SERVER":
					title = "Server Not Found";
					description = "The specified server was not found, please provide a valid server id the bot is in.";
					fields = [];
					break;

				default:
					title = "Default Title";
					description = "Default Description";
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
