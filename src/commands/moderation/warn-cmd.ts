import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import db from "../../../src/db";
import { Warning } from "../../util/@types/Database";
import { BotFunctions, Command, CommandError } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["warn"], __filename)
	.setBotPermissions([
		"embedLinks",
		"manageMessages"
	])
	.setUserPermissions([
		"kickMembers"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 2) throw new CommandError("INVALID_USAGE", cmd);
		const member = await msg.getMemberFromArgs();

		if (!member) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});

		const reason = msg.args.length > 1 ? msg.args.slice(1).join(" ") : Language.get(msg.gConfig.settings.lang, "other.modlog.noReason");
		if (reason.length > 100) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.reasonTooLong`));
		const id = await msg.gConfig.getWarningId(member.id);
		await db.collection<Warning>("warnings").insertOne({
			blameId: msg.author.id,
			guildId: msg.channel.guild.id,
			userId: member.id,
			id,
			reason,
			date: Date.now()
		});


		if (!member.bot) await member.user.getDMChannel().then(dm => dm.createMessage(`${Language.get(msg.gConfig.settings.lang, "other.dm.warn", [msg.channel.guild.name, reason])}\n\n${Language.get(msg.gConfig.settings.lang, "other.dm.notice")}`)).catch(() => null);
		await msg.channel.createMessage(`***${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.warned`, [`${member.username}#${member.discriminator}`, reason])}***`).then(async () => {
			await this.executeModCommand("warning", {
				reason,
				id,
				target: member.id,
				blame: msg.author.id,
				channel: msg.channel.id
			});
		});

		if (msg.channel.permissionsOf(this.client.user.id).has("manageMessages") && msg.gConfig.settings.deleteModCommands) await msg.delete().catch(() => null);
	});
