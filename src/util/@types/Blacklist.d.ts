declare namespace Blacklist {
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
export = Blacklist;
