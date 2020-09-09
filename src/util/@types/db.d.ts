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
			target: string;
			guildId: string;
			blame: string;
			creationDate?: number; // old entries (before 9/XX/2020) will not have a creation date
			messageId?: string;
		}

		interface ChannelLockEntry extends GenericEntry {
			type: "lock";
		}

		interface ChannelUnlockEntry extends GenericEntry {
			type: "unlock";
		}

		interface ServerLockdownEntry extends Omit<GenericEntry, "target"> {
			type: "lockdown";
		}

		interface ServerUnlockdownEntry extends Omit<GenericEntry, "target"> {
			type: "unlockdown";
		}

		interface WarnEntry extends GenericEntry {
			id: number;
			type: "warn";
		}

		interface ClearWarningsEntry extends GenericEntry {
			totalWarnings: number;
			type: "clearwarnings";
		}

		interface DeleteWarnEntry extends GenericEntry {
			oldBlame: string;
			id: number;
			type: "delwarn";
		}

		interface KickEntry extends GenericEntry {
			type: "kick";
		}

		interface UnbanEntry extends GenericEntry {
			type: "unban";
		}

		interface UnmuteEntry extends GenericEntry {
			type: "unmute";
		}

		interface SoftBanEntry extends GenericEntry {
			deleteDays?: number;
			type: "softban";
		}

		interface BanEntry extends GenericEntry {
			expiry?: number;
			deleteDays?: number;
			type: "ban";
		}

		interface MuteEntry extends GenericEntry {
			expiry?: number;
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
