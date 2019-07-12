import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";
import lang from "@src/lang";

export default new Command({
	triggers: [
		"beg"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 6e4,
	description: "Beg for free money",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if ([undefined, null].includes(msg.uConfig.bal)) await msg.uConfig.edit({ bal: 100 }).then(d => d.reload());

	const { amount: multi } = await functions.calculateMultiplier(msg.member);

	let amount = Math.floor(Math.random() * 50) + 1;
	amount += amount * multi;
	amount = Math.floor(amount);
	const people = [
		...config.eco.people,
		msg.guild.members.random().username, // positility of a random person from the same server
		msg.guild.members.random().username, // positility of a random person from the same server
		msg.guild.members.random().username  // positility of a random person from the same server
	];

	const person = people[Math.floor(Math.random() * people.length)];

	// love you, skull
	if (person.toLowerCase() === "skullbite") msg.c = "**{0}** gave you {1}{2}, though they seemed to have some white substance on them..";

	let t = functions.formatStr(msg.c, person, amount, config.eco.emoji);

	t += `\nMultiplier: **${multi * 100}%**`;

	await msg.uConfig.edit({ bal: msg.uConfig.bal + amount }).then(d => d.reload());

	await this.executeWebhook(config.webhooks.economyLogs.id, config.webhooks.economyLogs.token, {
		embeds: [
			{
				title: `**beg** command used by ${msg.author.tag}`,
				description: `Amount Gained: ${amount}\nPerson: ${person}\nText: ${t}`,
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

	return msg.reply(t);
}));