import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";
import GuildConfig from "@src/modules/config/GuildConfig";

export default new Command({
	triggers: [
		"server",
		"s",
		"guild",
		"g"
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
	let id, srv: GuildConfig, blacklistReason, embed: Eris.EmbedOptions;
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	id = msg.args[0];
	if (id.length < 17 || id.length > 18) return msg.reply(`**${id}** isn't a valid server id.`);
	srv = await mdb.collection("guilds").findOne({ id });
	if (!srv) {
		console.debug(`Created guild entry for ${id}`);
		await mdb.collection("guilds").insertOne(Object.assign(config.defaults.guildConfig, { id }));
		srv = await mdb.collection("guilds").findOne({ id });
	}

	if (!srv) return msg.reply(`Failed to create guild entry for **${id}**`);
	if (srv.blacklist.blacklisted) return msg.reply(`**${id}** is already blacklisted, reason: ${srv.blacklist.reason}.`);
	else {
		blacklistReason = msg.args.length > 1 ? msg.args.slice(1, msg.args.length).join(" ") : "No Reason Specified";
		await mdb.collection("guilds").findOneAndUpdate({ id }, { $set: { blacklist: { blacklisted: true, reason: blacklistReason, blame: msg.author.tag } } });
		embed = {
			title: "Server Blacklisted",
			description: `Id: ${id}\nReason: ${blacklistReason}\nBlame: ${msg.author.tag}`
		};
		Object.assign(embed, msg.embed_defaults());
		await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, { embeds: [embed], username: `Blacklist Logs${config.beta ? " - Beta" : ""}` });
		return msg.reply(`Added **${id}** to the blacklist, reason: ${blacklistReason}.`);
	}
}));