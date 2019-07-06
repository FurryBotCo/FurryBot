import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import chunk from "chunk";
import { mdb } from "@modules/Database";
import UserConfig from "@modules/config/UserConfig";

export default new Command({
	triggers: [
		"warnlog"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Check the warnings a user has",
	usage: "<@member/id> [page]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let user, page, mn, warnings, embed, wr, pages, fields, w, usr, blame;

	// this code is awful, but I can't be bothered to rewrite it right now
	if (msg.args.length === 0 || !msg.args || (!msg.args[0] && msg.args[0].length < 17)) {
		user = msg.member;
		page = ![undefined, null, ""].includes(msg.args[0]) && !msg.args[0] && msg.args[0].length < 17 ? msg.args[0] : 1;
	} else {
		if (![undefined, null, ""].includes(msg.args[0]) && msg.args[0] && msg.args[0].length >= 17) {
			page = msg.args[0];
			mn = 1;
		} else {
			page = ![undefined, null, ""].includes(msg.args[0]) && !msg.args[0] && msg.args[0].length < 17 ? msg.args[0] : 1; // lgtm [js/useless-assignment-to-message]
		}

		if (![undefined, null, ""].includes(msg.args[1]) && msg.args[1] && msg.args[1].length >= 17) {
			page = msg.args[1];
			mn = 0;
		} else {
			page = ![undefined, null, ""].includes(msg.args[1]) && !msg.args[1] && msg.args[1].length < 17 ? msg.args[1] : 1;
		}

		if (!mn) mn = 1;

		user = await msg.getMemberFromArgs(mn);
	}


	if (!user) return msg.errorEmbed("INVALID_USER");

	warnings = await mdb.collection("users").findOne({ id: user.id }).then(res => new UserConfig(msg.author.id, res)).then(res => res.warnings.filter(w => w.gid === msg.channel.guild.id).sort((s, g) => s.wid < g.wid ? -1 : s.wid > g.wid ? 1 : 0).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
	if (warnings.length <= 0) {
		embed = {
			title: "No Warnings Found",
			description: `No warnings were found for the specified user **${user.username}#${user.discriminator}**`,
			color: 41728
		};
		Object.assign(embed, msg.embed_defaults("color"));
		return msg.channel.createMessage({ embed });

	}
	wr = chunk(warnings, 10);
	pages = wr.length;
	if ([undefined, null, ""].includes(page)) page = 1;
	if (page > pages) return msg.channel.createMessage("Invalid page number.");
	fields = [];
	for (const key in wr[page - 1]) {
		w = wr[page - 1][key];
		usr = await this.getRESTUser(w.blame);
		blame = !usr ? "Unknown" : `${usr.username}#${usr.discriminator}`;
		fields.push({
			name: `#${w.wid} - ${new Date(w.timestamp).toDateString()} by **${blame}**`,
			value: w.reason,
			inline: false
		});
	}
	embed = {
		title: `Warn Log for **${user.username}#${user.discriminator}** - Page ${page}/${pages}`,
		fields
	};
	Object.assign(embed, msg.embed_defaults());
	msg.channel.createMessage({ embed });
}));