import client from "../../index";
import FurryBot from "../main";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import functions from "../util/functions";
import config from "../config";

client.cmdHandler
	.addCategory({
		name: "animals",
		displayName: ":dog: Animals",
		devOnly: false,
		description: "Cute little animals to brighten your day!"
	})
	.addCommand({
		triggers: [
			"bird",
			"birb"
		],
		userPermissions: [],
		botPermissions: [
			"attachFiles"
		],
		cooldown: 3e3,
		donatorCooldown: 1.5e3,
		description: "Get a picture of a birb!",
		usage: "",
		features: [],
		category: "animals",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const img = await functions.imageAPIRequest(true, "birb");
			try {
				return msg.channel.createMessage("", {
					file: await functions.getImageFromURL(img.response.image),
					name: img.response.name
				});
			} catch (e) {
				this.logger.error(e, msg.guild.shard.id);
				return msg.channel.createMessage("unknown api error", {
					file: await functions.getImageFromURL(config.images.serverError),
					name: "error.png"
				});
			}
		})
	});

export default null;