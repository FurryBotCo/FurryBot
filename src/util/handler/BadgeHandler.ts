import config from "../../config";
import FurryBot from "../../main";
import db from "../../db";
import { BotFunctions } from "core";
import Logger from "logger";


export type BADGE_IDS = keyof typeof config["badges"];
export default class BadgeHandler {
	client: FurryBot;
	constructor(client: FurryBot) {
		this.client = client;
	}
	get LIST() {
		return config.badges;
	}


	async getUserBadges(id: string) {
		const u = await this.client.getUser(id);
		if (u === null) throw new TypeError("Invalid user.");
		const d = await db.getUser(u.id);
		const badges: Array<keyof BadgeHandler["LIST"]> = [];
		const flags = BotFunctions.getUserFlags(u);
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
		const c = await this.client.ic.broadcastWithResponse<("NO_GUILD" | "NOT_PRESENT" | "NONE") | Array<"BOOSTER" | "STAFF">>("badgeCheck",{ id: u.id }, false);
		for (const v of c) {
			if (Array.isArray(v)) {
				if (v.includes("BOOSTER")) badges.push("nitro-booster");
				if (v.includes("STAFF")) badges.push("staff");
			} else {
				if (v === "TIMEOUT") Logger.warn("BadgeHandler", `Broadcast to cluster ${c.indexOf(v)} failed with a TIMEOUT response.`);
				continue;
			}
		}
		// @TODO blacklisting
		/* const b = await d.checkBlacklist();
		if (b.current.length > 0) badges.push("blacklisted"); */
		const p = await d.checkPremium();
		if (p.active) badges.push("donator");

		switch (u.id) {
			case "158750488563679232": badges.push("horny", "sub"); break;
			case "280158289667555328": badges.push("horny", "sub", "chris"); break;
			case "608483791832481813": badges.push("horny", "sub"); break;
			case "515317973335146512": badges.push("horny"); break;
			case "777702082357624874": badges.push("horny", "sub"); break;
			case "302604426781261824": badges.push("horny", "sub", "ice"); break;
		}
		return badges.map(v => ({
			id: v,
			...config.badges[v]
		}));
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	addBadgeToUser(userId: string, badgeId: string) {
		// @TODO add badges
	}
}
