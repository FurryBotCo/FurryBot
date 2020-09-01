import Command from "../../../util/cmd/Command";
import Language from "../../../util/Language";
import CommandError from "../../../util/cmd/CommandError";
import { mdb } from "../../../util/Database";
import Utility from "../../../util/Functions/Utility";

export default new Command(["warn"], __filename)
	.setBotPermissions([
		"embedLinks",
		"manageMessages"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 2) throw new CommandError("ERR_INVALID_USAGE", cmd);
		const member = await msg.getMemberFromArgs();

		if (!member) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});

		const reason = msg.args.length > 1 ? msg.args.slice(1).join(" ") : Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
		if (reason.length > 100) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.reasonTooLong`));
		const id = await msg.gConfig.getWarningId(member.id);
		const w = await mdb.collection<Warning>("warnings").insertOne({
			blameId: msg.author.id,
			guildId: msg.channel.guild.id,
			userId: member.id,
			id,
			reason,
			date: Date.now()
		});


		if (!member.bot) await member.user.getDMChannel().then(dm => dm.createMessage(`${Language.get(msg.gConfig.settings.lang, "other.dm.warn", [msg.channel.guild.name, reason])}\n\n${Language.get(msg.gConfig.settings.lang, "other.dm.notice")}`)).catch(err => null);
		await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.warned`, [`${member.username}#${member.discriminator}`, reason])}***`).then(async () => {
			await this.m.createWarnEntry(msg.channel, msg.author, member, id, reason);
		});

		if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(error => null);
	});
