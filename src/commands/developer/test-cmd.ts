import Command from "../../util/CommandHandler/lib/Command";
import ExtendedMessage from "@ExtendedMessage";

export default new Command({
	triggers: [
		"test"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Some stuff for testing",
	usage: "",
	features: ["devOnly"],
	file: __filename
}, (async function (msg: ExtendedMessage) {
	if (!msg.args[0]) return msg.reply("tested..");

	switch (msg.args[0].toLowerCase()) {
		case "err": {
			throw new Error("ERR_TESTING");
			break;
		}

		case "reload": {
			return msg.reply("hello.");
			break;
		}

		case "ban": {
			return msg.member.ban(0, "test");
			break;
		}

		default: {
			return msg.reply("invalid test.");
		}
	}
}));
