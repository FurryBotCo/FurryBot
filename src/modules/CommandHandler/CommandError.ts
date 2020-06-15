import Command from "./Command";

type Values = "ERR_INVALID_USAGE";
export default class CommandError extends Error {
	cmd: Command;
	message: Values;
	constructor(message: Values, cmd: Command) {
		super(message);
		this.name = "CommandError";
		this.cmd = cmd;
	}
}
