import Eris from "eris";
import FurryBot from "@FurryBot";
import UserConfig from "./config/UserConfig";
import GuildConfig from "./config/GuildConfig";
import config from "../config";
import { Logger } from "../util/LoggerV8";
import Command from "../util/CommandHandler/lib/Command";
import Category from "../util/CommandHandler/lib/Category";
import { db } from "./Database";
import * as F from "../util/Functions";

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;
type OmitMultipleArgs<F> = OmitFirstArg<OmitFirstArg<F>>;

export interface ExtendedTextChannel extends Eris.TextChannel {
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
	startTyping: OmitMultipleArgs<typeof F.Message.startTyping>;
	stopTyping: OmitMultipleArgs<typeof F.Message.stopTyping>;
	readonly isTyping: boolean;
}

class ExtendedMessage extends Eris.Message<ExtendedTextChannel> {
	id: string;
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
	c: string;
	user: {
		isDeveloper: boolean;
		isBooster: boolean;
	};
	client: FurryBot;
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
				isBooster: await F.Internal.checkBooster(this.author.id, client)
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
			value: F.Message.startTyping.bind(null, this.client, ch)
		});

		if (typeof this.channel.stopTyping === "undefined") Object.defineProperty(this.channel, "stopTyping", {
			value: F.Message.stopTyping.bind(null, this.client, ch)
		});

		if (typeof this.channel.isTyping === "undefined") Object.defineProperty(this.channel, "isTyping", {
			get() {
				return client.channelTyping.has(ch.id);
			}
		});

		return this;
	}

	get prefix() {
		return ![
			Eris.Constants.ChannelTypes.GUILD_TEXT,
			Eris.Constants.ChannelTypes.GUILD_NEWS
		].includes(this.channel.type) ? null : this.content.startsWith(`<@${this.client.user.id}>`) ? `<@${this.client.user.id}` : this.content.startsWith(`<@!${this.client.user.id}>`) ? `<@!${this.client.user.id}>` : this.gConfig && this.gConfig.settings.prefix ? this.gConfig.settings.prefix : config.defaultPrefix;
	}
	get args() { return this._args instanceof Array ? this._args : this._args = F.Message.parseArgs(this.content, this.prefix); }
	set args(a: string[]) { this._args = a; }
	get unparsedArgs() { return this.content.slice(this.prefix.length).trim().split(/\s+/).slice(1); }
	get dashedArgs() { return F.Message.parseDashedArgs(this.args, this.unparsedArgs); }
	get cmd() { return this._cmd ? this._cmd : this._cmd = F.Message.parseCmd(this.content, this.prefix, this.client); }
	get uConfig() { return this._uConfig; }
	get gConfig() { return this._gConfig; }
	get mentionMap(): {
		users: Eris.User[],
		members: Eris.Member[],
		roles: Eris.Role[],
		channels: Eris.AnyGuildChannel[]
	} {
		if (this.channel instanceof Eris.GuildChannel) return {
			users: !this.mentions ? [] : this.mentions.reverse(),
			members: !this.mentions ? [] : this.mentions.map(c => this.channel.guild.members.get(c.id)).reverse(),
			roles: !this.roleMentions ? [] : this.roleMentions.map(r => this.channel.guild.roles.get(r)),
			channels: !this.channelMentions ? [] : this.channelMentions.map(c => this.channel.guild.channels.get(c))
		};
		else return {
			users: !this.mentions ? [] : this.mentions.reverse(),
			members: [],
			roles: [],
			channels: []
		};
	}

	get guild() { return this.channel.guild; }
	get reply(): typeof F.Message.reply { return F.Message.reply.bind(this); }
	get getUserFromArgs(): typeof F.Message.getUserFromArgs { return F.Message.getUserFromArgs.bind(this); }
	get getMemberFromArgs(): typeof F.Message.getMemberFromArgs { return F.Message.getMemberFromArgs.bind(this); }
	get getChannelFromArgs(): typeof F.Message.getChannelFromArgs { return F.Message.getChannelFromArgs.bind(this); }
	get getRoleFromArgs(): typeof F.Message.getRoleFromArgs { return F.Message.getRoleFromArgs.bind(this); }
	get getGuildFromArgs(): typeof F.Message.getGuildFromArgs { return F.Message.getGuildFromArgs.bind(this); }
	get getServerFromArgs() { return this.getGuildFromArgs; }
	get errorEmbed(): typeof F.Message.errorEmbed { return F.Message.errorEmbed.bind(this); }
}

export default ExtendedMessage;
