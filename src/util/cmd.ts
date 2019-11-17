import { CommandHandler } from "command-handler";
import { ExtendedMessage } from "bot-stuff";
import * as Eris from "eris";
import { mdb } from "../modules/Database";
import UserConfig from "../modules/config/UserConfig";
import GuildConfig from "../modules/config/GuildConfig";
import config from "../config";
import FurryBot from "../main";
import { Logger } from "clustersv2";
import * as fs from "fs-extra";

const f = ((type: string) => ((name: string, msg: string, extra?: ExtendedMessage<FurryBot, UserConfig, GuildConfig>) => Logger[type](typeof extra !== "undefined" ? `Cluster #${extra.client.cluster.id} | Shard #${extra.guild.shard.id} | ${name}` : name, msg)));

const cmdHandler = new CommandHandler<ExtendedMessage<FurryBot, UserConfig, GuildConfig>, FurryBot>(null, {
	alwaysAddSend: true,
	blacklist: true,
	logger: {
		log: f("log"),
		error: f("error"),
		warn: f("warn"),
		debug: f("debug"),
		info: f("info")
	},
	messages: {
		devOnly: "{author.mention}, this command can only be ran by developers.",
		betaOnly: "",
		nsfwOnly: "{author.mention}, this command can only be ran in nsfw channels.",
		donatorOnly: "{author.mention}, this command can only be ran by donators. You can donate here: https://patreon.com/FurryBot",
		guildOwnerOnly: "{author.mention}, this command can only be ran by this servers owner.",
		nsfwCheck: "{author.mention}, you must enable nsfw commands to use this. To enable nsfw commands, use `{prefix}settings nsfw enable`"
	}
}, {
	blCheck: (async function (msg) {
		if (config.developers.includes(msg.author.id)) return false;
		const b = await mdb.collection("users").findOne({ id: msg.author.id }).then(res => !!res ? new UserConfig(msg.author.id, res) : null);
		if (!b) return false;
		if (b.blacklist.blacklisted) return true;
		return false;
	}),
	devCheck: (async (msg) => config.developers.includes(msg.author.id)),
	spamCheck: (async function (msg) {
		if (!config.developers.includes(msg.author.id) && !msg.uConfig.blacklist.blacklisted) {
			this.spamCounter.push({
				time: Date.now(),
				user: msg.author.id,
				cmd: msg.cmd[0]
			});

			const sp = [...this.spamCounter.filter(s => s.user === msg.author.id)];
			let spC = sp.length;
			if (sp.length >= config.antiSpam.cmd.start && sp.length % config.antiSpam.cmd.warning === 0) {
				let report: any = {
					userTag: msg.author.tag,
					userId: msg.author.id,
					generatedTimestamp: Date.now(),
					entries: sp.map(s => ({ cmd: s.cmd, time: s.time })),
					type: "cmd",
					beta: config.beta
				};

				const d = fs.readdirSync(`${config.logsDir}/spam`).filter(d => !fs.lstatSync(`${config.logsDir}/spam/${d}`).isDirectory() && d.startsWith(msg.author.id) && d.endsWith("-cmd.json") && fs.lstatSync(`${config.logsDir}/spam/${d}`).birthtimeMs + 1.2e5 > Date.now());

				if (d.length > 0) {
					report = this.f.combineReports(...d.map(f => JSON.parse(fs.readFileSync(`${config.logsDir}/spam/${f}`).toString())), report);
					spC = report.entries.length;
					d.map(f => fs.unlinkSync(`${config.logsDir}/spam/${f}`));
				}

				const reportId = this.f.random(10);

				fs.writeFileSync(`${config.logsDir}/spam/${msg.author.id}-${reportId}-cmd.json`, JSON.stringify(report));

				Logger.log(`Cluster #${msg.client.cluster.id} | Shard #${msg.guild.shard.id} | Command Handler`, `Possible command spam from "${msg.author.tag}" (${msg.author.id}), VL: ${spC}, Report: ${config.beta ? `https://${config.apiBindIp}/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}`);
				await this.bot.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
					embeds: [
						{
							title: `Possible Command Spam From ${msg.author.tag} (${msg.author.id}) | VL: ${spC}`,
							description: `Report: ${config.beta ? `https://${config.apiBindIp}/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}`
						}
					],
					username: `Furry Bot Spam Logs${config.beta ? " - Beta" : ""}`,
					avatarURL: "https://assets.furry.bot/blacklist_logs.png"
				});

				if (spC >= config.antiSpam.cmd.blacklist) {
					await msg.uConfig.edit({
						blacklist: {
							blacklisted: true,
							reason: `Spamming Commands. Automatic Blacklist.`,
							blame: "Automatic"
						}
					});

					Logger.log(`Cluster #${msg.client.cluster.id} | Shard #${msg.guild.shard.id} | Command Handler`, `User "${msg.author.tag}" (${msg.author.id}) blacklisted for spamming, VL: ${spC}, Report: ${config.beta ? `https://${config.apiBindIp}/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}`);
					await this.bot.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
						embeds: [
							{
								title: "User Blacklisted",
								description: `Id: ${msg.author.id}\nTag: ${msg.author.tag}\nReason: Spamming Commands. Automatic Blacklist.\nReport: ${config.beta ? `https://${config.apiBindIp}/reports/cmd/${msg.author.id}/${reportId}` : `https://botapi.furry.bot/reports/cmd/${msg.author.id}/${reportId}`}\nBlame: Automatic`,
								timestamp: new Date().toISOString(),
								color: this.f.randomColor()
							}
						],
						username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
						avatarURL: "https://assets.furry.bot/blacklist_logs.png"
					});
				}

				return { skip: true, msg: null }; // msg.reply(`It seems like you may be spamming commands, try to slow down a bit.. VL: ${spC}`);
			}
		}
	}),
	betaCheck: (async (msg) => config.beta),
	nsfwCheck: (async (msg) => {
		const g = await mdb.collection("guilds").findOne({ id: msg.guild.id }).then(res => !!res ? new GuildConfig(msg.channel.guild.id, res) : null);
		return g && g.settings.nsfw;
	}),
	donatorCheck: (async function (msg) {
		return { amount: 0, donator: false };
	}),
	colorGen: ((msg) => Math.floor(Math.random() * 0xFFFFFF)),
	getPrefix: (async function (msg) {
		const g = await mdb.collection("guilds").findOne({ id: msg.author.id }).then(res => !!res ? new GuildConfig(msg.channel.guild.id, res) : null);
		return g && g.settings.prefix ? g.settings.prefix : config.defaultPrefix;
	})
});

export default cmdHandler;
