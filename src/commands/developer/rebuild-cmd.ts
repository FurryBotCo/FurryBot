import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { execSync } from "child_process";

export default new Command({
	triggers: [
		"rebuild"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Rebuild the bot's code",
	usage: "",
	features: ["devOnly", "betaOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const start = performance.now();
	const rb = execSync("npm run build", {
		cwd: config.rootDir
	});
	const end = performance.now();
	return msg.channel.createMessage(`Rebuild finished in ${(end - start).toFixed(3)}ms\`\`\`fix\n${rb.toString()}\n\`\`\``);
}));
