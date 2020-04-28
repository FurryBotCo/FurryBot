import config from "../../config";
import FurryBot from "../../main";
import Internal from "./Internal";

export default class Economy {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}
	/**
	 * check if a user is a booster
	 *
	 * will fail if the main guild is not present
	 * @static
	 * @param {string} userId - the users id
	 * @param {FurryBot} client - the bot client
	 * @returns
	 * @memberof Internal
	 */
	static async checkBooster(userId: string, client: FurryBot) {
		const g = client.guilds.get(config.bot.mainGuild);
		if (!g || !g.members.has(userId)) return false;
		else {
			const m = g.members.get(userId);
			return m.roles.includes(config.eco.nitroBoosterRole);
		}
	}

	/**
	 * check if a user is a booster
	 *
	 * will fail if the main guild is not present
	 * @static
	 * @param {string} userId - the users id
	 * @param {FurryBot} client - the bot client
	 * @returns
	 * @memberof Internal
	 */
	static async checkSupportServer(userId: string, client: FurryBot) {
		const g = client.guilds.get(config.bot.mainGuild);
		if (!g) return false;
		return g.members.has(userId);
	}

	/**
	 * check if a user is a donator
	 * @static
	 * @param {string} userId - the users id
	 * @returns
	 * @memberof Internal
	 */
	static async checkDonator(userId: string) {
		const p = await Internal.getUser(userId).then(u => u.premiumCheck());
		return p.active;
	}

	/**
	 * check if a user has tips enabled
	 *
	 * will fail if the main guild is not present
	 * @static
	 * @param {string} userId - the users id
	 * @returns
	 * @memberof Internal
	 */
	static async checkTips(userId: string) {
		const u = await Internal.getUser(userId);

		return u.tips;
	}

	/**
	 * check if a user has voted
	 * @static
	 * @param {string} userId - the users id
	 * @returns
	 * @memberof Internal
	 */
	static async checkVote(userId: string) {
		const u = await Internal.getUser(userId);

		return {
			voted: false,
			weekend: false
		};
	}

	static get multi() {
		// @FIXME language stuff
		return {
			supportServer: {
				p: 0.0175,
				check: this.checkSupportServer,
				name: `[{lang:commands.economy.multiplier.multi.supportServer}](${config.bot.supportURL})`,
				hidden: false
			},
			vote: {
				p: 0.01,
				check: (async (userId: string) => this.checkVote(userId).then(v => v.voted)),
				name: `[{lang:commands.economy.multiplier.multi.vote}](${config.bot.voteURL})`,
				hidden: false
			},
			voteWeekend: {
				p: 0.005,
				check: (async (userId: string) => this.checkVote(userId).then(v => v.weekend)),
				name: `[{lang:commands.economy.multiplier.multi.weekendVote}](${config.bot.voteURL})`,
				hidden: false
			},
			booster: {
				p: 0.030,
				check: this.checkBooster,
				name: `[{lang:commands.economy.multiplier.multi.booster}](${config.bot.supportURL})`,
				hidden: false
			},
			donator: {
				p: 0.030,
				check: this.checkDonator,
				name: `[{lang:commands.economy.multiplier.multi.donator}](${config.bot.patreon})`,
				hidden: false
			},
			tips: {
				p: 0.015,
				check: this.checkTips,
				name: "{lang:commands.economy.multiplier.multi.tips}",
				hidden: false
			},
			developer: {
				p: 0.200,
				check: (userId: string, client: FurryBot) => config.developers.includes(userId),
				name: "{lang:commands.economy.multiplier.multi.developer}",
				hidden: true
			},
			supportStaff: {
				p: 0.050,
				// @TODO make function to check across clusters
				check: (userId: string, client: FurryBot) => client.guilds.get(config.bot.mainGuild).members.has(userId) && client.guilds.get(config.bot.mainGuild).members.get(userId).roles.includes("427302201027854337"),
				name: "{lang:commands.economy.multiplier.multi.supportStaff}",
				hidden: true
			},
			specialPeeps: {
				p: 0.050,
				check: (userId: string, client: FurryBot) => ["192361753693126668", "201210303831080960"].includes(userId),
				name: "{lang:commands.economy.multiplier.multi.special}",
				hidden: true
			},
			cutie: {
				p: 0.050,
				check: (userId: string, client: FurryBot) => ["201210303831080960"].includes(userId),
				name: "Cutest Little Cutie",
				hidden: true
			},
			horny: {
				p: 0.050,
				check: (userId: string, client: FurryBot) => ["515317973335146512"].includes(userId),
				name: "Horniest of Them All",
				hidden: true
			}
		};
	}

	static async calculateMulti(userId: string, client: FurryBot) {
		let multi = 0;
		const av: string[] = [];
		for (const k of Object.keys(this.multi)) {
			const m = this.multi[k];
			if (await m.check(userId, client)) (av.push(k), multi += m.p);
		}

		return {
			multi,
			multiStr: parseFloat((multi * 100).toFixed(2)),
			list: av
		};
	}
}
