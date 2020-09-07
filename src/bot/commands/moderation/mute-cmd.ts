import Command from "../../../util/cmd/Command";
import Language from "../../../util/Language";
import Eris from "eris";
import EmbedBuilder from "../../../util/EmbedBuilder";
import Utility from "../../../util/Functions/Utility";
import { Colors } from "../../../util/Constants";
import CommandError from "../../../util/cmd/CommandError";
import Time from "../../../util/Functions/Time";
import parseTime from "parse-duration";
import Logger from "../../../util/Logger";

export default new Command(["mute"], __filename)
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
		const a = [...msg.args];
		let time = 0, m: Eris.Message;
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


		const c = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.bot.user.id), msg.channel.guild.roles.get(msg.gConfig.settings.muteRole));
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
				.setDescription(`{lang:${cmd.lang}.alreadyMutedDesc|${member.username}#${member.discriminator}|${msg.prefix}}`)
				.setColor(Colors.red)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString()).toJSON()
		});

		if (msg.args.length >= 2) {
			try {
				time = parseTime(msg.args[1], "ms");
				if (time) a.splice(1, 1);
				else time = 0;
				msg.args = a;
			}
			catch (e) {
				if (e instanceof Error) {// for typings, catch clause cannot be annotated (TS1196)
					if (e.name !== "ERR_INVALID_FORMAT") throw e; // rethrow the error if it's not what we expect

					return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.invalidTime"));
				}
			}
		}

		if (member.id === msg.member.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSelf`));
		const b = Utility.compareMembers(member, msg.member);
		if ((b.member2.higher || b.member2.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noMuteOther`, [`${member.username}#${member.discriminator}`]));
		// if (user.permissions.has("administrator")) return msg.channel.createMessage(`<@!${msg.author.id}>, That user has the \`ADMINISTRATOR\` permission, that would literally do nothing.`);
		const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
		if (!member.bot) m = await member.user.getDMChannel().then(dm => dm.createMessage(`${Language.get(msg.gConfig.settings.lang, `other.dm.mute${time === 0 ? "Permanent" : ""}`, [Time.ms(time, true), msg.channel.guild.name, reason])}\n\n${Language.get(msg.gConfig.settings.lang, "other.dm.notice")}`)).catch(err => null);

		await member.addRole(msg.gConfig.settings.muteRole, `Mute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
			await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.muted`, [`${member.username}#${member.discriminator}`, reason])}***`).catch(noerr => null);
			await this.m.createMuteEntry(msg.channel, msg.author, member, time, reason);
			if (time !== 0) await this.t.addEntry("mute", time, Date.now() + time, member.id, msg.channel.guild.id, reason);
		}).catch(async (err) => {
			if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.englishOnly`));
			else {
				Logger.error("Mute Command", err);
				await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.couldNotMute`, [`${member.username}#${member.discriminator}`, err]));

				await m.delete();
			}
		});
		if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) msg.delete().catch(error => null);
	});
