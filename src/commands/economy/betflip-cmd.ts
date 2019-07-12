import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";

export default new Command({
	triggers: [
		"betflip",
		"bf"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Bet some money on a coin flip",
	usage: "<side> <amount>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if ([undefined, null].includes(msg.uConfig.bal)) await msg.uConfig.edit({ bal: 100 }).then(d => d.reload());

	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");

	if (!["heads", "tails"].includes(msg.args[0].toLowerCase())) return msg.reply(`invalid side "${msg.args[0].toLowerCase()}", valid sides: **heads**, **tails**.`);

	const a = msg.args[0].toLowerCase() === "heads" ? 0 : 1; // I know I could go with true/false, which is basically the same in most senses, but I prefer 1/0
	const b = parseInt(msg.args[1], 10);
	let c = b;
	const { amount: multi } = await functions.calculateMultiplier(msg.member);
	c = Math.round(c + c * multi);
	if (isNaN(b) || b < 1) return msg.reply(`please provide a positive number for the amount of ${config.eco.emoji} to bet.`);

	if (b > msg.uConfig.bal) return msg.reply(`you do not have **${b}**${config.eco.emoji}, you only have **${msg.uConfig.bal}**${config.eco.emoji}.`);

	const flip = Math.random(); // Math.floor(Math.random() * 2); // I know I could just use Math.random and test for above/below .5, but this is easier to read

	const win = flip <= .70 && a === 0 || flip > .70 && a === 1;
	const side = flip <= .70 ? "heads" : "tails";
	// console.debug(`[a] Bet ${a}`);
	// console.debug(`[a] Bet ${a === 0 ? "heads" : "tails"}`);
	// console.debug(`[flip] Flip ${flip}`);
	// console.debug(`[flip] Flip ${flip === 0 ? "heads" : "tails"}`);
	// console.debug(`[b] Amount bet ${b}`);
	// console.debug(`[c] Amount won ${c}`);


	await this.executeWebhook(config.webhooks.economyLogs.id, config.webhooks.economyLogs.token, {
		embeds: [
			{
				title: `**betflip** command used by ${msg.author.tag}`,
				description: `Bet: ${b}\nWin: ${win ? "Yes" : "No"}\nSide Bet: ${a === 0 ? "heads" : "tails"}\nSide Flipped: ${side}\nMultiplier: **${multi * 100}%**`,
				timestamp: new Date().toISOString(),
				color: functions.randomColor(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				}
			}
		],
		username: `Economy Logs${config.beta ? " - Beta" : ""}`,
		avatarURL: "https://assets.furry.bot/economy_logs.png"
	});

	if (win) { // bet heads
		await msg.uConfig.edit({ bal: msg.uConfig.bal + c }).then(d => d.reload());
		return msg.reply(`the flip was **${side}**, you won **${c}**${config.eco.emoji}!\nMultiplier: **${multi * 100}%**`);
	} else {
		await msg.uConfig.edit({ bal: msg.uConfig.bal - b }).then(d => d.reload());
		return msg.reply(`the flip was **${side}**, you lost **${b}**${config.eco.emoji}!`);
	}
}));