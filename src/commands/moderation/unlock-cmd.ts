import Command from "../../util/cmd/Command";
import Language from "../../util/Language";
import Utility from "../../util/Functions/Utility";

export default new Command(["unlock"], __filename)
	.setBotPermissions([
		"kickMembers"
	])
	.setUserPermissions([
		"manageChannels"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		let ch = msg.channel;
		if (msg.args.length > 0) ch = await msg.getChannelFromArgs();
		if (!ch) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_CHANNEL").toJSON()
		});
		const o = ch.permissionOverwrites.get(msg.channel.guild.id);
		if (o.allow & 2048 || !(o.deny & 2048)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.unlock.${ch.id === msg.channel.id ? "this" : "that"}NotLocked`));
		if (o.deny & 2048) o.deny -= 2048;

		await ch.editPermission(msg.channel.guild.id, o.allow, o.deny, "role", encodeURIComponent(`Unlock: ${msg.author.tag} (${msg.author.id})`));

		await this.m.createUnlockEntry(msg.channel, msg.gConfig, msg.author, ch);

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.removed`));
	});
