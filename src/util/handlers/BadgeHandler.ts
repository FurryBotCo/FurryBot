import Eris from "eris";
import { join } from "path";
import config from "../../config";
import FurryBot from "../../main";
import db from "../Database";
import Utility from "../Functions/Utility";


export default class BadgeHandler {
	client: FurryBot;
	constructor(client: FurryBot) {
		this.client = client;
	}
	get LIST() { return config.badges; }


	async getUserBadges(id: string) {
		const u = await this.client.getUser(id);
		const d = await db.getUser(u.id);
		const badges: (keyof BadgeHandler["LIST"])[] = [];
		const flags = Utility.getUserFlags(u);
		if (flags.DISCORD_EMPLOYEE) badges.push("discord-employee");
		if (flags.DISCORD_PARTNER) badges.push("discord-partner");
		if (flags.HYPESQUAD_EVENTS) badges.push("hypesquad-events");
		if (flags.BUG_HUNTER_LEVEL_1) badges.push("bug-hunter-level-1");
		if (flags.HOUSE_BRAVERY) badges.push("house-bravery");
		if (flags.HOUSE_BRILLIANCE) badges.push("house-brilliance");
		if (flags.HOUSE_BALANCE) badges.push("house-balance");
		if (flags.EARLY_SUPPORTER) badges.push("early-supporter");
		if (flags.TEAM_USER) badges.push("team-user");
		if (flags.SYSTEM) badges.push("system");
		if (flags.BUG_HUNTER_LEVEL_2) badges.push("bug-hunter-level-2");
		if (flags.VERIFIED_BOT) badges.push("verified-bot");
		if (flags.VERIFIED_BOT_DEVELOPER) badges.push("verified-bot-developer");
		if (config.developers.includes(u.id)) badges.push("developer");
		const c = await this.client.ipc.broadcastEval<("NO_GUILD" | "NOT_PRESENT" | "NONE") | ("BOOSTER" | "STAFF")[], any>(function (args) {
			const g = this.bot.guilds.get(config.client.supportServerId);
			if (!g) return "NO_GUILD";
			const m = g.members.get(args.user);
			if (!m) return "NOT_PRESENT";
			const j = []
			if (m.roles.includes(config.roles.booster)) j.push("BOOSTER");
			if (m.roles.includes(config.roles.staff)) j.push("STAFF");
			return j || "NONE";
		}, {
			user: u.id
		});
		for (const { result: v } of c) {
			if (Array.isArray(v)) {
				if (v.includes("BOOSTER")) badges.push("nitro-booster");
				if (v.includes("STAFF")) badges.push("staff");
			}
			else continue;
		}
		const b = await d.checkBlacklist();
		if (b.current.length > 0) badges.push("blacklisted");
		const p = await d.checkPremium();
		if (p.active) badges.push("donator");

		switch (u.id) {
			case "158750488563679232": badges.push("horny", "sub"); break;
			case "280158289667555328": badges.push("horny", "chris", "sub"); break;
			case "608483791832481813": badges.push("horny", "sub"); break;
			case "515317973335146512": badges.push("horny"); break;
			case "777702082357624874": badges.push("horny", "sub");
		}

		return badges.map(v => ({
			id: v,
			...config.badges[v]
		}));
	}

	addBadgeToUser(userId: string, badgeId: string) { }
}
