import config from "../../config";
import ExtendedMessage, { ExtendedTextChannel } from "../../modules/ExtendedMessage";
import Eris from "eris";
import FurryBot from "../../main";
import Logger from "../LoggerV8";

export default class Message {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	static async reply(this: ExtendedMessage, msg: Eris.MessageContent, attachments?: Eris.MessageFile): Promise<Eris.Message> {
		if (typeof msg === "string") return this.channel.createMessage(`<@!${this.author.id}>, ${msg}`, attachments);
		else return this.channel.createMessage({
			...msg,
			content: msg.content ? `<@!${this.author.id}>, ${msg.content}` : ""
		}, attachments);
	}

	static async getUserFromArgs<U extends Eris.User>(this: ExtendedMessage, argPosition = 0, unparsed = false, join = false, mentionPosition = 0): Promise<U> {
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
		if (this.mentionMap.users.length >= mentionPosition + 1) return this.mentionMap.users[mentionPosition] as U;
		// user ID
		if (![undefined, null, ""].includes(args[argPosition]) && !isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) {
			if (this.guild.members.has(args[argPosition])) return this.guild.members.get(args[argPosition]).user as U;
		}

		// username
		if (![undefined, null, ""].includes(args[argPosition]) && isNaN(args[argPosition]) && args[argPosition].indexOf("#") === -1 && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) {
			try {
				return this.channel.guild.members.find(m => m.user.username.toLowerCase() === args[argPosition].toLowerCase()).user as U;
			} catch (e) {
				return null;
			}
		}

		// user tag
		if (![undefined, null, ""].includes(args[argPosition]) && isNaN(args[argPosition]) && args[argPosition].indexOf("#") !== -1 && !(this.mentionMap.members.length >= mentionPosition + 1)) return this.guild.members.find(m => `${m.username}#${m.discriminator}`.toLowerCase() === args[argPosition].toLowerCase()).user as U;

		// nothing found
		return this.client.getRESTUser(args[argPosition]).catch(err => null);
	}

	static async getMemberFromArgs<M extends Eris.Member>(this: ExtendedMessage, argPosition = 0, unparsed = false, join = false, mentionPosition = 0): Promise<M> {
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
		if (this.mentionMap.members.length >= mentionPosition + 1) return this.mentionMap.members[mentionPosition] as M;

		// member ID
		if (!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) return this.guild.members.get(args[argPosition]) as M;

		// username
		if (isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.members.length >= mentionPosition + 1)) return this.guild.members.find(c => c.user.username.toLowerCase() === args[argPosition].toLowerCase()) as M;

		// nothing found
		return null;
	}

	static async getChannelFromArgs<C extends Eris.AnyGuildChannel>(this: ExtendedMessage, argPosition = 0, unparsed = false, join = false, mentionPosition = 0): Promise<C> {
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
		if (this.mentionMap.channels.length >= mentionPosition + 1) return this.mentionMap.channels.slice(mentionPosition)[mentionPosition] as C;

		// role ID
		if (!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.channels.length >= mentionPosition + 1)) return this.guild.channels.get(args[argPosition]) as C;

		// role name
		if (isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentionMap.channels.length >= mentionPosition + 1)) return this.guild.channels.find(r => r.name.toLowerCase() === args[argPosition].toLowerCase()) as C;

		// nothing found
		return null;
	}

	static async getRoleFromArgs<R extends Eris.Role>(this: ExtendedMessage, argPosition = 0, unparsed = false, join = false): Promise<R> {
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
		if (!isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this.guild.roles.get(args[argPosition]) as R;

		// role name
		if (isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this.guild.roles.find(r => r.name.toLowerCase() === args[argPosition].toLowerCase()) as R;

		// nothing found
		return null;
	}

	static async getGuildFromArgs<G extends Eris.Guild>(this: ExtendedMessage, argPosition = 0, unparsed = false, join = false): Promise<G> {
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
		if (!isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this.client.guilds.get(args[argPosition]) as G;

		// server name
		if (isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this.client.guilds.find(g => g.name.toLowerCase() === args[argPosition].toLowerCase()) as G;

		// nothing found
		return null;
	}
	static get getServerFromArgs() { return this.getGuildFromArgs; }

	static async errorEmbed(this: ExtendedMessage, type?: "INVALID_USER" | "INVALID_MEMBER" | "INVALID_ROLE" | "INVALID_CHANNEL" | "INVALID_SERVER", custom = false, title = "", description = "", fields: any[] = [], color: number = Math.floor(Math.random() * 0xFFFFFF)): Promise<Eris.Message> {
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

	static parseDashedArgs(originalArgs: string[], originalUnparsedArgs?: string[]): {
		[k in "parsed" | "unparsed"]: {
			keyValue: {
				[k: string]: string;
			};
			value: string[];
			args: string[];
		}
	} {
		function d(args: string[]) {
			const keyValue = {};
			const value = [];
			const rm = [];


			args.map(a => a.startsWith("--") ? (() => {
				const b = a.split("=");
				if (!b[1]) (value.push(b[0].slice(2)), rm.push(a));
				else (keyValue[b[0].slice(2)] = b[1], rm.push(a));
			})() : a.startsWith("-") ? (value.push(a.slice(1)), rm.push(a)) : null);

			rm.map(r => args.splice(args.indexOf(r)));

			return {
				keyValue,
				value,
				args
			};
		}

		return {
			parsed: d([...originalArgs]),
			unparsed: d(originalUnparsedArgs && originalUnparsedArgs.length > 0 ? [...originalUnparsedArgs] : [...originalArgs])
		};
	}

	static parseArgs(content: string, prefix: string) {
		try {
			return content.slice(prefix.length).trim().match(/[^\s"]+|"[^"]+"/g).map(s => s.replace(/\"/g, "")).slice(1); // eslint-disable-line no-useless-escape
		} catch (e) {
			try {
				return content.slice(prefix.length).trim().split(/\s/).slice(1);
			} catch (e) {
				return [];
			}
		}
	}

	static parseCmd(content: string, prefix: string, client: FurryBot) {
		try {
			if (!content.toLowerCase().startsWith(prefix.toLowerCase())) return null;
			const t = content.slice(prefix.length).trim().match(/[^\s"]+|"[^"]+"/g).map(s => s.replace(/\"/g, ""))[0].toLowerCase();
			const c = client.cmd.getCommand(t);
			return c || null;
		} catch (e) {
			Logger.error("Message Parse", `Error parsing command:`);
			Logger.error("Message Parse", e);
			return null;
		}
	}

	static async startTyping<T extends Eris.TextableChannel = ExtendedTextChannel>(client: FurryBot, ch: T, maxRounds = 6) {
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
	}

	static async stopTyping<T extends Eris.TextableChannel = ExtendedTextChannel>(client: FurryBot, ch: T) {
		if (client.channelTyping.has(ch.id)) {
			clearInterval(client.channelTyping.get(ch.id));
			return client.channelTyping.delete(ch.id);
		} else return false;
	}
}
