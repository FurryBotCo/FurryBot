import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Strings } from "../../util/Functions";
import Eris from "eris";

export default new Command({
	triggers: [
		"bap"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Bap someone! Ouch!",
	usage: "<@member/text>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");

	const r = Math.floor(Math.random() * 100);

	const rand = msg.channel.guild.members.filter(m => m.id !== msg.author.id);
	const l = [
		`<@!${msg.author.id}> smacks ${msg.args.join(" ")} hard on the snoot with a rolled up news paper!`,
		`<@!${msg.author.id}> goes to smack ${msg.args.join(" ")} on the snoot with a news paper, but missed and hit themselves!`,
		`<@!${msg.author.id}> goes to smack ${msg.args.join(" ")} on the snoot with a news paper, but missed and hit <@!${rand[Math.floor(Math.random() * rand.length)].id}>!`
	];
	let str: string;

	if (r <= 35) str = l[0];
	else if (r > 35 && r <= 70) str = l[1];
	else if (r > 70) str = l[2];

	return msg
		.channel
		.createMessage({
			embed: {
				description: str,
				image: {
					url: "https://assets.furry.bot/bap.gif"
				},
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				timestamp: new Date().toISOString(),
				color: Math.floor(Math.random() * 0xFFFFFF)
			}
		});
}));
