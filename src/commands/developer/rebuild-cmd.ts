import Command from "../../util/CommandHandler/lib/Command";
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
}, (async function (msg, uConfig, gConfig, cmd) {
	const start = performance.now();
	const rb = execSync("npm run build", {
		cwd: config.dir.base
	});
	const end = performance.now();
	return msg.channel.createMessage(`Rebuild finished in ${(end - start).toFixed(3)}ms\`\`\`fix\n${rb.toString()}\n\`\`\``);
}));
