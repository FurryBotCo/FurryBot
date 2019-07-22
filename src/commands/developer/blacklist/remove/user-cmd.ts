import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";
import UserConfig from "@src/modules/config/UserConfig";

export default new Command({
	triggers: [
		"user",
		"u"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	description: "",
	usage: "",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let u, id, usr: UserConfig, embed: Eris.EmbedOptions;
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	u = await msg.getUserFromArgs();
	if (!u) return msg.reply(`**${msg.args[0]}** isn't a valid user.`);
	id = u.id;
	usr = await mdb.collection("users").findOne({ id });
	if (!usr) {
		console.debug(`Created user entry for ${id}`);
		await mdb.collection("users").insertOne({ ...config.defaults.userConfig, ...{ id } });
		usr = await mdb.collection("users").findOne({ id });
	}

	if (!usr) return msg.reply(`Failed to create user entry for **${id}**`);
	if (!usr.blacklist.blacklisted) return msg.reply(`**${id}** is not blacklisted`);
	else {
		await mdb.collection("users").findOneAndUpdate({ id }, { $set: { blacklist: { blacklisted: false, reason: null, blame: null } } });
		embed = {
			title: "User Unblacklisted",
			description: `Id: ${id}\nTag: ${u.username}#${u.discriminator}\nPrevious Reason: ${usr.blacklist.reason}\nBlame: ${msg.author.tag}`,
			timestamp: new Date().toISOString(),
			color: functions.randomColor()
		};

		await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
			embeds: [embed],
			username: `Blacklist Logs${config.beta ? " - Beta" : ""}`,
			avatarURL: "https://assets.furry.bot/blacklist_logs.png"
		});
		return msg.reply(`Removed **${u.username}#${u.discriminator}** (${id}) from the blacklist, previous reason: ${usr.blacklist.reason}.`);
	}
}));