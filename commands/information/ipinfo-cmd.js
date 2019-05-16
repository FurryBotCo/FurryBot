module.exports = {
	triggers: [
		"ipinfo",
		"ip"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 18e5,
	description: "Get info on an ip address",
	usage: "<IPv4/IPv6>",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		if(message.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
		let req, embed;
		//		if(this.config.apis.ipinfo.regex.ipv4.test(message.unparsedArgs.join(" ")) || this.config.apis.ipinfo.regex.ipv6.test(message.unparsedArgs.join(" "))) {
		req = await this.request(`https://ipapi.co/${message.unparsedArgs.join(" ")}/json`,{
			method: "GET",
			headers: {
				"User-Agent": this.config.web.userAgent
			}
		}).then(rq => JSON.parse(rq.body));
		if(req.error || req.reserved) {
			if(![undefined,null,""].includes(req.reason)) return message.channel.createMessage(`<@!${message.author.id}>, Error processing request: ${req.reason}.`);
			if(req.reserved) return message.channel.createMessage(`<@!${message.author.id}>, The supplied ip is a reserved ip, these have no specific information associated with them.`);
		}

		embed = {
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
		return message.channel.createMessage({ embed });
		//		} else {
		//			return message.channel.createMessage("Invalid ip address.");
		//		}
	})
};