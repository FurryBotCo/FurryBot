import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import { FurryBotAPI } from "../../modules/External";
import config from "../../config";
import { JSONResponse } from "furrybotapi/build/src/typings";

export default new Command({
	triggers: [
		"yiff"
	],
	permissions: {
		user: [],
		bot: [
			"attachFiles",
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [
		"nsfw"
	],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	let type, content = "";
	if (msg.args.length === 0) {
		for (const ytype of config.yiffTypes) {
			if (msg.channel.name.indexOf(ytype) !== -1) type = ytype;
		}

		if (!type) {
			type = gConfig.settings.defaultYiff;
			if (!config.yiffTypes.includes(type)) {
				await gConfig.edit({
					settings: {
						defaultYiff: config.yiffTypes[0]
					}
				});
				content = `The default type "${gConfig.settings.defaultYiff}" set by this servers settings is invalid, is has been changed to the config set default "${config.yiffTypes[0]}".`;
			}
			/*if (!this.yiffNoticeViewed.has(msg.channel.guild.id)) {
				this.yiffNoticeViewed.add(msg.channel.guild.id);
				content = `Showing default yiff type **${type}**\nTo change this, add one of these values somewhere in the channel __name__: **${config.yiff.types.join("**, **")}**.\n\n`;
			}*/
		}

	} else {
		type = msg.args.join(" ");
		if (!config.yiffTypes.includes(type)) return msg.channel.createMessage({
			embed: {
				title: "Invalid yiff type",
				description: `The type you provided **${type}** is invalid, valid types are: **${config.yiffTypes.join("**, **")}**.`,
				timestamp: new Date().toISOString(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				color: Math.floor(Math.random() * 0xFFFFFF)
			}
		});
	}
	const img = await FurryBotAPI.furry.yiff[type]("json", 1) as JSONResponse;

	return msg.channel.createMessage({
		content,
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setDescription(`{lang:other.words.shortURL}: <${img.shorturl}>`)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTitle(`{lang:commands.nsfw.yiff.title.${type}}`)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.setImage(img.url)
			.setFooter("{lang:other.poweredBy.furrybot}")
			.toJSON()
	}).catch(err => null);
}));
