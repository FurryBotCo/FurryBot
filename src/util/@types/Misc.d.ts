declare namespace MiscTypes {
	export type DeepPartial<T> = {
		[P in keyof T]?: Partial<T[P]>;
	}

	export type ArrayOneOrMore<T> = {
		0: T;
	} & T[];
}

declare namespace MiscTypes.Blacklist {
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
export = MiscTypes;