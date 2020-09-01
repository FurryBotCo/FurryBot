import Command from "./Command";



export default class CommandError<N extends "ERR_INVALID_USAGE" = any> extends Error {
	cmd: Command;
	message: N;
	extra: string;
	constructor(type: N, cmd: Command, extra?: string) {
		super(type);
		this.name = "CommandError";
		this.cmd = cmd;
		this.extra = extra ?? "";
	}
}
