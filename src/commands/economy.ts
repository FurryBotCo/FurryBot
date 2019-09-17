import client from "../../index";
import FurryBot from "../main";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import functions from "../util/functions";
import config from "../config";
import { Command, CommandError } from "../util/CommandHandler";
import { mdb } from "../modules/Database";
import * as Eris from "eris";

type CommandContext = FurryBot & { _cmd: Command };

client.cmdHandler
	.addCategory({
		name: "economy",
		displayName: ":moneybag: Economy",
		devOnly: false,
		description: "Our economy system."
	})
	.addCommand({
		triggers: [
			"bal",
			"balance",
			"$"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 1.5e3,
		description: "Check your economy balance.",
		usage: "",
		features: [],
		category: "economy",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if ([undefined, null].includes(msg.uConfig.bal)) await msg.uConfig.edit({ bal: 100 }).then(d => d.reload());

			if (isNaN(msg.uConfig.bal) || msg.uConfig.bal === Infinity) return msg.reply("You have been temporarily suspended from using economy commands, please join our support server (<https://discord.gg/YazeA7e>) and tell them that something is wrong with your economy balance. Attempts to circumvent this may get you blacklisted.");

			if (msg.args.length > 0) {
				const user = await msg.getUserFromArgs();
				if (!user) return msg.errorEmbed("INVALID_USER");

				const bal = await mdb.collection("users").findOne({ id: user.id }).then(res => res.bal).catch(err => 100);
				return msg.reply(`${user.username}#${user.discriminator}'s balance is **${bal}**${config.eco.emoji}`);
			} else return msg.reply(`Your balance is **${msg.uConfig.bal}**${config.eco.emoji}`);
		})
	})
	.addCommand({
		triggers: [
			"baltop"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 1.5e3,
		description: "Check out the richest people in our economy system!",
		usage: "",
		features: [],
		category: "economy",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if ([undefined, null].includes(msg.uConfig.bal)) await msg.uConfig.edit({ bal: 100 }).then(d => d.reload());

			return msg.reply("this command has not been released yet!");
		})
	})
	.addCommand({
		triggers: [
			"beg"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 6e4,
		donatorCooldown: 3e4,
		description: "Beg for free money.",
		usage: "",
		features: [],
		category: "economy",
		run: (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
			if ([undefined, null].includes(msg.uConfig.bal)) await msg.uConfig.edit({ bal: 100 }).then(d => d.reload());

			if (isNaN(msg.uConfig.bal) || msg.uConfig.bal === Infinity) return msg.reply("You have been temporarily suspended from using economy commands, please join our support server (<https://discord.gg/YazeA7e>) and tell them that something is wrong with your economy balance. Attempts to circumvent this may get you blacklisted.");

			const { amount: multi } = await this.f.calculateMultiplier(msg.member);

			let amount = Math.floor(Math.random() * 50) + 1;
			amount += amount * multi;
			amount = Math.floor(amount);
			let s = functions.fetchLangMessage(msg.gConfig.lang, cmd);

			const people = [
				...config.eco.people,
				msg.guild.members.random().username, // positility of a random person from the same server
				msg.guild.members.random().username, // positility of a random person from the same server
				msg.guild.members.random().username  // positility of a random person from the same server
			];

			const person = people[Math.floor(Math.random() * people.length)];

			// love you, skull
			if (person.toLowerCase() === "skullbite") s = "**{0}** gave you {1}{2}, though they seemed to have some white substance on them..";

			let t = this.f.formatStr(s, person, amount, config.eco.emoji);

			t += `\nMultiplier: **${multi * 100}%**`;

			await msg.uConfig.edit({ bal: msg.uConfig.bal + amount }).then(d => d.reload());

			await this.executeWebhook(config.webhooks.economyLogs.id, config.webhooks.economyLogs.token, {
				embeds: [
					{
						title: `**beg** command used by ${msg.author.tag}`,
						description: `Amount Gained: ${amount}\nPerson: ${person}\nText: ${t}`,
						timestamp: new Date().toISOString(),
						color: this.f.randomColor(),
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
		})
	})
	.addCommand({
		triggers: [
			"betflip",
			"bf"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 1.5e3,
		description: "Bet some money on a coin flip.",
		usage: "<side> <amount>",
		features: [],
		category: "economy",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if ([undefined, null].includes(msg.uConfig.bal)) await msg.uConfig.edit({ bal: 100 }).then(d => d.reload());

			if (isNaN(msg.uConfig.bal) || msg.uConfig.bal === Infinity) return msg.reply("You have been temporarily suspended from using economy commands, please join our support server (<https://discord.gg/YazeA7e>) and tell them that something is wrong with your economy balance. Attempts to circumvent this may get you blacklisted.");

			if (msg.args.length < 2) throw new CommandError(null, "ERR_INVALID_USAGE");

			if (!["heads", "tails"].includes(msg.args[0].toLowerCase())) return msg.reply(`invalid side "${msg.args[0].toLowerCase()}", valid sides: **heads**, **tails**.`);

			const a = msg.args[0].toLowerCase() === "heads" ? 0 : 1; // I know I could go with true/false, which is basically the same in most senses, but I prefer 1/0
			const b = parseInt(msg.args[1], 10);
			let c = b;
			const { amount: multi } = await this.f.calculateMultiplier(msg.member);
			c = Math.round(c + c * multi);
			if (isNaN(b) || b < 1) return msg.reply(`please provide a positive number for the amount of ${config.eco.emoji} to bet.`);

			if (b > msg.uConfig.bal) return msg.reply(`you do not have **${b}**${config.eco.emoji}, you only have **${msg.uConfig.bal}**${config.eco.emoji}.`);

			const flip = Math.random();

			const win = flip <= .70;
			const side = win ? "heads" : "tails";
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
						color: this.f.randomColor(),
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
		})
	})
	.addCommand({
		triggers: [
			"multiplier",
			"multi"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 3e3,
		donatorCooldown: 1.5e3,
		description: "Check your economy multiplier.",
		usage: "",
		features: [],
		category: "economy",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if ([undefined, null].includes(msg.uConfig.bal)) await msg.uConfig.edit({ bal: 100 }).then(d => d.reload());

			let member = msg.member;
			if (msg.args.length > 0) member = await msg.getMemberFromArgs();

			const m = await this.f.calculateMultiplier(member);

			const embed: Eris.EmbedOptions = {
				title: `${member.username}#${member.discriminator}'s Multipliers`,
				description: `[Support Server](https://discord.gg/YazeA7e): ${m.multi.supportServer ? "<:greenTick:599105055240749089>" : "<:redTick:599105059275407381>"} - \`${config.eco.multipliers.supportServer * 100}%\`\n\
		[Vote](https://discordbots.org/bot/398251412246495233/vote): ${m.multi.vote ? "<:greenTick:599105055240749089>" : "<:redTick:599105059275407381>"} - \`${config.eco.multipliers.vote * 100}%\`\n\
		[Weekend Vote](https://discordbots.org/bot/398251412246495233/vote): ${m.multi.voteWeekend ? "<:greenTick:599105055240749089>" : "<:redTick:599105059275407381>"} - \`${config.eco.multipliers.voteWeekend * 100}%\`\n\
		[Support Server](https://discord.gg/YazeA7e) Booster: ${m.multi.booster ? "<:greenTick:599105055240749089>" : "<:redTick:599105059275407381>"} - \`${config.eco.multipliers.booster * 100}%\`\n\
		Tips Enabled: ${m.multi.tips ? "<:greenTick:599105055240749089>" : "<:redTick:599105059275407381>"} - \`${config.eco.multipliers.tips * 100}%\``,
				timestamp: new Date().toISOString(),
				color: this.f.randomColor(),
				footer: {
					text: `Multiplier Total: ${isNaN(m.amount) ? 0 : m.amount * 100}%`
				}
			};

			return msg.channel.createMessage({ embed });
		})
	})
	.addCommand({
		triggers: [
			"share",
			"give"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Share your wealth with others.",
		usage: "<amount> <user>",
		features: [],
		category: "economy",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if ([undefined, null].includes(msg.uConfig.bal)) await msg.uConfig.edit({ bal: 100 }).then(d => d.reload());

			if (isNaN(msg.uConfig.bal) || msg.uConfig.bal === Infinity) return msg.reply("You have been temporarily suspended from using economy commands, please join our support server (<https://discord.gg/YazeA7e>) and tell them that something is wrong with your economy balance. Attempts to circumvent this may get you blacklisted.");

			const m = await msg.getMemberFromArgs();

			if (!m) return msg.errorEmbed("ERR_INVALID_MEMBER");

			const md = await this.f.fetchDBUser(m.user.id, true);
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
						color: this.f.randomColor(),
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
		})
	});

export default null;