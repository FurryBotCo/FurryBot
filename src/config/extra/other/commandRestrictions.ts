import ExtendedMessage from "../../../modules/ExtendedMessage";
import Eris from "eris";
import db from "../../../modules/Database";
import FurryBot from "../../../main";
import { Colors } from "../../../util/Constants";
import UserConfig from "../../../modules/config/UserConfig";
import GuildConfig from "../../../modules/config/GuildConfig";
import { Request } from "../../../util/Functions";
import cnf from "../../";
import { Redis } from "../../../modules/External";
import Command from "../../../modules/CommandHandler/Command";

export class RestrictionError extends Error {
	restriction: string;
	err: string;
	constructor(restriction: string, err: string) {
		super();
		this.name = "RestrictionError";
		this.restriction = restriction;
		this.err = err;
	}
}

export default ((config: typeof cnf) => {
	return [
		{
			name: "nsfw",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);

				if (!msg.channel.nsfw) {
					await msg.reply(`this command can only be ran in nsfw channels.`, {
						file: await Request.getImageFromURL(config.images.nsfw),
						name: "nsfw.gif"
					}).catch(err => null);
					throw new RestrictionError("NSFW", "NSFW_CHANNEL_ONLY");
				}

				if (!gConfig.settings.nsfw) {
					await msg.reply(`nsfw commands are not enabled in this server. To enable them, have an administrator run \`${gConfig.settings.prefix}settings nsfw commands enabled\`.`).catch(err => null);
					throw new RestrictionError("NSFW", "NSFW_NOT_ENABLED");
				}
			})
		},
		{
			name: "developer",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);

				if (!config.developers.includes(msg.author.id)) {
					Redis.INCR(`${config.beta ? "beta" : "prod"}:stats:restrictions:developer`);
					client.log("debug", `${msg.author.tag} (${msg.author.id}) attempted to run developer/contributor command "${cmd.triggers[0]}" in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`, `Shard #${msg.channel.guild.shard.id}`);
					await msg.reply(`you must be a developer to use this command.`).catch(err => null);
					throw new RestrictionError("DEVELOPER", "NOT_A_DEVELOPER");
				}
			})
		},
		{
			name: "contributor",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);

				if (!config.contributors.includes(msg.author.id)) {
					Redis.INCR(`${config.beta ? "beta" : "prod"}:stats:restrictions:contributor`);
					client.log("debug", `${msg.author.tag} (${msg.author.id}) attempted to run developer/contributor command "${cmd.triggers[0]}" in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`, `Shard #${msg.channel.guild.shard.id}`);
					await msg.reply(`you must be at least a contributor to use this command.`).catch(err => null);
					throw new RestrictionError("CONTRIBUTOR", "NOT_A_CONTRIBUTOR");
				}
			})
		},
		{
			name: "helper",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);

				if (!config.helpers.includes(msg.author.id)) {
					Redis.INCR(`${config.beta ? "beta" : "prod"}:restrictions:helper`);
					client.log("debug", `${msg.author.tag} (${msg.author.id}) attempted to run helper command "${cmd.triggers[0]}" in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`, `Shard #${msg.channel.guild.shard.id}`);
					await msg.reply(`you must be a helper or higher to use this command.`).catch(err => null);
					throw new RestrictionError("HELPER", "NOT_A_HELPER");
				}
			})
		},
		{
			name: "beta",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);

				if (!config.beta) throw new RestrictionError("BETA", "NOT_BETA");
			})
		},
		{
			name: "donator",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);
				if (config.developers.includes(msg.author.id)) return;
				const d = await uConfig.premiumCheck();

				if (!msg.channel.permissionsOf(this.user.id).has("embedLinks")) {
					await msg.reply(`some requirement was not met, but I need the \`embedLinks\` permission to tell you what.`).catch(err => null);
					throw new RestrictionError("DONATOR", "EMBED_LINKS_MISSING");
				}

				if (!d.active) {
					await msg.channel.createMessage({
						embed: {
							title: "Usage Not Allowed",
							description: `You must be a donator to use this command.\nYou can donate [here](${config.client.socials.patreon}).`,
							color: Colors.red,
							timestamp: new Date().toISOString(),
							author: {
								name: msg.author.tag,
								icon_url: msg.author.avatarURL
							}
						}
					});
					throw new RestrictionError("DONATOR", "NOT_A_DONATOR");
				}
			})
		},
		{
			name: "premiumServer",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);
				if (config.developers.includes(msg.author.id)) return;
				const d = await gConfig.premiumCheck();

				if (!msg.channel.permissionsOf(this.user.id).has("embedLinks")) {
					await msg.reply(`some requirement was not met, but I need the \`embedLinks\` permission to tell you what.`).catch(err => null);
					throw new RestrictionError("PREMIUM", "EMBED_LINKS_MISSING");
				}

				if (!d.active) {
					await msg.channel.createMessage({
						embed: {
							title: "Usage Not Allowed",
							description: `This command can only be used in premium servers.\nYou can donate [here](${config.client.socials.patreon}), and can activate a premium server using \`${gConfig.settings.prefix}pserver add\`.`,
							color: Colors.red,
							timestamp: new Date().toISOString(),
							author: {
								name: msg.author.tag,
								icon_url: msg.author.avatarURL
							}
						}
					});
					throw new RestrictionError("PREMIUM", "NOT_PREMIUM_SERVER");
				}
			})
		},
		{
			name: "guildOwner",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);
				if (msg.author.id !== msg.channel.guild.ownerID) return;

				await msg.reply("only this servers owner may use this command.").catch(err => null);
				throw new RestrictionError("GUILD_OWNER", "NOT_GUILD_OWNER");
			})
		},
		{
			name: "supportServer",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);
				if (msg.channel.guild.id !== msg.channel.guild.ownerID) {
					await msg.reply("this command may only be ran in my support server.").catch(err => null);
					throw new RestrictionError("SUPPORT_SERVER", "NOT_SUPPORT_SERVER");
				}
			})
		}
	];
});
