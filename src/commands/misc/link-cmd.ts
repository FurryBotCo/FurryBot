import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import config from "../../config";
import chunk from "chunk";
import { Redis } from "../../modules/External";
import { Internal } from "../../util/Functions";

export default new Command({
	triggers: [
		"link"
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

	if (p) return msg.reply(`{lang:commands.misc.link.previous|${gConfig.settings.prefix}}`);
	const patrons = await Internal.loopPatrons();

	const d = patrons.find(p => p.attributes.social_connections.discord && p.attributes.social_connections.discord.user_id === msg.author.id);

	if (!d) return msg.reply(`{lang:commands.misc.link.failed|${config.client.socials.patreon}|${config.client.socials.discord}}`);

	// console.log(require("util").inspect(d, { depth: null }));

	await uConfig.mongoEdit({
		$push: {
			socials: {
				type: "patreon",
				id: d.id,
				amount: d.payment_data.amount_cents
			}
		}
	});

	const amount = `${d.payment_data.amount_cents.toString().slice(0, -2)}.${d.payment_data.amount_cents.toString().slice(-2)}`;
	return msg.reply(`{lang:commands.misc.link.linked|${amount}}`);
}));
