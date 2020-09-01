import Command from "../../../util/cmd/Command";
import Language from "../../../util/Language";
import Utility from "../../../util/Functions/Utility";

export default new Command(["lock"], __filename)
	.setBotPermissions([
		"kickMembers"
	])
	.setUserPermissions([
		"manageChannels"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		let ch = msg.channel;
		if (msg.args.length > 0) ch = await msg.getChannelFromArgs();
		if (!ch) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_CHANNEL").toJSON()
		});
		const o = ch.permissionOverwrites.get(msg.channel.guild.id);
		if (![undefined, null].includes(o)) {
			if (o.allow & 2048) o.allow -= 2048;
			if (o.deny & 2048) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyDenied${ch.id === msg.channel.id ? "This" : "That"}`));
		}

		await ch.editPermission(msg.channel.guild.id, !o ? 0 : o.allow, !o ? 2048 : o.deny + 2048, "role");

		await this.m.createLockEntry(msg.channel, msg.author, ch);

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.executed`));
	});
