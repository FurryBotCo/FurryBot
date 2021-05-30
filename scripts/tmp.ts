import config from "../src/config";
import { ApplicationCommandOptionType } from "slash-extras";
import { Strings } from "utilities";
import { ApplicationCommandOption } from "slash-commands";
import util from "util";

const value = config.settings.map(set => {
	const type  = set.type === "boolean" ? ApplicationCommandOptionType.BOOLEAN :
		set.type === "role" ? ApplicationCommandOptionType.ROLE : null;
	if (type === null) {
		switch (set.dbName) {
			case "defaultYiffType": return {
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: set.name,
				description: set.description,
				options: [
					{
						type: ApplicationCommandOptionType.STRING,
						name: set.dbName,
						description: set.description,
						required: true,
						choices: config.yiffTypes.map(v => ({
							name: Strings.ucwords(v),
							value: v
						}))
					}
				]
			};
			case "lang": return {
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: set.name,
				description: set.description,
				options: [
					{
						type: ApplicationCommandOptionType.STRING,
						name: set.dbName,
						description: set.description,
						required: true,
						choices: config.languages.map(v => ({
							name: v,
							value: v
						}))
					}
				]
			};

			default: return null;
		}
	} else return {
		type: ApplicationCommandOptionType.SUB_COMMAND,
		name: set.name,
		description: set.description,
		options: [
			{
				type,
				name: "value",
				description: set.description,
				required: true
			}
		]
	};
}).filter(Boolean) as Array<ApplicationCommandOption>;

console.log(util.inspect(value, { depth: null, colors: true }));
