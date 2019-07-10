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
	devOnly: true,
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
	let multi = 1;
	if (msg.guild.id === config.bot.mainGuild) multi += .1; // support server multiplier
	const v = await mdb.collection("votes").find({ userId: msg.author.id }).toArray().then(res => res.filter(r => r.timestamp + 8.64e4 < Date.now()));
	if (v.length !== 0) {
		if (v[0].isWeekend) multi += .175; // vote weekend multiplier
		else multi += .125; // vote weekday multiplier
	}

	c = Math.round(c *= multi);
	if (isNaN(b) || b < 1) return msg.reply(`please provide a positive number for the amount of ${config.ecoEmoji} to bet.`);

	if (b > msg.uConfig.bal) return msg.reply(`you do not have **${b}**${config.ecoEmoji}, you only have **${msg.uConfig.bal}**${config.ecoEmoji}.`);

	const flip = Math.floor(Math.random() * 2); // I know I could just use Math.random and test for above/below .5, but this is easier to read

	// console.debug(`[a] Bet ${a}`);
	// console.debug(`[a] Bet ${a === 0 ? "heads" : "tails"}`);
	// console.debug(`[flip] Flip ${flip}`);
	// console.debug(`[flip] Flip ${flip === 0 ? "heads" : "tails"}`);
	// console.debug(`[b] Amount bet ${b}`);
	// console.debug(`[c] Amount won ${c}`);

	if (a === 0) { // bet heads
		if (flip === 0) { // heads, win
			await msg.uConfig.edit({ bal: msg.uConfig.bal + c }).then(d => d.reload());
			return msg.reply(`the flip was **heads**, you won **${c}**${config.ecoEmoji}!\nMultiplier: **%${(multi - 1) * 100}**`);
		} else { // tails, loss
			await msg.uConfig.edit({ bal: msg.uConfig.bal - b }).then(d => d.reload());
			return msg.reply(`the flip was **tails**, you lost **${b}**${config.ecoEmoji}!`);
		}
	} else { // bet tails
		if (flip === 0) { // heads, loss
			await msg.uConfig.edit({ bal: msg.uConfig.bal - b }).then(d => d.reload());
			return msg.reply(`the flip was **heads**, you lost **${b}**${config.ecoEmoji}!`);
		} else { // tails, win
			await msg.uConfig.edit({ bal: msg.uConfig.bal + c }).then(d => d.reload());
			return msg.reply(`the flip was **tails**, you won **${b}**${config.ecoEmoji}!\nMultiplier: **%${(multi - 1) * 100}**`);
		}
	}
}));