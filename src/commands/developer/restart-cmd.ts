import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Time } from "../../util/Functions";

export default new Command({
	triggers: [
		"restart"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Make me restart.",
	usage: "",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const time = await Time.ms((this.shards.size * 7) * 1e3, true);
	return msg.reply(`restarting.. This may take ${time} or more.`).then(() => process.exit());
}));
