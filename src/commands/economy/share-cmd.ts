import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";
import UserConfig from "@src/modules/config/UserConfig";

export default new Command({
	triggers: [
		"share",
		"give"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Share your wealth with others",
	usage: "<amount> <user>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if ([undefined, null].includes(msg.uConfig.bal)) await msg.uConfig.edit({ bal: 100 }).then(d => d.reload());

	const m = await msg.getMemberFromArgs();

	if (!m) return msg.errorEmbed("ERR_INVALID_MEMBER");

	const md = await functions.fetchDBUser(m.user.id, true);
	if (md.blacklist.blacklisted) return msg.reply(`you can't share ${config.eco.emoji} with blacklisted people..`);

	const amount = parseInt(msg.args[0], 10);

	if (isNaN(amount) || amount < 1) return msg.reply("please provide a valid positive number.");

	if (amount > msg.uConfig.bal) return msg.reply(`you don't have **${amount}**${config.eco.emoji}, you only have **${msg.uConfig.bal}**${config.eco.emoji}.`);

	const oldBal = msg.uConfig.bal;
	const oldMdBal = md.bal;
	// console.log(oldBal);
	// console.log(oldMdBal);
	// console.log(md);
	await msg.uConfig.edit({ bal: oldBal - amount }).then(d => d.reload());
	await md.edit({ bal: oldMdBal + amount }).then(d => d.reload());

	await this.executeWebhook(config.webhooks.economyLogs.id, config.webhooks.economyLogs.token, {
		embeds: [
			{
				title: `**share** command used by ${msg.author.tag}`,
				description: `Amount Shared: ${amount}\nShared From: ${msg.author.tag}\nShared From Old Balance: ${oldBal}\nSharedFrom New Balance: ${msg.uConfig.bal}\nShared To: ${m.username}#${m.discriminator}\nShared To Old Balance: ${oldMdBal}\nShared To New Bal: ${md.bal}`,
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

	return msg.reply(`You shared **${amount}**${config.eco.emoji} with ${m.username}#${m.discriminator}`);
}));