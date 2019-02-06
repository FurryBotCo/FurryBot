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
	run: (async (client,message) => {
        if(message.unparsedArgs.length < 1) return new Error("ERR_INVALID_USAGE");
        if(client.config.apis.ipinfo.regex.ipv4.test(message.unparsedArgs.join(" ")) || client.config.apis.ipinfo.regex.ipv6.test(message.unparsedArgs.join(" "))) {
            const req = await client.request(`https://ipapi.co/${message.unparsedArgs.join(" ")}/json`,{
                method: "GET",
                headers: {
                    "User-Agent": client.config.web.userAgent
                }
            }).then(rq=>JSON.parse(rq.body));
            if(req.error || req.reserved) {
                console.log(req);
                if(![undefined,null,""].includes(req.message)) return message.reply(`Error processing request: ${req.reason}.`);
                if(req.reserved) return message.reply("The supplied ip is a reserved ip, these have no specific information associated with them.");
            }

            var data = {
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
            }
            var embed = new client.Discord.MessageEmbed(data);
            return message.channel.send(embed);
        } else {
            return message.reply("Invalid ip address.");
        }
    })
}