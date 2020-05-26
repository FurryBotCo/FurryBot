import Command from "../../modules/CommandHandler/Command";
import config from "../../config";
import { execSync } from "child_process";

export default new Command({
	triggers: [
		"rebuild"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: ["developer", "beta"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const start = performance.now();
	const rb = execSync("npm run build", {
		cwd: config.dir.base
	});
	const end = performance.now();
	return msg.channel.createMessage(`Rebuild finished in ${(end - start).toFixed(3)}ms\`\`\`fix\n${rb.toString()}\n\`\`\``);
}));
