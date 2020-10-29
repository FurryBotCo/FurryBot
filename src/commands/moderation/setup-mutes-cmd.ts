import Eris from "eris";
import Command from "../../util/cmd/Command";
import Language from "../../util/Language";
import Logger from "../../util/Logger";

export default new Command(["setup-mutes"], __filename)
	.setBotPermissions([
		"embedLinks",
		"banMembers"
	])
	.setUserPermissions([
		"kickMembers",
		"manageChannels"
	])
	.setRestrictions([])
	.setCooldown(1.5e4, true)
	.setExecutor(async function (msg, cmd) {
		if (!msg.gConfig.settings.muteRole) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noRole`, [msg.gConfig.settings.prefix]));
		const e = await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.confirm`, [msg.channel.guild.channels.size]));
		const m = await this.col.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id, 1);
		await m.delete().catch(err => null);
		if (!m?.content || !["yes", "y"].includes(m.content.toLowerCase())) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.canceled`));
		await e.edit(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.inProgress`, [msg.channel.guild.channels.size]));
		for (const [, ch] of msg.channel.guild.channels) {
			try {
				const a = ch.permissionOverwrites.get(msg.channel.guild.id);
				const b = ch.permissionOverwrites.get(msg.gConfig.settings.muteRole);
				if (a && a.allow & Eris.Constants.Permissions.sendMessages) await ch.editPermission(msg.channel.guild.id, a.allow - Eris.Constants.Permissions.sendMessages, a.deny, "role", `Setup-Mutes: ${msg.author.tag}`);
				if (b && b.allow & Eris.Constants.Permissions.sendMessages) b.allow -= Eris.Constants.Permissions.sendMessages;
				if (b && !(b.deny & Eris.Constants.Permissions.sendMessages)) b.deny += Eris.Constants.Permissions.sendMessages;
				await ch.editPermission(msg.gConfig.settings.muteRole, b?.allow || 0, b?.deny || Eris.Constants.Permissions.sendMessages, "role", `Setup-Mutes: ${msg.author.tag}`);
			} catch (e) {
				Logger.error(`SetupMutes[${msg.channel.guild.id}/${msg.author.id}]`, e);
			}
		}

		await e.edit(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`, [msg.channel.guild.channels.size]));
	});
