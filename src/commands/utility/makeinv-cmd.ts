import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"makeinv"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [
		"createInstantInvite"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length === 0) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.utility.makeinv.helpTitle}")
			.setDescription([
				`{lang:commands.utility.makeinv.helpDesc}`,
				`{lang:commands.utility.makeinv.helpUsage:`,
				`{lang:commands.utility.makeinv.temp: \`${gConfig.settings.prefix}makeinv -t\``,
				`{lang:commands.utility.makeinv.maxAge}: \`${gConfig.settings.prefix}makeinv --maxAge=<seconds>\``,
				`{lang:commands.utility.makeinv.maxUses}: \`${gConfig.settings.prefix}makeinv --maxUses=<number>\``
			].join("\n"))
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.red)
	});

	const a = msg.dashedArgs.parsed;
	let ch: Eris.GuildTextableChannel;
	if (msg.args.length > 0) ch = await msg.getChannelFromArgs();
	else ch = msg.channel;

	if (!ch) ch = msg.channel;

	const inv = await ch.createInvite({
		unique: true,
		temporary: a.value.includes("t"),
		maxAge: Object.keys(a.keyValue).includes("maxAge") ? Number(a.keyValue.maxAge) : 0,
		maxUses: Object.keys(a.keyValue).includes("maxUses") ? Number(a.keyValue.maxUses) : 0
	});

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTitle("{lang:commands.utility.makeinv.created}")
			.setDescription([
				`{lang:commands.utility.makeinv.code}: [${inv.code}](https://discord.gg/${inv.code})`,
				`{lang:commands.utility.makeinv.temporary}: ${inv.temporary ? "{lang:commands.utility.makeinv.yes}" : "{lang:commands.utility.makeinv.no}"}`,
				`{lang:commands.utility.makeinv.maxAge}: ${inv.maxAge || "{lang:commands.utility.makeinv.none}"}`,
				`{lang:commands.utility.makeinv.maxUses}: ${inv.maxUses || "{lang:commands.utility.makeinv.none}"}`,
				`{lang:commands.utility.makeinv.channel}: <#${inv.channel.id}>`
			].join("\n"))
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.green)
	});
}));
