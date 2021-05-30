declare namespace DBCommands {
	interface GenericCommand {
		type: "db" | "redis";
	}

	interface GetUserCommand {
		type: "db";
		cmd: "getUser";
		data: string;
	}

	interface GetGuildCommand {
		type: "db";
		cmd: "getGuild";
		data: string;
	}
}
export = DBCommands;
