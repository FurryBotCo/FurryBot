import Command from "../../modules/CommandHandler/Command";
import { Time } from "../../util/Functions";
import * as fs from "fs-extra";
import config from "../../config";

export default new Command({
	triggers: [
		"restart"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: ["developer"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const time = await Time.ms((this.bot.shards.size * 7) * 1e3, true);
	fs.writeFileSync(`${config.dir.base}/restart.json`, JSON.stringify({
		time: Date.now(),
		user: msg.author.id,
		channel: msg.channel.id
	}));
	return msg.reply(`restarting.. This may take ${time} or more.`).then(() => process.exit());
}));
