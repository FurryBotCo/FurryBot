export default class ConfigError extends Error {
	constructor(args) {
		let error;
		switch (typeof args) {
			case "object":
				for (const key in args) {
					if (key === "name") {
						error = `${error}${args[key]}`;
					} else {
						error = `${error}\n${key}: ${args[key]}`;
					}
				}
				break;

			case "string":
				error = args;
				break;

			default:
				throw new Error("Error input must be an object or string");
		}
		super(error);
	}
}