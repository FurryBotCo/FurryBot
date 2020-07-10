import Command from "../../modules/CommandHandler/Command";
import phin from "phin";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Time } from "../../util/Functions";
import { DH_NOT_SUITABLE_GENERATOR } from "constants";
import Language from "../../util/Language";

export default new Command({
	triggers: [
		"status"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 3e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	// @TODO I don't feel like doing language for this right now
	interface FurryBotAPIStatus {
		success: boolean;
		uptime: number;
	}

	interface StatusPage {
		page: {
			id: string;
			name: string;
			url: string;
			time_zone: string;
			updated_at: string;
		};
		status: {
			indicator: string;
			description: string;
		};
		components: ({
			id: string;
			name: string;
			status: string;
			created_at: string;
			updated_at: string;
			position: number;
			description?: string;
			showcase: boolean;
			group_id: string;
			page_id: string;
			only_show_if_degraded: boolean;
		} & ({
			group: false;
		} | {
			group: true;
			components: string[];
		}))[];
		incidents: any[]; // @TODO
		schedule_maintences: any[]; // @TODO
	}

	async function fetch<T>(url: string, auth?: string, parse?: null): Promise<phin.IResponse>;
	async function fetch<T>(url: string, auth?: string, parse?: "json"): Promise<phin.IJSONResponse<T>>;
	async function fetch<T>(url: string, auth?: string, parse: "json" = "json"): Promise<phin.IJSONResponse<T>> {
		// could have done this a different way, but this is easier
		const d = {
			method: "GET",
			url,
			headers: {
				"User-Agent": config.web.userAgent
			},
			timeout: 5e3
		} as any;

		if (parse) d.parse = parse;
		if (auth) d.headers.Authorization = auth;
		const data = await phin(d).catch(err => null);
		if (!data) return null;
		if (!parse) return { ...data, body: data.body.toString() };
		else return data;
	}

	const status = {
		"fV1": await fetch<FurryBotAPIStatus>("https://api.furry.bot/V1/online"),
		"fV2": await fetch<FurryBotAPIStatus>("https://api.furry.bot/V2/online"),
		"cdnFur": await fetch<FurryBotAPIStatus>("https://furcdn.net/online"),
		"cdnYiff": await fetch<FurryBotAPIStatus>("https://yiff.media/online"),
		"discord": await fetch<StatusPage>("https://srhpyqt94yxb.statuspage.io/api/v2/summary.json"),
		"cloudflare": await fetch<StatusPage>("https://yh6f0r4529hb.statuspage.io/api/v2/summary.json"),
		"ll-us-east": await fetch("https://us-east.lavalink.furry.bot/version", config.apiKeys.lavalink.password, null)
	};

	const embed = new EmbedBuilder(gConfig.settings.lang)
		.setDescription("Note: This is very basic due to me not knowing the ins and out of statuspage (the last two)'s api.\n\n* - Provide the name of these as an argument to get more detailed statuses.")
		.addField("Furry Bot API V1", !status.fV1 ? "Offline, Unreachable." : `Online: ${status.fV1.body.success ? "Yes" : "No"}\nUptime: ${!status.fV1.body.uptime ? "None" : Time.ms(status.fV1.body.uptime * 1000, true)}`, false)
		.addField("Furry Bot API V2", !status.fV2 ? "Offline, Unreachable." : `Online: ${status.fV2.body.success ? "Yes" : "No"}\nUptime: ${!status.fV2.body.uptime ? "None" : Time.ms(status.fV2.body.uptime * 1000, true)}`, false)
		.addField("FurCDN.Net", !status.cdnFur ? "Offline, Unreachable." : `Online: ${status.cdnFur.body.success ? "Yes" : "No"}\nUptime: ${!status.cdnFur.body.uptime ? "None" : Time.ms(status.cdnFur.body.uptime * 1000, true)}`, false)
		.addField("Yiff.Media", !status.cdnYiff ? "Offline, Unreachable." : `Online: ${status.cdnYiff.body.success ? "Yes" : "No"}\nUptime: ${!status.cdnYiff.body.uptime ? "None" : Time.ms(status.cdnYiff.body.uptime * 1000, true)}`, false)
		.addField("Furry Bot Lavalink US-EAST", `Online: ${status["ll-us-east"] ? "Yes" : "No"}\nVersion: ${!status["ll-us-east"] ? "N/A" : status["ll-us-east"].body}`, false)
		.addField("Discord (*)", `Status: ${status.discord.body.status.indicator}${status.discord.body.status.indicator !== "operational" ? ` \nDescription: ${status.discord.body.status.description || "No Description"}` : ""}`, false)
		.addField("Cloudflare (*)", `Status: ${status.cloudflare.body.status.indicator}${status.cloudflare.body.status.indicator !== "operational" ? ` \nDescription: ${status.cloudflare.body.status.description || "No Description"}` : ""}`, false)
		.setTimestamp(new Date().toISOString())
		.toJSON();

	if (msg.args.length === 0) return msg.channel.createMessage({
		embed
	});
	else {
		const s = ["discord", "cloudflare"];
		if (!s.includes(msg.args[0].toLowerCase())) {
			embed.description += `\n\n${Language.get(gConfig.settings.lang, "commands.information.status.filtered")}`;
			console.log(embed.fields.map(f => f.name.toLowerCase().indexOf(msg.unparsedArgs.join(" ").toLowerCase())).join("\n"));
			embed.fields = embed.fields.filter(f => f.name.toLowerCase().indexOf(msg.unparsedArgs.join(" ").toLowerCase()) !== -1);
			return msg.channel.createMessage({ embed });
		}
		// return msg.reply(`invalid selection "${msg.args[0].toLowerCase()}", valid selections: **${s.join("**, **")}**`);
		const groups = status[msg.args[0].toLowerCase()].body.components.filter(c => c.group === true);
		const statuses = status[msg.args[0].toLowerCase()].body.components.filter(c => c.group === false);
		if (msg.args.length === 1 || !groups.map(g => g.name.toLowerCase()).includes(msg.args.slice(1).join(" ").toLowerCase() as any)) return msg.reply(`please provide a valid group for "${msg.args[0].toLowerCase()}". Valid groups: **${groups.map(c => c.name.toLowerCase()).join("**, **")}**.`);
		const group = groups.find(g => g.name.toLowerCase() === msg.args.slice(1).join(" ").toLowerCase());
		const c = statuses.filter(s => s.group_id && s.group_id === group.id);
		return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setDescription(`Group Name: ${group.name}\n${group.status}${group.status !== "operational" ? ` \n\n${group.description || "No Description"}` : ""}`)
				.addFields(...c.map(s => ({ name: s.name, value: `${s.status}${s.status !== "operational" ? ` \n\n\n${s.description || "No Description"}` : ""}`, inline: true })).reduce((a, b) => a.concat(b), []))
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});
	}
}));
