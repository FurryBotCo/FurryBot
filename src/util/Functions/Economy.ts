import config from "../../config";
import FurryBot from "@FurryBot";
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
			return m.roles.includes(config.nitroBoosterRole);
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
		return {
			supportServer: {
				p: 0.0175,
				check: this.checkSupportServer,
				name: `[Support Server](${config.bot.supportInvite})`,
				hidden: false
			},
			vote: {
				p: 0.01,
				check: (async (userId: string) => this.checkVote(userId).then(v => v.voted)),
				name: `[Vote](${config.bot.voteURL})`,
				hidden: false
			},
			voteWeekend: {
				p: 0.005,
				check: (async (userId: string) => this.checkVote(userId).then(v => v.weekend)),
				name: `[Weekend Vote](${config.bot.voteURL})`,
				hidden: false
			},
			booster: {
				p: 0.030,
				check: this.checkBooster,
				name: `[Booster](${config.bot.supportInvite})`,
				hidden: false
			},
			donator: {
				p: 0.030,
				check: this.checkDonator,
				name: `[Donator](${config.bot.patreon})`,
				hidden: false
			},
			tips: {
				p: 0.015,
				check: this.checkTips,
				name: "Tips",
				hidden: false
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
