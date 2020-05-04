import ExtendedMessage from "../../../modules/ExtendedMessage";
import Eris from "eris";
import db from "../../../modules/Database";
import FurryBot from "../../../main";
import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import { Colors } from "../../../util/Constants";
import UserConfig from "../../../modules/config/UserConfig";
import GuildConfig from "../../../modules/config/GuildConfig";
import { Request } from "../../../util/Functions";
import cnf from "../../";
import rClient from "../../../util/Redis";
import Command from "../../../util/CommandHandler/lib/Command";

export default ((config: typeof cnf) => {
	return [
		{
			name: "nsfw",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command | SubCommand, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);

				if (!msg.channel.nsfw) {
					await msg.reply(`this command can only be ran in nsfw channels.`, {
						file: await Request.getImageFromURL("https://assets.furry.bot/nsfw.gif"),
						name: "nsfw.gif"
					}).catch(err => null);
					throw new Error();
				}

				if (!gConfig.settings.nsfw) {
					await msg.reply(`nsfw commands are not enabled in this server. To enable them, have an administrator run \`${gConfig.settings.prefix}settings nsfw commands enabled\`.`).catch(err => null);
					throw new Error();
				}

				if (msg.channel.topic && config.yiff.disableStatements.some(t => msg.channel.topic.indexOf(t) !== -1)) {
					if (!msg.channel.permissionsOf(this.user.id).has("embedLinks")) return msg.reply(`some requirement was not met, but I need the \`embedLinks\` permission to tell you what.`).catch(err => null);
					const st = config.yiff.disableStatements.filter(t => msg.channel.topic.indexOf(t) !== -1);

					await msg.channel.createMessage({
						embed: {
							author: {
								name: msg.author.tag,
								icon_url: msg.author.avatarURL
							},
							title: "NSFW Commands Disabled",
							description: `NSFW commands have been explicitly disabled in this channel. To reenable them, remove **${st.join("**, **")}** from the channel topic.`,
							color: Colors.red,
							timestamp: new Date().toISOString()
						}
					}).catch(err => null);
					throw new Error();
				}
			})
		},
		{
			name: "helperOnly",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command | SubCommand, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);

				if (!config.helpers.includes(msg.author.id)) {
					rClient.INCR(`${config.beta ? "beta" : "prod"}:stats:helperOnlyError`);
					client.log("debug", `${msg.author.tag} (${msg.author.id}) attempted to run helper command "${cmd.triggers[0]}" in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`, `Shard #${msg.channel.guild.shard.id}`);
					await msg.reply(`you must be a helper or higher to use this command.`).catch(err => null);
					throw new Error();
				}
			})
		},
		{
			name: "devOnly",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command | SubCommand, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);

				if (!config.developers.includes(msg.author.id)) {
					rClient.INCR(`${config.beta ? "beta" : "prod"}:stats:devOnlyError`);
					client.log("debug", `${msg.author.tag} (${msg.author.id}) attempted to run developer/contributor command "${cmd.triggers[0]}" in guild ${msg.channel.guild.name} (${msg.channel.guild.id})`, `Shard #${msg.channel.guild.shard.id}`);
					await msg.reply(`you must be a developer or contributor to use this command.`).catch(err => null);
					throw new Error();
				}
			})
		},
		{
			name: "betaOnly",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command | SubCommand, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);

				if (!config.beta) throw new Error();
			})
		},
		{
			name: "donatorOnly",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command | SubCommand, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);
				if (config.developers.includes(msg.author.id)) return;
				const d = await uConfig.premiumCheck();

				if (!msg.channel.permissionsOf(this.user.id).has("embedLinks")) {
					await msg.reply(`some requirement was not met, but I need the \`embedLinks\` permission to tell you what.`).catch(err => null);
					throw new Error();
				}

				if (!d.active) {
					await msg.channel.createMessage({
						embed: {
							title: "Usage Not Allowed",
							description: `You must be a donator to use this command.\nYou can donate [here](${config.bot.patreon}).`,
							color: Colors.red,
							timestamp: new Date().toISOString(),
							author: {
								name: msg.author.tag,
								icon_url: msg.author.avatarURL
							}
						}
					});
					throw new Error();
				}
			})
		},
		{
			name: "premiumGuildOnly",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command | SubCommand, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);
				if (config.developers.includes(msg.author.id)) return;
				const d = await gConfig.premiumCheck();

				if (!msg.channel.permissionsOf(this.user.id).has("embedLinks")) {
					await msg.reply(`some requirement was not met, but I need the \`embedLinks\` permission to tell you what.`).catch(err => null);
					throw new Error();
				}

				if (!d.active) {
					await msg.channel.createMessage({
						embed: {
							title: "Usage Not Allowed",
							description: `This command can only be used in premium servers.\nYou can donate [here](${config.bot.patreon}), and can activate a premium server using \`${gConfig.settings.prefix}pserver add\`.`,
							color: Colors.red,
							timestamp: new Date().toISOString(),
							author: {
								name: msg.author.tag,
								icon_url: msg.author.avatarURL
							}
						}
					});
					throw new Error();
				}
			})
		},
		{
			name: "guildOwnerOnly",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command | SubCommand, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);
				if (msg.author.id !== msg.channel.guild.ownerID) return;

				await msg.reply("only this servers owner may use this command.").catch(err => null);
				throw new Error();
			})
		},
		{
			name: "supportOnly",
			check: (async (msg: ExtendedMessage<Eris.GuildTextableChannel>, client: FurryBot, cmd: Command | SubCommand, uConfig?: UserConfig, gConfig?: GuildConfig) => {
				if (!uConfig) uConfig = await db.getUser(msg.author.id);
				if (!gConfig) gConfig = await db.getGuild(msg.channel.guild.id);
				if (msg.channel.guild.id !== msg.channel.guild.ownerID) {
					await msg.reply("this command may only be ran in my support server.").catch(err => null);
					throw new Error();
				}
			})
		}
	];
});
