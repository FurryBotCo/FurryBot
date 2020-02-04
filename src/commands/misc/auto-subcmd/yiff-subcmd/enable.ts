import SubCommand from "../../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../../config";
import { Colors } from "../../../../util/Constants";
import { mdb } from "../../../../modules/Database";
import { Strings, Time, Request } from "../../../../util/Functions";
import Eris from "eris";

export default new SubCommand({
	triggers: [
		"enable"
	],
	userPermissions: [
		"manageChannels",
		"manageGuild"
	],
	botPermissions: [
		"attachFiles",
		"embedLinks",
		"manageWebhooks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Activate automated posting of yiff in a channel.",
	usage: "<gay/straight/lesbian/dickgirl> <5m/10m/15m/30m/60m>",
	features: ["nsfw", "premiumGuildOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");

	if (!config.yiff.types.includes(msg.args[0].toLowerCase())) return msg.reply(`invalid yiff type "${msg.args[0].toLowerCase()}", valid types: **${config.yiff.types.join("**, **")}**.`);

	let time: number;
	switch (msg.args[1].toLowerCase()) {
		case "5m": time = 5; break;
		case "10m": time = 10; break;
		case "15m": time = 15; break;
		case "30m": time = 30; break;
		case "60m": time = 60; break;
		default: return msg.reply(`invalid time, valid times: **5m**, **10m**, **15m**, **30m**, **60m**.`);
	}

	if (msg.gConfig.auto.filter(k => k.type.toLowerCase() === "yiff").map(k => k.cat.toLowerCase()).includes(msg.args[0].toLowerCase())) return msg.channel.createMessage({
		embed: {
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			timestamp: new Date().toISOString(),
			color: Colors.red,
			description: `You may only have one (1) of each type of auto yiff active across a server.\nTo disable one, you can use \`${msg.gConfig.settings.prefix}auto yiff disable <type>\``
		}
	});

	const w: Eris.Webhook = await msg.channel.createWebhook({
		name: `Auto Yiff: ${Strings.ucwords(msg.args[0].toLowerCase())}`,
		// images have to be provided as base64 data urls in this
		avatar: `data:image/jpeg;base64,${await Request.getImageFromURL("https://i.furry.bot/furry.png").then(r => r.toString("base64"))}`
	}).catch(err => null);

	if (!w) return msg.reply(`failed to create webhook, check my permissions.`);

	await mdb.collection("guilds").findOneAndUpdate({
		id: msg.channel.guild.id
	}, {
		$push: {
			auto: {
				cat: msg.args[0].toLowerCase(),
				type: "yiff",
				channelId: w.channel_id,
				webhook: {
					id: w.id,
					token: w.token
				},
				time
			}
		}
	});

	return msg.reply(`enabled auto yiff of the type "${msg.args[0].toLowerCase()}" in the channel <#${w.channel_id}> with the interval ${Time.ms(time * 6e4, true)}.\nTo disable this, run \`${msg.gConfig.settings.prefix}auto yiff disable ${msg.args[0].toLowerCase()}\``);
}));
