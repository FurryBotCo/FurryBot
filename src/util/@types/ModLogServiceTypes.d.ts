import Eris from "eris";

declare namespace ModLogServiceTypes {
	// cluster provides string, we coerce it into user
	type Blame = string | Eris.User | "automatic";

	namespace Commands {
		interface GenericCommand {
			type: "lock" | "unlock" | "lockdown" | "unlockdown" | "warn" | "clearwarnings" | "delwarn" | "delwarn" | "kick" | "unban" | "unmute" | "softban" | "ban" | "mute";
			blame: Blame;
			channel: string;
			target: unknown;
			reason: string | null;
		}

		interface LockCommand extends GenericCommand {
			type: "lock";
			target: string;
		}

		interface UnLockCommand extends LockCommand {
			type: "unlock";
		}

		interface LockDownCommand extends GenericCommand {
			type: "lockdown";
			target: null;
		}

		interface UnLockdownCommand extends LockDownCommand {
			type: "unlockdown";
			target: null;
		}

		interface WarningCommand extends GenericCommand {
			type: "warning";
			target: string;
			warningId: number;
		}

		interface ClearWarningsCommand extends GenericCommand {
			type: "clearWarnings";
			target: string;
			total: number;
		}

		interface DeleteWarningCommand extends WarningCommand {
			type: "deleteWarning";
			oldBlame: string;
		}

		interface KickCommand extends GenericCommand {
			type: "kick";
			target: string;
		}

		interface UnBanCommand extends GenericCommand {
			type: "unban";
			target: string;
		}

		interface UnMuteCommand extends GenericCommand {
			type: "unmute";
			target: string;
		}

		interface SoftBanCommand extends GenericCommand {
			type: "softban";
			target: string;
			deleteDays: number | null;
		}

		interface BanCommand extends GenericCommand {
			type: "ban";
			target: string;
			deleteDays: number | null;
			expiry: number | null;
		}

		interface MuteCommand extends GenericCommand {
			type: "mute";
			target: string;
			expiry: number | null;
		}

		interface TimedActionCommand {
			type: "timedAction";
			subType: "ban" | "mute";
			time: number;
			expiry: number;
			user: string;
			guild: string;
			reason: string | null;
		}

		type AnyCommand = CommandMap[keyof CommandMap];

		interface CommandMap {
			"lock": LockCommand;
			"unlock": UnLockCommand;
			"lockdown": LockDownCommand;
			"unlockdown": UnLockdownCommand;
			"warning": WarningCommand;
			"clearWarnings": ClearWarningsCommand;
			"deleteWarning": DeleteWarningCommand;
			"kick": KickCommand;
			"unban": UnBanCommand;
			"unmute": UnMuteCommand;
			"softban": SoftBanCommand;
			"ban": BanCommand;
			"mute": MuteCommand;
			"timedAction": TimedActionCommand;
		}
	}
}

export = ModLogServiceTypes;
