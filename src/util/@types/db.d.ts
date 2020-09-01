import { ObjectId } from "mongodb";

declare global {
	interface DBEntry {
		_id?: ObjectId;
	}

	namespace ModLogEntry {
		interface GenericEntry extends DBEntry {
			pos: number;
			reason: string;
			type: string;
			guildId: string;
			messageId?: string;
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

		interface ServerLockdownEntry extends GenericEntry {
			blame: string;
			type: "lockdown";
		}

		interface ServerUnlockdownEntry extends GenericEntry {
			blame: string;
			type: "unlockdown";
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
			id: number;
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

	interface Warning {
		blameId: string;
		guildId: string;
		userId: string;
		id: number;
		reason: string;
		date: number;
	}

	interface TimedEntry<T extends "mute" | "ban" = "mute" | "ban"> extends DBEntry {
		time: number;
		expiry: number;
		userId: string;
		guildId: string;
		type: T;
		reason: string;
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

	namespace Votes {
		interface DBLVote {
			user: string;
			type: "upvote" | "test";
			weekend: boolean;
			query: string;
			time: number;
		}
	}

}
