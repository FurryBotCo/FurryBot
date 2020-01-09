import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";
import truncate from "truncate";

export default new Command({
	triggers: [
		"suggest"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 18e5,
	donatorCooldown: 18e5,
	description: "Suggest something for me!",
	usage: "<suggestion>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	if (msg.args.length < 1 || msg.args.join(" ").length === 0) return msg.reply("please provide something to suggest.");
	const m = await this.executeWebhook(config.webhooks.suggestion.id, config.webhooks.suggestion.token, {
		embeds: [
			{
				title: `Suggestion by ${msg.author.tag} from guild ${msg.guild.name}`,
				description: `${truncate(msg.unparsedArgs.join(" "), 950)}`,
				thumbnail: {
					url: msg.author.avatarURL
				},
				timestamp: new Date().toISOString(),
				color: this.f.randomColor(),
				footer: {
					text: `User ID: ${msg.author.id} | Guild ID: ${msg.channel.guild.id}`
				}
			}
		],
		username: `Bot Suggestion${config.beta ? " - Beta" : ""}`,
		avatarURL: "https://i.furry.bot/furry.png",
		wait: true
	});
	try {
		await m.addReaction(config.emojis.upvote);
		await m.addReaction(config.emojis.downvote);
	} catch (e) { }
	return msg.channel.createMessage({
		embed: {
			title: "Suggestion Posted!",
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			description: `Your suggestion was posted! You can view it [here](https://discord.gg/CQMx76B).`,
			timestamp: new Date().toISOString(),
			color: this.f.randomColor()
		}
	});
}));
