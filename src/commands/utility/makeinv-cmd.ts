import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import { Colors } from "../../util/Constants";

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
	description: "Generates a unique invite to a channel.",
	usage: "[channel] [--temporary=true/false/-t] [--maxAge=0] [--maxUses=0]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length === 0) return msg.channel.createMessage({
		embed: {
			title: "Command Help",
			description: [
				`As this command is a little complex in design, we have some extra help emplyed here`,
				`Some example usages:`,
				`Temporary invite: \`${msg.gConfig.settings.prefix}makeinv -t\``,
				`Max Age: \`${msg.gConfig.settings.prefix}makeinv --maxAge=<seconds>\``,
				`Max Uses: \`${msg.gConfig.settings.prefix}makeinv --maxUses=<number>\``
			].join("\n"),
			timestamp: new Date().toISOString(),
			color: Colors.red
		}
	});

	const a = msg.dashedArgs.parsed;
	// add store channel when eris fixes their stuff
	let ch: Eris.TextChannel | Eris.NewsChannel | Eris.VoiceChannel;
	if (msg.args.length > 0) ch = await msg.getChannelFromArgs<typeof ch>();
	else ch = msg.channel;

	if (!ch) ch = msg.channel;

	const inv = await ch.createInvite({
		unique: true,
		temporary: a.value.includes("t"),
		maxAge: Object.keys(a.keyValue).includes("maxAge") ? Number(a.keyValue.maxAge) : 0,
		maxUses: Object.keys(a.keyValue).includes("maxUses") ? Number(a.keyValue.maxUses) : 0
	});

	return msg.channel.createMessage({
		embed: {
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			title: "Invite Created",
			description: [
				`Code: [${inv.code}](https://discord.gg/${inv.code})`,
				`Temporary: ${inv.temporary ? "Yes" : "No"}`,
				`Max Age: ${inv.maxAge || "None"}`,
				`Max Uses: ${inv.maxUses || "None"}`,
				`Channel: <#${inv.channel.id}>`
			].join("\n"),
			timestamp: new Date().toISOString(),
			color: Colors.green
		}
	});
}));
