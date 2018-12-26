module.exports = {
	triggers: [
        "sofurry",
        "sf"
    ],
	userPermissions: [],
	botPermissions: [
        "ATTACH_FILES",
        "EMBED_LINKS"
    ],
	cooldown: 2e3,
	description: "Get a random post from sofurry!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
        const contentType = [
            "story",
            "art",
            "music",
            "journal",
            "photo"
        ]
        var req = await client.request("https://api2.sofurry.com/browse/search?search=furry&format=json&minlevel=0&maxlevel=0",{
            method: "GET",
            headers: {
                "User-Agent": client.config.web.userAgent
            }
        });
        try {
            var jsn = JSON.parse(req.body);
            var rr = Math.floor(Math.random()*jsn.data.entries.length);
            var submission = jsn.data.entries[rr];
            if(typeof submission.contentLevel === "undefined") throw new Error("secondary");
            if(submission.contentLevel !== 0) {
                client.logger.log(`unsafe image:\n${client.util.inspect(submission,{depth:3,showHidden:true})}`);
                client.logger.log(`Body: ${client.inspect(jsn,{depth:null})}`);
                return message.reply("Image API returned a non-safe image! Please try again later.");
            }
            var short = await client.shortenUrl(`http://www.sofurry.com/view/${submission.id}`);
            var extra = short.new ? `**This is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
            if([1,4].includes(submission.contentType)) {
                var attachment = new client.Discord.MessageAttachment(submission.full,"sofurry.png");
                return message.channel.send(`${extra}${submission.title} (type ${client.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<${short.url}>\nRequested By: ${message.author.tag}`,attachment);
            } else {
                return message.channel.send(`${extra}${submission.title} (type ${client.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<http://www.sofurry.com/view/${submission.id}>\nRequested By: ${message.author.tag}`);
            }
        }catch(e){
            client.logger.error(`Error:\n${e}`);
            client.logger.log(`Body: ${jsn}`);
            var attachment = new client.Discord.MessageAttachment(client.config.images.serverError);
            return message.channel.send("Unknown API Error",attachment);
        }
    })
};