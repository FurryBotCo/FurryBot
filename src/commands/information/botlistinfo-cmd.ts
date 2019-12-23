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
		"botlistinfo",
		"blinfo"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 1e4,
	donatorCooldown: 1e4,
	description: "Get some info about a bot from some botlists.",
	usage: "<@bot/id>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	let list;
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");
	// get user from message
	const user = await msg.getUserFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	if (!user.bot) return msg.reply("You cannot look up users.");

	// botlist lookup
	const req = await phin({
		method: "GET",
		url: `https://botblock.org/api/bots/${user.id}`,
		timeout: 5e3
	});

	let rs;
	try {
		rs = JSON.parse(req.body.toString());
		for (const ls in rs.list_data) {
			const ll = rs.list_data[ls];
			if (ll[1] !== 200) continue;
			list.push(`[${ls}](https://api.furry.bot/botlistgo/${encodeURIComponent(ls)}/${encodeURIComponent(user.id)})`);
		}

		// list = Object.keys(this._.pickBy(rs.list_data,((val,key) => ([null,undefined,""].includes(val[0]) || ((typeof val[0].bot !== "undefined" && val[0].bot.toLowerCase() === "no bot found") || (typeof val[0].success !== "undefined" && [false,"false"].includes(val[0].success)))) ?  false : val[1] === 200))).map(list => ({name: list,url:`https://api.furry.bot/botlistgo.php?list=${list}&id=${user.id}`}));
	} catch (e) {
		Logger.log(`Shard #${msg.channel.guild.shard.id}`, {
			headers: req.headers,
			body: req.body.toString(),
			statusCode: req.statusCode
		});
		Logger.error(e, msg.guild.shard.id);
		rs = req.body;
		list = "Lookup Failed.";
	}

	let i = 0;
	const b = [];
	for (const key in list) {
		if (list[key].startsWith("(")) continue;
		if (typeof b[i] === "undefined") b[i] = "";
		if (b[i].length + list[key].length >= 1000) {
			i++;
			b[i] = list[key];
		} else {
			b[i] += `${list[key]}\n`;
		}
	}

	const embed = {
		title: "Botlist Info",
		description: "All links redirect from our api to make keeping links up to date easier.\nNote: we use an external api to fetch these, so some may be wrongfully listed.",
		fields: [

		],
		color: this.f.randomColor(),
		timestamp: new Date().toISOString()
	};
	b.forEach((l, c) => {
		embed.fields.push({
			name: `List #${+c + 1}`,
			value: l,
			inline: false
		});
	});

	return msg.channel.createMessage({
		embed
	});
}));
