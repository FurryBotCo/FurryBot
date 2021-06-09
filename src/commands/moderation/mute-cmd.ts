import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Command, EmbedBuilder, CommandError, Colors } from "core";
import Language from "language";
import { Time } from "utilities";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["mute", "m"], __filename)
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
		const [args, t] = msg.args.join(" ").split("|").map(v => v.trim());
		const [, ...r] = args.split(" ");
		const noDM = msg.dashedArgs.value.includes("no-dm");
		let time = 0;

		if (t) time = Time.parseTime2(t);
		// 5 years max
		if (time === undefined || time < 0 || time > 1.577e+11) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.invalidTime"));

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
			await msg.gConfig.edit({ "settings.muteRole": null });
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

		if (member.roles.includes(msg.gConfig.settings.muteRole)) return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.alreadyMuted}`)
				.setDescription(`{lang:${cmd.lang}.alreadyMutedDesc|${member.tag}|${msg.prefix}}`)
				.setColor(Colors.red)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString()).toJSON()
		});

		let m: Eris.Message | null = null;
		const reason = (r ?? []).join(" ") || Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
		if (!noDM && !member.bot) m = await member.user.getDMChannel().then(dm => dm.createMessage(`${Language.get(msg.gConfig.settings.lang, `other.dm.mute${!time ? "Permanent" : ""}`, [Time.ms(time, true), msg.channel.guild.name, reason])}\n\n${Language.get(msg.gConfig.settings.lang, "other.dm.notice")}`)).catch(() => null);
		await member.addRole(msg.gConfig.settings.muteRole, `Mute: ${msg.author.tag} (${msg.author.id}) -> ${reason}`).then(async () => {
			await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.muted${!time ? "" : "Timed"}`, [member.tag, Time.ms(time, true), reason])}***`).catch(() => null);
			await this.executeModCommand("mute", {
				target: member.id,
				expiry: time,
				reason,
				channel: msg.channel.id,
				blame: msg.author.id
			});
			if (time) await this.executeModCommand("timedAction", {
				subType: "mute",
				time,
				expiry: Date.now() + time,
				user: member.id,
				guild: msg.channel.guild.id,
				reason
			});
		}).catch(async (err) => {
			if (err instanceof Error) {
				if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.englishOnly`));
				else await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.couldNotMute`, [member.tag, `${err.name}: ${err.message}`]));
				if (m !== null) await m.delete();
			}
		});
		if (msg.channel.permissionsOf(this.client.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(() => null);
	});
