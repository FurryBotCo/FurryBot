import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Command } from "core";
import Eris from "eris";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["lock"], __filename)
	.setBotPermissions([
		"manageChannels"
	])
	.setUserPermissions([
		"kickMembers"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		let ch: Eris.GuildTextableChannel | null = msg.channel;
		if (msg.args.length > 0) ch = await msg.getChannelFromArgs<Eris.GuildTextableChannel>();
		if (!ch) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_CHANNEL").toJSON()
		});
		const o = ch.permissionOverwrites.get(msg.channel.guild.id);
		if (o) {
			if (o.allow & Eris.Constants.Permissions.sendMessages) o.allow -= Eris.Constants.Permissions.sendMessages;
			if (o.deny & Eris.Constants.Permissions.sendMessages) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyDenied${ch.id === msg.channel.id ? "This" : "That"}`));
		}

		await ch.editPermission(msg.channel.guild.id, !o ? 0n : o.allow, !o ? Eris.Constants.Permissions.sendMessages : o.deny | Eris.Constants.Permissions.sendMessages, "role", encodeURIComponent(`Lock: ${msg.author.tag} (${msg.author.id})`));

		await this.executeModCommand("lock", {
			blame: msg.author.id,
			channel: msg.channel.id,
			target: ch.id,
			reason: null
		});

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.executed`));
	});
