import * as UT from "./utilTypes";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import Eris from "eris";
import config from "../../../config";
import { Logger } from "../../LoggerV8";
import * as fs from "fs";
import Command from "./Command";
import { Colors } from "../../Constants";
import { Request } from "../../Functions";

export default class SubCommand {
	triggers: UT.ArrayOneOrMore<string>;
	userPermissions: UT.ErisPermissions[];
	botPermissions: UT.ErisPermissions[];
	cooldown: number;
	donatorCooldown: number;
	description: string;
	usage: string;
	features: ("nsfw" | "devOnly" | "betaOnly" | "donatorOnly" | "guildOwnerOnly" | "supportOnly")[];
	category: string;
	subCommands: SubCommand[];
	file: string;
	parent: Command;
	run: (this: FurryBot, msg: ExtendedMessage, cmd: SubCommand) => Promise<unknown>;
	constructor(d: {
		triggers: UT.ArrayOneOrMore<string>;
		userPermissions?: UT.ErisPermissions[];
		botPermissions?: UT.ErisPermissions[];
		cooldown?: number;
		donatorCooldown?: number;
		description?: string;
		usage?: string;
		features?: SubCommand["features"];
		category?: string;
		subCommandDir?: string | string[];
		file: string;
	}, run: (this: FurryBot, msg: ExtendedMessage, cmd: SubCommand) => Promise<unknown>) {
		if (!d.triggers || d.triggers.length < 1) throw new TypeError("Invalid command triggers provided.");
		// category is set at addition time
		// if (!d.category) throw new TypeError("Invalid/missing category.");
		this.triggers = d.triggers;
		this.userPermissions = d.userPermissions || [];
		this.botPermissions = d.botPermissions || [];
		this.cooldown = !!d.cooldown ? d.cooldown : 0;
		this.donatorCooldown = !!d.donatorCooldown ? d.donatorCooldown : !!d.cooldown ? d.cooldown : 0;
		this.description = d.description || "";
		this.usage = d.usage || "";
		this.features = d.features || [];
		this.run = run;
		this.category = d.category || null;
		this.subCommands = [];
		this.parent = null;
		this.file = d.file;

		if (!!d.subCommandDir) {
			if (d.subCommandDir instanceof Array) d.subCommandDir.map(dir => !fs.existsSync(dir) ? Logger.error("Command Handler", `Invalid sub command directory "${dir}" for command ${this.triggers[0]}.`) : this.fillInSubCommands(dir));
			else !fs.existsSync(d.subCommandDir) ? Logger.error("Command Handler", `Invalid sub command directory "${d.subCommandDir}" for command ${this.triggers[0]}.`) : this.fillInSubCommands(d.subCommandDir);
		}
	}

	setCategory(cat: string) {
		this.category = cat;
		return this;
	}

	addSubCommand(cmd: SubCommand) {
		const t = this.subCommands.map(c => c.triggers).reduce((a, b) => a.concat(b), []).map(tr => tr.toLowerCase());
		// if (cmd.triggers.map(tr => tr.toLowerCase()).some(tr => t.includes(tr.toLowerCase())))

		for (const tr of cmd.triggers) if (t.includes(tr.toLowerCase())) throw new TypeError(`Duplicate trigger ${tr.toLowerCase()}`);

		cmd.setParent(this);

		this.subCommands.push(cmd);
	}

	removeSubCommand(triggerOrCmd: string | SubCommand) {
		if (typeof triggerOrCmd === "string") {
			const cmd = this.subCommands.find(c => c.triggers.includes(triggerOrCmd));
			if (!cmd) return false;
			this.subCommands.splice(this.subCommands.indexOf(cmd), 1);
			return true;
		} else {
			if (!this.subCommands.includes(triggerOrCmd)) return false;
			this.subCommands.splice(this.subCommands.indexOf(triggerOrCmd), 1);
			return true;
		}
	}

	getSubCommand(cmd: string) {
		return this.subCommands.find(c => c.triggers.map(tr => tr.toLowerCase()).includes(cmd.toLowerCase())) || null;
	}

