import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";
import Permissions from "../../util/Permissions";

export default new Command({
	triggers: [
		"ipinfo",
		"ip"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 1e4,
	donatorCooldown: .5e4,
	description: "Get info about an ip address.",
	usage: "<ip>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.unparsedArgs.length === 0) throw new Error("ERR_INVALID_USAGE");
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
		if (req.reserved) return msg.channel.createMessage(`<@!${msg.author.id}>, The supplied ip is a reserved ip, these have no specific information associated with them.`);
	}

	const embed: Eris.EmbedOptions = {
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
}));
