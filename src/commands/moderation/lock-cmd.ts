import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import Eris from "eris";
import { Utility } from "../../util/Functions";
import config from "../../config";
import Language from "../../util/Language";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"lock"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [
		"manageChannels"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	let ch = msg.channel;
	if (msg.args.length > 0) ch = await msg.getChannelFromArgs();
	if (!ch) return msg.errorEmbed("INVALID_CHANNEL");
	const o = ch.permissionOverwrites.get(msg.channel.guild.id);
	if (![undefined, null].includes(o)) {
		if (o.allow & 2048) o.allow -= 2048;
		if (o.deny & 2048) return msg.reply(ch.id === msg.channel.id ? "{lang:commands.moderation.lock.alreadyDeniedThis}" : "{lang:commands.moderation.lock.alreadyDeniedThat}");
	}

	await ch.editPermission(msg.channel.guild.id, !o ? 0 : o.allow, !o ? 2048 : o.deny + 2048, "role");

	await this.m.create(msg.channel, {
		type: "lock",
		target: ch,
		blame: msg.author
	});

	return msg.reply(`{lang:commands.moderation.lock.executed}`);
}));