	async sendSubCommandEmbed(msg: ExtendedMessage) {
		if (!msg.channel.permissionsOf(msg.client.user.id).has("embedLinks")) return msg.reply(`I require the \`embedLinks\` permission for this to work.`).catch(err => null);

		return msg.channel.createMessage({
			embed: {
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				title: "Sub Command Help",
				description: `\`command\` - ** description **\n\n${this.subCommands.length === 0 ? "No Sub Commands Found" : this.subCommands.map(s => `\`${s.triggers[0]}\` - **${s.description}**`).join("\n")}`,
				timestamp: new Date().toISOString(),
				color: Colors.fur,
				footer: {
					text: `Command: ${this.parent ? `${this.parent.triggers[0]} > ` : ""}${this.triggers[0]}`,
					icon_url: "https://i.furry.bot/furry.png"
				}
			}
		});
	}

	async handleSubCommand(msg: ExtendedMessage, client: FurryBot) {
		const cmd = this.getSubCommand(msg.args[0]);
		// setter
		msg.args = msg.args.slice(1);
		if (!cmd) return msg.reply(`invalid sub command.`);

		if (cmd.features.includes("betaOnly") && !config.beta) return;

		if (cmd.features.includes("devOnly") && !config.developers.includes(msg.author.id)) {
			Logger.debug(`Shard #${msg.channel.guild.shard.id}`, `${msg.author.tag} (${msg.author.id}) attempted to run developer command "${cmd.triggers[0]}" in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`);
			client.increment(`commands.${cmd.triggers[0].toLowerCase()}.missingPermissions`, ["missing:dev"]);
			return msg.reply(`you must be a developer to use this command.`).catch(err => null);
		}

		if (cmd.features.includes("supportOnly") && msg.channel.guild.id !== config.bot.mainGuild) return msg.reply("this command may only be ran in my support server.").catch(err => null);

		if (cmd.features.includes("guildOwnerOnly") && msg.author.id !== msg.channel.guild.ownerID) return msg.reply("only this servers owner may use this command.").catch(err => null);

		if (cmd.features.includes("nsfw")) {
			if (!msg.channel.nsfw) return msg.reply(`this command can only be ran in nsfw channels.`, {
				file: await Request.getImageFromURL("https://assets.furry.bot/nsfw.gif"),
				name: "nsfw.gif"
			}).catch(err => null);

			if (!msg.gConfig.settings.nsfw) return msg.reply(`nsfw commands are not enabled in this server. To enable them, have an administrator run \`${msg.gConfig.settings.prefix}settings nsfw enable\`.`).catch(err => null);

			if (msg.channel.topic && config.yiff.disableStatements.some(t => msg.channel.topic.indexOf(t) !== -1)) {
				const st = config.yiff.disableStatements.filter(t => msg.channel.topic.indexOf(t) !== -1);
				st.map(k => client.increment("other.nsfwDisabled", [`statment:${k}`]));

				return msg.channel.createMessage({
					embed: {
						author: {
							name: msg.author.tag,
							icon_url: msg.author.avatarURL
						},
						title: "NSFW Commands Disabled",
						description: `NSFW commands have been explicitly disabled in this channel, to reenable them, remove **${st.join("**, **")}** from the channel topic.`,
						color: Colors.red,
						timestamp: new Date().toISOString()
					}
				}).catch(err => null);
			}
		}

		if (cmd.userPermissions.length > 0 && !config.developers.includes(msg.author.id)) {
			if (cmd.userPermissions.some(perm => !msg.channel.permissionsOf(msg.author.id).has(perm))) {
				const p = cmd.userPermissions.filter(perm => !msg.channel.permissionsOf(msg.author.id).has(perm));
				if (!msg.channel.permissionsOf(msg.client.user.id).has("embedLinks")) return msg.reply(`you're missing some permissions to be able to run that, but I need the \`embedLinks\` permission to tell you which.`).catch(err => null);

				Logger.debug(`Shard #${msg.channel.guild.shard.id}`, `user ${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) is missing the permission(s) ${p.join(", ")} to run the command ${cmd.triggers[0]}`);
				return msg.channel.createMessage({
					embed: {
						title: "You do not have the required permission(s) to use this!",
						description: `You require the permission(s) **${p.join("**, **")}** to run this, which you do not have.`,
						color: Colors.red,
						timestamp: new Date().toISOString()
					}
				}).catch(err => null);
			}
		}

		if (cmd.botPermissions.length > 0 && !config.developers.includes(msg.author.username)) {
			if (cmd.userPermissions.some(perm => !msg.channel.permissionsOf(client.user.id).has(perm))) {
				const p = cmd.botPermissions.filter(perm => !msg.channel.permissionsOf(client.user.id).has(perm));
				if (!msg.channel.permissionsOf(msg.client.user.id).has("embedLinks")) return msg.reply(`I am missing some permissions to be able to run that, but I need the \`embedLinks\` permission to tell you which.`).catch(err => null);

				Logger.debug(`Shard #${msg.channel.guild.shard.id}`, `I am missing the permission(s) ${p.join(", ")} for the command ${cmd.triggers[0]}, server: ${(msg.channel as Eris.TextChannel).guild.name} (${(msg.channel as Eris.TextChannel).guild.id})`);
				return msg.channel.createMessage({
					embed: {
						title: "I do not have the required permission(s) to use this!",
						description: `I need the permission(s) **${p.join("**, **")}** for this command to function properly, please add these to me and try again.`,
						color: Colors.red,
						timestamp: new Date().toISOString()
					}
				}).catch(err => null);
			}
		}

		const c = await cmd.run.call(client, msg, cmd);

		if (c instanceof Error && c.message === "ERR_INVALID_USAGE") {
			return msg.channel.createMessage({
				embed: {
					title: ":x: Invalid Command Usage",
					fields: [
						{
							name: "Command",
							value: `${this.parent ? `${this.parent.triggers[0]} > ` : ""}${this.triggers[0]} > ${cmd.triggers[0]}`,
							inline: false
						},
						{
							name: "Usage",
							value: `\`${msg.gConfig.settings.prefix}${this.parent ? `${this.parent.triggers[0]} ` : ""}${this.triggers[0]} ${cmd.triggers[0]} ${cmd.usage}\``,
							inline: false
						},
						{
							name: "Description",
							value: cmd.description || "No Description Found.",
							inline: false
						},
						{
							name: "Category",
							value: `(subcommand) ${this.parent ? this.parent.category : "Unknown"}`,
							inline: false
						},
						{
							name: "Arguments",
							value: msg.args.length < 1 ? "NONE" : msg.args.join(" "),
							inline: false
						}
					],
					color: Colors.red,
					author: {
						name: msg.author.tag,
						icon_url: msg.author.avatarURL
					}
				}
			}).catch(err => null);
		}

		return c;
	}

	fillInSubCommands(path: string) {
		fs
			.readdirSync(path)
			.filter(f => !fs.lstatSync(`${path}/${f}`).isDirectory())
			.map(f => this.addSubCommand(require(`${path}/${f}`).default));
	}

	setParent(cmd: Command) {
		this.parent = cmd;
		return this;
	}
}
