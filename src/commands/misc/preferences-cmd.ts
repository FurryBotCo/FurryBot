import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"preferences"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Manage your personal preferences.",
	usage: "<pref> <option>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const settings = {
		mention: "boolean"
	};

	const booleanChoices = {
		enabled: true,
		enable: true,
		e: true,
		true: true,
		disabled: false,
		disable: false,
		d: false,
		false: false
	};

	if (msg.args.length === 0 || ["list", "ls"].some(s => msg.args[0].toLowerCase().indexOf(s) !== -1)) return msg.reply(`valid preferences: **${Object.keys(settings).join("**, **")}**`);
	const c = msg.args[0].toLowerCase();
	const s = Object.values(settings)[Object.keys(settings).map(s => s.toLowerCase()).indexOf(c.toLowerCase())];
	const set = Object.keys(settings)[Object.keys(settings).map(s => s.toLowerCase()).indexOf(c.toLowerCase())];
	if (!Object.keys(settings).map(s => s.toLowerCase()).includes(c)) return msg.reply(`Invalid setting. You can use \`${msg.gConfig.settings.prefix}preferences list\` to list preferences.`);
	if (msg.args.length === 1) return msg.reply(`The preference ${set} is currently set to ${msg.uConfig.preferences[set]}.`);
	else {
		let o;
		switch (s) {
			case "boolean":
				if (!Object.keys(booleanChoices).includes(msg.args[1].toLowerCase())) return msg.reply(`Invalid choice, must be one of "enabled", "disabled".`);
				o = msg.uConfig.preferences[set];
				await msg.uConfig.edit({ preferences: { [set]: booleanChoices[msg.args[1].toLowerCase()] } });
				return msg.reply(`Changed the preference **${set}** from "${o ? "enabled" : "disabled"}" to "${booleanChoices[msg.args[1].toLowerCase()] ? "enabled" : "disabled"}".`);
				break;

			case "string":
				o = msg.uConfig.preferences[set];
				await msg.uConfig.edit({ preferences: { [set]: msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" ") } });
				return msg.reply(`Changed the preference **${set}** from "${o}" to "${msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" ")}"`);
				break;

		}
	}
}));
