import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

export default new Command({
	triggers: [
		"botlistinfo",
		"blinfo"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	description: "Get the info of a bot on botlists",
	usage: "<@bot/id>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let user: Eris.User, req, b, rs, list, embed, i;
	list = [];
	if (msg.args.length === 0) return new Error("ERR_INVALID_USAGE");
	// get user from message
	user = await msg.getUserFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	if (!user.bot) return msg.reply("You cannot look up users.");

	// botlist lookup
	req = await phin({
		method: "GET",
		url: `https://botblock.org/api/bots/${user.id}`
	});
	try {
		rs = JSON.parse(req.body.toString());
		for (let ls in rs.list_data) {
			const ll = rs.list_data[ls];
			if (ll[1] !== 200) continue;
			list.push(`[${ls}](https://api.furry.bot/botlistgo/${encodeURIComponent(ls)}/${encodeURIComponent(user.id)})`);
		}

		//list = Object.keys(this._.pickBy(rs.list_data,((val,key) => ([null,undefined,""].includes(val[0]) || ((typeof val[0].bot !== "undefined" && val[0].bot.toLowerCase() === "no bot found") || (typeof val[0].success !== "undefined" && [false,"false"].includes(val[0].success)))) ?  false : val[1] === 200))).map(list => ({name: list,url:`https://api.furry.bot/botlistgo.php?list=${list}&id=${user.id}`}));
	} catch (e) {
		this.logger.log({
			headers: req.headers,
			body: req.body.toString(),
			statusCode: req.statusCode
		});
		this.logger.error(e);
		rs = req.body;
		list = "Lookup Failed.";
	}

	i = 0;
	b = [];
	for (let key in list) {
		if (list[key].startsWith("(")) continue;
		if (typeof b[i] === "undefined") b[i] = "";
		if (b[i].length + list[key].length >= 1000) {
			i++;
			b[i] = list[key];
		} else {
			b[i] += `${list[key]}\n`;
		}
	}
	embed = {
		title: "Botlist Info",
		description: "All links redirect from our api to make keeping links up to date easier.\nNote: we use an external api to fetch these, so some may be wrongfully listed.",
		fields: [

		]
	};
	b.forEach((l, c) => {
		embed.fields.push({
			name: `List #${+c + 1}`,
			value: l,
			inline: false
		});
	});
	Object.assign(embed, msg.embed_defaults());
	embed.thumbnail = {
		url: user.avatarURL
	};
	msg.channel.createMessage({
		embed
	});
}));