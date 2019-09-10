import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";

export default new Command({
	triggers: [
		"regsetup"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 36e5,
	description: "Setup the registration command",
	usage: "",
	nsfw: false,
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	await msg.reply("registration is currently not setup here, would you like to set it up? You can reply with **yes** or **no**.");

	const d = await this.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4, (m: Eris.Message) => ["no", "yes"].includes(m.content.toLowerCase()));
	if (!d) return msg.reply("command timed out, try to be a little quicker..");
	if (d.content.toLowerCase() === "no") return msg.reply("you canceled.");

	const ask = (async (q, f = (m: Eris.Message) => m) => {
		await msg.reply(q);
		const c = await this.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4, f);
		if (!c) return "TIMEOUT";
		else return c.content;
	});
	await msg.reply("to setup registration, I need to know a few things about how you want it to work.");

	const logs = await ask("where would you like to send the registration logs? Like the responses, and a few other things. You can reply with either a channel, or **none** to skip.");

	if (logs === "TIMEOUT") return msg.reply("command timed out, try to be a little quicker..");
}));