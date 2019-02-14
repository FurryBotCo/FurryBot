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
        ];
        var tags = message.unparseArgs.length > 0 ? message.unparseArgs.join("%20") : "furry";
        var bl = tags.match(client.config.tagBlacklist);
        if(bl !== null && bl.length > 0) return message.reply(`Your search contained blacklisted tags, **${bl.join("**, **")}**`);
        const msg = await message.channel.send(`Fetching.. ${client.config.emojis.load}`);
        var req = await client.request(`https://api2.sofurry.com/browse/search?search=${tags}&format=json&minlevel=0&maxlevel=0`,{
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
                return msg.edit("Image API returned a non-safe image! Please try again later.").catch(err=>message.channel.send(`Command failed: ${err}`));
            }
            var short = await client.shortenUrl(`http://www.sofurry.com/view/${submission.id}`);
            var extra = short.new ? `**This is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
            if([1,4].includes(submission.contentType)) {
                var attachment = new client.Discord.MessageAttachment(submission.full,"sofurry.png");
                return msg.edit(`${extra}${submission.title} (type ${client.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<${short.url}>\nRequested By: ${message.author.tag}\nIf a bad image is returned, blame the service, not the bot author!`).catch(err=>message.channel.send(`Command failed: ${err}`)).then(()=>message.channel.send(attachment));
            } else {
                return msg.edit(`${extra}${submission.title} (type ${client.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<http://www.sofurry.com/view/${submission.id}>\nRequested By: ${message.author.tag}\nIf something bad is returned, blame the service, not the bot author!`).catch(err=>message.channel.send(`Command failed: ${err}`));
            }
        }catch(e){
            client.logger.error(`Error:\n${e}`);
            client.logger.log(`Body: ${jsn}`);
            var attachment = new client.Discord.MessageAttachment(client.config.images.serverError);
            return msg.edit("Unknown API Error").then(()=>message.channel.send(attachment)).catch(err=>message.channel.send(`Command failed: ${err}`));
        }
    })
};