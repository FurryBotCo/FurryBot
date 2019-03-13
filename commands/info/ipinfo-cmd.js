module.exports = {
	triggers: [
		"ipinfo",
		"ip"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 18e5,
	description: "Get info on an ip address",
	usage: "<IPv4/IPv6>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
		let req, data, embed;
		if(this.config.apis.ipinfo.regex.ipv4.test(message.unparsedArgs.join(" ")) || this.config.apis.ipinfo.regex.ipv6.test(message.unparsedArgs.join(" "))) {
			req = await this.request(`https://ipapi.co/${message.unparsedArgs.join(" ")}/json`,{
				method: "GET",
				headers: {
					"User-Agent": this.config.web.userAgent
				}
			}).then(rq => JSON.parse(rq.body));
			if(req.error || req.reserved) {
				console.log(req);
				if(![undefined,null,""].includes(req.message)) return message.reply(`Error processing request: ${req.reason}.`);
				if(req.reserved) return message.reply("The supplied ip is a reserved ip, these have no specific information associated with them.");
			}

			data = {
				title: `IP Info for ${req.ip}`,
				fields: [
					{
						name: "Location",
						value: `${req.city}, ${req.region} (${req.region_code}) - ${req.country_name} (lat: ${req.latitude} long: ${req.longitude})`,
						inline: false
					},{
						name: "Owner",
						value: `${req.org} (${req.asn})`,
						inline: false
					},{
						name: "Timezone",
						value: `${req.timezone} (UTC-${req.utc_offset})`,
						inline: false
					}
				]
			};
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else {
			return message.reply("Invalid ip address.");
		}
	})
};