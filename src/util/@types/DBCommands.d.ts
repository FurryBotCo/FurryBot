/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace DBCommands {
	interface GenericCommand {
		type: "db" | "redis";
	}

	interface GetCommand {
		cmd: "get";
		data: {
			id: string;
			createIfNotExists: boolean;
			table: string;
			db?: string;
		};
	}

	interface FilterCommand {
		cmd: "filter";
		data: {
			filter: any;
			table: string;
			db?: string;
		};
	}

	interface UpdateCommand {
		cmd: "update";
		data: {
			id: string;
			createIfNotExists: boolean;
			table: string;
			db?: string;
			data: any;
		};
	}

	interface ReplaceCommand {
		cmd: "replace";
		data: {
			id: string;
			createIfNotExists: boolean;
			table: string;
			db?: string;
			data: any;
		};
	}

	interface InsertCommand {
		cmd: "insert";
		data: {
			id: string;
			table: string;
			db?: string;
			data: any;
		};
	}

	interface DeleteCommand {
		cmd: "delete";
		data: {
			id: string;
			table: string;
			db?: string;
		};
	}

	interface PingCommand {
		cmd: "ping";
	}

	type AnyDBCommand = GetCommand | FilterCommand | UpdateCommand | ReplaceCommand | InsertCommand | DeleteCommand;
	type AnyRedisCommand = never;

	type AnyCommand = AnyDBCommand | AnyRedisCommand;
}
export = DBCommands;
