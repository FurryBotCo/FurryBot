import Eris from "eris";

declare global {
	interface String {
		format<T extends string = string>(...args: T[]): string;
	}

	namespace GlobalTypes {
		interface DBEntry {
			_id?: string;
		}

		export type PremiumEntry = PremiumGuildEntry | PremiumUserEntry;

		interface PremiumGuildEntry extends DBEntry {
			type: "guild";
			guildId: string;
			user: string;
			active: boolean;
			activationDate: number;
		}

		interface PremiumUserEntry extends DBEntry {
			type: "user";
			userId: string;
			active: boolean;
			amount: number;
			activationDate: number;
			patronId: string;
		}

		interface TimedEntry extends DBEntry {
			time: number;
			expiry: number;
			userId: string;
			guildId: string;
			type: "mute" | "ban";
			reason: string;
		}

		interface AutoEntry extends DBEntry {
			type:
			"yiff.gay" | "yiff.straight" | "yiff.lesbian" | "yiff.dickgirl" |
			"animals.bird" | "animals.bunny" | "animals.cat" | "animals.duck" |
			"animals.fox" | "animals.otter" | "animals.panda" | "animals.snek" |
			"animals.turtle" | "animals.wolf";
			guildId: string;
			webhook: {
				id: string;
				token: string;
			};
			addedBy: string;
			time: 5 | 10 | 15 | 30 | 60;
		}
	}

	namespace Express {
		interface Session {
			discord: {
				accessToken: string;
				expiresIn: number;
				refreshToken: string;
				tokenType: string;
				time: number;
			};
			user: Eris.User;
			state?: string;
			return: string;
		}
	}

	namespace Discord {
		interface Oauth2Token {
			access_token: string;
			expires_in: number;
			refresh_token: string;
			scope: string;
			token_type: string;
		}

		interface APISelfUser {
			id: string;
			username: string;
			avatar: string;
			discriminator: string;
			locale: string;
			mfa_enabled: boolean;
			flags: number;
			premium_type: number;
		}
	}
}
