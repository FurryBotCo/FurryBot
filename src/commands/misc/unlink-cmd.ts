import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import config from "../../config";
import chunk from "chunk";
import { Redis } from "../../modules/External";
import { Internal } from "../../util/Functions";

export default new Command({
	triggers: [
		"unlink"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const p = uConfig.socials.find(s => s.type === "patreon");

	if (!p) return msg.reply(`{lang:commands.misc.unlink.notLinked|${gConfig.settings.prefix}}`);

	await uConfig.mongoEdit({
		$pull: {
			socials: p
		}
	});

	return msg.reply("{lang:commands.misc.unlink.unlinked}");
}));
