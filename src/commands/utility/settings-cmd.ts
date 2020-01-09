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
		"settings"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 1e3,
	donatorCooldown: 1e3,
	description: "Edit this servers settings.",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const settings = {
		nsfw: "boolean",
		muteRole: "role",
		fResponse: "boolean",
		commandImages: "boolean",
		lang: "string",
		deleteModCmds: "boolean"
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

	if (msg.args.length === 0 || ["list", "ls"].some(s => msg.args[0].toLowerCase().indexOf(s) !== -1)) return msg.reply(`valid settings: **${Object.keys(settings).join("**, **")}**`);
	const c = msg.args[0].toLowerCase();
	const s = Object.values(settings)[Object.keys(settings).map(s => s.toLowerCase()).indexOf(c.toLowerCase())];
	const set = Object.keys(settings)[Object.keys(settings).map(s => s.toLowerCase()).indexOf(c.toLowerCase())];
	if (!Object.keys(settings).map(s => s.toLowerCase()).includes(c)) return msg.reply(`Invalid setting. You can use \`${msg.gConfig.settings.prefix}settings list\` to list settings.`);
	if (msg.args.length === 1) return msg.reply(`The setting ${set} is currently set to ${msg.gConfig.settings[set]}.`);
	else {
		let o;
		switch (s) {
			case "role":
				const r = await msg.getRoleFromArgs(1);
				o = msg.gConfig.settings[set];
				if (!r) return msg.errorEmbed("INVALID_ROLE");

				await msg.gConfig.edit({ settings: { [set]: r.id } });
				// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editSetting", setting: set as any, oldValue: o, newValue: r.id, timestamp: Date.now() });
				return msg.reply(`Changed the setting **${set}** from "${o}" to "${r.id}".`);
				break;

			case "boolean":
				if (!Object.keys(booleanChoices).includes(msg.args[1].toLowerCase())) return msg.reply(`Invalid choice, must be one of "enabled", "disabled".`);
				o = msg.gConfig.settings[set];
				await msg.gConfig.edit({ settings: { [set]: booleanChoices[msg.args[1].toLowerCase()] } });
				// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editSetting", setting: set as any, oldValue: o, newValue: booleanChoices[msg.args[1].toLowerCase()], timestamp: Date.now() });
				return msg.reply(`Changed the setting **${set}** from "${o ? "enabled" : "disabled"} to "${booleanChoices[msg.args[1].toLowerCase()] ? "enabled" : "disabled"}".`);
				break;

			case "string":
				o = msg.gConfig.settings[set];
				await msg.gConfig.edit({ settings: { [set]: msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" ") } });
				// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "editSetting", setting: set as any, oldValue: o, newValue: msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" "), timestamp: Date.now() });
				return msg.reply(`Changed the setting **${set}** from "${o}" to "${msg.unparsedArgs.slice(1, msg.unparsedArgs.length).join(" ")}`);
				break;

		}
	}
}));
