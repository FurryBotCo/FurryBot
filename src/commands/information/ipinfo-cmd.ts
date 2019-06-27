import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

export default new Command({
	triggers: [
		"ipinfo",
		"ip"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 18e5,
	description: "Get info on an ip address",
	usage: "<IPv4/IPv6>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
	let req, embed: Eris.EmbedOptions;
	//		if(config.apis.ipinfo.regex.ipv4.test(msg.unparsedArgs.join(" ")) || config.apis.ipinfo.regex.ipv6.test(msg.unparsedArgs.join(" "))) {
	req = await phin({
		method: "GET",
		url: `https://ipapi.co/${msg.unparsedArgs.join(" ")}/json`,
		headers: {
			"User-Agent": config.web.userAgent
		}
	}).then(rq => JSON.parse(rq.body.toString()));
	if (req.error || req.reserved) {
		if (![undefined, null, ""].includes(req.reason)) return msg.channel.createMessage(`<@!${msg.author.id}>, Error processing request: ${req.reason}.`);
		if (req.reserved) return msg.channel.createMessage(`<@!${msg.author.id}>, The supplied ip is a reserved ip, these have no specific information associated with them.`);
	}

	embed = {
		title: `IP Info for ${req.ip}`,
		fields: [{
			name: "Location",
			value: `${req.city}, ${req.region} (${req.region_code}) - ${req.country_name} (lat: ${req.latitude} long: ${req.longitude})`,
			inline: false
		}, {
			name: "Owner",
			value: `${req.org} (${req.asn})`,
			inline: false
		}, {
			name: "Timezone",
			value: `${req.timezone} (UTC-${req.utc_offset})`,
			inline: false
		}]
	};
	return msg.channel.createMessage({
		embed
	});
	//		} else {
	//			return msg.channel.createMessage("Invalid ip address.");
	//		}
}));