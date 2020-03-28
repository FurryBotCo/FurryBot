import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import config from "../../config";
import phin from "phin";

export default new Command({
	triggers: [
		"ipinfo",
		"ip"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.unparsedArgs.length < 1) throw new Error("ERR_INVALID_USAGE");
	// if(config.apis.ipinfo.regex.ipv4.test(msg.unparsedArgs.join(" ")) || config.apis.ipinfo.regex.ipv6.test(msg.unparsedArgs.join(" "))) {
	const req = await phin({
		method: "GET",
		url: `https://ipapi.co/${msg.unparsedArgs.join(" ")}/json`,
		headers: {
			"User-Agent": config.web.userAgent
		},
		timeout: 5e3
	}).then(rq => JSON.parse(rq.body.toString()));
	if (req.error || req.reserved) {
		if (![undefined, null, ""].includes(req.reason)) return msg.channel.createMessage(`<@!${msg.author.id}>, Error processing request: ${req.reason}.`);
		if (req.reserved) return msg.reply("{lang:commands.information.ipinfo.reserved}");
	}


	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle(`{lang:commands.information.ipinfo.title|${req.ip}}`)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.addField("{lang:commands.information.ipinfo.location}", `${req.city}, ${req.region} (${req.region_code}) - ${req.country_name} ({lang:commands.information.ipinfo.lat}: ${req.latitude} {lang:commands.information.ipinfo.long}: ${req.longitude})`)
			.addField("{lang:commands.information.ipinfo.owner}", `${req.org} (${req.asn})`)
			.addField("{lang:commands.information.ipinfo.timezone}", `${req.timezone} (UTC-${req.utc_offset})`)
	});
}));
