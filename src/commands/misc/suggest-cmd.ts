import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import truncate from "truncate";

export default new Command({
	triggers: [
		"suggest"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 18e5,
	description: "Suggest something for the bot!",
	usage: "<suggestion>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	//return msg.reply("We are not accepting suggestions at this time.");

	let card, embed: Eris.EmbedOptions;

	if (msg.unparsedArgs.length < 1) return new Error("ERR_INVALID_USAGE");
	try {
		card = await this.tclient.addCard(msg.unparsedArgs.join(" "), `Suggestion by ${msg.author.tag} (${msg.author.id}) from guild ${msg.guild.name} (${msg.guild.id})`, config.apis.trello.list);
	} catch (e) {
		return msg.reply(`Failed to create suggestion, **${e.message}**`)
	}

	await this.tclient.addLabelToCard(card.id, config.apis.trello.labels.unapproved).catch(err => null);
	await msg.reply(`Suggestion posted!\nView it here: ${card.shortUrl}`);

	embed = {
		title: `Suggestion by ${msg.author.tag} (${msg.author.id}) from guild ${msg.guild.name} (${msg.guild.id})`,
		description: truncate(msg.unparsedArgs.join(" "), 950),
		thumbnail: {
			url: msg.author.avatarURL
		},
		fields: [
			{
				name: "Trello Card",
				value: card.shortUrl,
				inline: false
			}
		],
		timestamp: new Date().toISOString(),
		color: functions.randomColor()
	}

	return this.executeWebhook(config.webhooks.suggestion.id, config.webhooks.suggestion.token, {
		embeds: [
			embed
		],
		username: `Bot Suggestion${config.beta ? " - Beta" : ""}`,
		avatarURL: "https://i.furry.bot/furry.png"
	});
}));