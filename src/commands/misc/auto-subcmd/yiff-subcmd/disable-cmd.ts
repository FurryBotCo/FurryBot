import SubCommand from "../../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../../config";
import { mdb } from "../../../../modules/Database";

export default new SubCommand({
	triggers: [
		"disable"
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
	description: "Disable automated posting of yiff in a channel.",
	usage: "<gay/straight/lesbian/dickgirl>",
	features: ["nsfw", "premiumGuildOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");

	if (!config.yiff.types.includes(msg.args[0].toLowerCase())) return msg.reply(`invalid yiff type **${msg.args[0].toLowerCase()}**, valid types: **${config.yiff.types.join("**, **")}**.`);

	if (!msg.gConfig.auto.filter(k => k.type.toLowerCase() === "yiff").map(t => t.cat.toLowerCase()).includes(msg.args[0].toLowerCase())) return msg.reply(`it doesn't seem like **${msg.args[0].toLowerCase}** is activated anywhere in this server.`);

	const w = msg.gConfig.auto.find(k => k.type.toLowerCase() === "yiff" && k.cat.toLowerCase() === msg.args[0].toLowerCase()).webhook;

	await this.deleteWebhook(w.id, w.token);

	await mdb.collection("guilds").findOneAndUpdate({
		id: msg.channel.guild.id
	}, {
		$pull: {
			auto: {
				type: "yiff",
				cat: msg.args[0].toLowerCase()
			}
		}
	});

	return msg.reply(`disabled auto yiff of **${msg.args[0].toLowerCase()}**.`);
}));
