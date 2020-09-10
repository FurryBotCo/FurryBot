import Command from "../../../util/cmd/Command";
import Language from "../../../util/Language";
import EmbedBuilder from "../../../util/EmbedBuilder";
import Utility from "../../../util/Functions/Utility";
import { Colors } from "../../../util/Constants";
import CommandError from "../../../util/cmd/CommandError";
import parseTime from "parse-duration";
import Logger from "../../../util/Logger";

export default new Command(["unmute"], __filename)
	.setBotPermissions([
		"manageMessages"
	])
	.setUserPermissions([
		"manageRoles"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) throw new CommandError("ERR_INVALID_USAGE", cmd);
		// get member from message
		const member = await msg.getMemberFromArgs();

		if (!member) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER").toJSON()
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
			await msg.gConfig.edit({ settings: { muteRole: null } }).then(d => d.reload());
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


		const a = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.bot.user.id), msg.channel.guild.roles.get(msg.gConfig.settings.muteRole));
		if (a.same || a.lower) return msg.channel.createMessage({
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
				.setDescription(`{lang:${cmd.lang}.notMutedDesc|${member.username}#${member.discriminator}|${msg.prefix}}`)
				.setColor(Colors.red)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString()).toJSON()
		});

		if (member.id === msg.member.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSelf`));
		const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");

		await member.removeRole(msg.gConfig.settings.muteRole, `Unmute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
			await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unmuted`, [`${member.username}#${member.discriminator}`, reason])}***`).catch(noerr => null);
			await this.m.createUnmuteEntry(msg.channel, msg.gConfig, msg.author, member, reason);
		}).catch(async (err) => {
			if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.englishOnly`));
			else {
				Logger.error("Unmute Command", err);
				await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.couldNotUnmute`, [`${member.username}#${member.discriminator}`, err]));
			}
		});
		if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) msg.delete().catch(error => null);
	});
