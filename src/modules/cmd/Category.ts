import ExtendedMessage from "../extended/ExtendedMessage";
import Command from "./Command";

class Category {
	name: string;
	displayName: string;
	description: string;
	triggers: string[];
	commands: Command[];
	path: string;
	constructor(data: {
		name: string;
		displayName: string;
		description: string;
		triggers?: string[];
		commands?: Command[];
		path: string;
	}) {
		if (![undefined, null].includes(data.name)) this.name = data.name;
		if (![undefined, null].includes(data.displayName)) this.displayName = data.displayName;
		if (![undefined, null].includes(data.description)) this.description = data.description;
		if (![undefined, null].includes(data.triggers)) this.triggers = data.triggers;
		if (![undefined, null].includes(data.commands)) this.commands = data.commands;
		if (![undefined, null].includes(data.path)) this.path = data.path;
	}
}

module.exports = Category;
export default Category;