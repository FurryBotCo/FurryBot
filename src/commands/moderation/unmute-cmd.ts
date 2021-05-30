import GuildConfig, { DBKeys } from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Command, EmbedBuilder, CommandError, Colors } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["unmute"], __filename)
	.setBotPermissions([
		"embedLinks",
		"manageMessages",
		"manageRoles"
	])
	.setUserPermissions([
		"manageRoles"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);
		const [, ...r] = msg.args;
		const member = await msg.getMemberFromArgs();
		if (!member) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});

		if (!msg.gConfig.settings.muteRole) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.noRole}`)
				.setDescription(`{lang:${cmd.lang}.noRoleDesc|${msg.prefix}}`)
				.setColor(Colors.red)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});

		if (!msg.channel.guild.roles.has(msg.gConfig.settings.muteRole)) {
			await msg.gConfig.edit<DBKeys>({ modlog: { muteRole: null } });
			return msg.channel.createMessage({
				embed: new EmbedBuilder(msg.gConfig.settings.lang)
					.setTitle(`{lang:${cmd.lang}.roleNotFound}`)
					.setDescription(`{lang:${cmd.lang}.roleNotFoundDesc|${msg.gConfig.settings.muteRole}|${msg.gConfig.settings.muteRole}|${msg.prefix}}`)
					.setColor(Colors.red)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTimestamp(new Date().toISOString())
					.toJSON()
			});
		}


		const c = BotFunctions.compareMemberWithRole(msg.channel.guild.members.get(this.client.user.id)!, msg.channel.guild.roles.get(msg.gConfig.settings.muteRole)!);
		if (c.same || c.lower) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.invalidRole}`)
				.setDescription(`{lang:${cmd.lang}.invalidRoleDesc|${msg.gConfig.settings.muteRole}|${msg.gConfig.settings.muteRole}|${msg.prefix}}`)
				.setColor(Colors.red)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});

		if (!member.roles.includes(msg.gConfig.settings.muteRole)) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.notMuted}`)
				.setDescription(`{lang:${cmd.lang}.notMutedDesc|${member.tag}|${msg.prefix}}`)
				.setColor(Colors.red)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString()).toJSON()
		});

		const reason = (r ?? []).join(" ") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
		await member.removeRole(msg.gConfig.settings.muteRole, `Unmute: ${msg.author.tag} (${msg.author.id}) -> ${reason}`).then(async () => {
			await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unmuted`, [member.tag, reason])}***`).catch(() => null);
			await this.executeModCommand("unmute", {
				target: member.id,
				reason,
				channel: msg.channel.id,
				blame: msg.author.id
			});
		}).catch(async (err) => {
			if (err instanceof Error) {
				if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.englishOnly`));
				else await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.couldNotMute`, [member.tag, `${err.name}: ${err.message}`]));
			}
		});
		if (msg.channel.permissionsOf(this.client.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(() => null);
	});
