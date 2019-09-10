import Command from "./Command";

export default class CommandError extends Error {
	constructor(cmd: Command | string, err: Error | string) {
		if (err instanceof Error) {
			const c = cmd instanceof Command ? cmd.triggers[0].toUpperCase() : cmd !== null ? cmd.toUpperCase() : "UNKNOWN";
			super(`${err.name}: ${err.message}\n${err.stack}`);
			this.name = `ERR_CMD_${c}`;
		}
		else {
			super(err);
			this.name = err;
		}
	}
}