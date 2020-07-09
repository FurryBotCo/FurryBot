import FurryBot from "../../main";
import Eris from "eris";

declare global {
	interface Callable<ReturnType> {
		(...args: any[]): ReturnType;
	}

	type GenericReturnType<ReturnType, F> = F extends Callable<ReturnType>
		? ReturnType
		: never;

	interface EvalResult<T> {
		time: {
			start: number;
			end: number;
			total: number;
		};
		result: T;
	}

	interface ClusterStats {
		guilds: number;
		users: number;
		channels: number;
		uptime: number;
		voice: number;
		largeGuilds: number;
		shards: ShardStats[];
		ram: number;
	}

	interface ShardStats {
		ready: boolean;
		latency: number;
		status: Eris.Shard["status"];
		guilds: number;
		users: number;
	}

	interface Stats {
		readonly guilds: number;
		readonly users: number;
		readonly largeGuilds: number;
		readonly channels: number;
		readonly voice: number;
		ram: {
			readonly clusters: number;
			services: number;
			master: number;
			total: number;
		};
		clusters: ClusterStats[];
		shards: ClusterStats["shards"];
		services: {
			[k: string]: number;
		};
	}
	interface EvalMessage {
		op: "eval";
		msg: {
			code: string;
			clusterId: number;
			resId: string;
		};
	}

	interface EvalResponseMessage {
		op: "evalResponse";
		msg: {
			result: string;
			time: {
				start: number;
				end: number;
				total: number;
			};
			clusterId: number;
			resId: string;
		} & ({
			result: {
				message: string;
				name: string;
				stack: string;
				code: string;
			};
			error: true;
		} | {
			result: string;
			error: false;
		});
	}

	interface ReloadMessage {
		op: "reload";
		msg: {
			type: "command" | "category";
			data: string;
		};
	}

	interface String {
		format<T extends string = string>(...args: T[]): string;
	}

	namespace Vote {
		interface DBLVote {
			user: string;
			type: "upvote" | "test";
			weekend: boolean;
			query: string;
			time: number;
		}
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

	type DeepPartial<T> = {
		[P in keyof T]?: Partial<T[P]>;
	}

	type ArrayOneOrMore<T> = {
		0: T;
	} & T[];

	type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

	type OverloadedReturnType<T> =
		T extends { (...args: any[]): infer R; (...args: any[]): infer R; (...args: any[]): infer R; (...args: any[]): infer R } ? R :
		T extends { (...args: any[]): infer R; (...args: any[]): infer R; (...args: any[]): infer R } ? R :
		T extends { (...args: any[]): infer R; (...args: any[]): infer R } ? R :
		T extends (...args: any[]) => infer R ? R : any;

	type ReturnTypeWithArgs<T extends (...args: any[]) => any, ARGS_T> =
		Extract<
			T extends { (...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; (...args: infer A4): infer R4; } ? [A1, R1] | [A2, R2] | [A3, R3] | [A4, R4] :
			T extends { (...args: infer A1): infer R1; (...args: infer A2): infer R2; (...args: infer A3): infer R3; } ? [A1, R1] | [A2, R2] | [A3, R3] :
			T extends { (...args: infer A1): infer R1; (...args: infer A2): infer R2; } ? [A1, R1] | [A2, R2] :
			T extends { (...args: infer A1): infer R1; } ? [A1, R1] :
			never,
			[ARGS_T, any]
		>[1];

	interface Warning {
		blameId: string;
		guildId: string;
		userId: string;
		id: string | number; // string is legacy
		reason: string;
		date: number;
	}

	namespace ModLogEntry {
		interface GenericEntry {
			pos: number;
			reason: string;
			type: string;
			guildId: string;
			messageId?: string; // due to the way ModLogUtil works, this may be missing
		}

		interface ChannelLockEntry extends GenericEntry {
			blame: string;
			target: string;
			type: "lock";
		}

		interface ChannelUnlockEntry extends GenericEntry {
			blame: string;
			target: string;
			type: "unlock";
		}

		interface WarnEntry extends GenericEntry {
			blame: string;
			target: string;
			id: number;
			type: "warn";
		}

		interface ClearWarningsEntry extends GenericEntry {
			blame: string;
			target: string;
			totalWarnings: number;
			type: "clearwarnings";
		}

		interface DeleteWarnEntry extends GenericEntry {
			blame: string;
			oldBlame: string;
			target: string;
			id: string | number; // string is legacy
			type: "delwarn";
		}

		interface KickEntry extends GenericEntry {
			blame: string;
			target: string;
			type: "kick";
		}

		interface UnbanEntry extends GenericEntry {
			blame: string;
			target: string;
			type: "unban";
		}

		interface UnmuteEntry extends GenericEntry {
			blame: string;
			target: string;
			type: "unmute";
		}

		interface SoftBanEntry extends GenericEntry {
			blame: string;
			target: string;
			deleteDays?: number;
			type: "softban";
		}

		interface BanEntry extends GenericEntry {
			blame: string;
			target: string;
			time?: number;
			deleteDays?: number;
			type: "ban";
		}

		interface MuteEntry extends GenericEntry {
			blame: string;
			target: string;
			time?: number;
			type: "mute";
		}

		type ModLogEntry = ChannelLockEntry | ChannelUnlockEntry | WarnEntry | ClearWarningsEntry | DeleteWarnEntry | KickEntry | UnbanEntry | UnmuteEntry | SoftBanEntry | BanEntry | MuteEntry;
	}

	type FilterFlags<Base, Condition> = {
		[Key in keyof Base]: Base[Key] extends Condition ? Key : never;
	};
	type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];
	type BetterFilter<Base, Condition> = Pick<Base, keyof Omit<Base, AllowedNames<Base, Condition>>>;
	type WithoutFunctions<T> = BetterFilter<T, Function>;

	namespace NodeJS {
		interface Global {
			bot: FurryBot;
		}
	}

	namespace Blacklist {
		interface GenericEntry {
			created: number;
			type: "user" | "guild";
			blame: string;
			blameId: string;
			reason: string;
			id: string;
			noticeShown: boolean;
			expire?: number;
			userId?: string;
			guildId?: string;
			report?: string;
		}

		interface GuildEntry extends GenericEntry {
			type: "guild";
			guildId: string;
		}

		interface UserEntry extends GenericEntry {
			type: "user";
			userId: string;
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

	namespace Socials {

		type AnySocial = Twitter | Reddit | DiscordBio | Website | Patreon;

		interface Twitter {
			type: "twitter";
			username: string;
			id: string;
		}

		interface Reddit {
			type: "reddit";
			username: string;
			id: string;
		}

		interface DiscordBio {
			type: "discord.bio";
			id: string; // used id but we need a common format here
			slug: string; // can change very easily but who cares
		}

		interface Website {
			type: "website";
			id: string; // the verification meta
			url: string;
		}

		interface Patreon {
			type: "patreon";
			id: string;
			amount: number;
		}
	}
}
