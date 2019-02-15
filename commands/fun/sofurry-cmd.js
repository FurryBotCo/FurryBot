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
	run: (async function(message) {
        const contentType = [
            "story",
            "art",
            "music",
            "journal",
            "photo"
        ];
        var tags = message.unparseArgs.length > 0 ? message.unparseArgs.join("%20") : "furry";
        var bl = tags.match(this.config.tagBlacklist);
        if(bl !== null && bl.length > 0) return message.reply(`Your search contained blacklisted tags, **${bl.join("**, **")}**`);
        const msg = await message.channel.send(`Fetching.. ${this.config.emojis.load}`);
        var req = await this.request(`https://api2.sofurry.com/browse/search?search=${tags}&format=json&minlevel=0&maxlevel=0`,{
            method: "GET",
            headers: {
                "User-Agent": this.config.web.userAgent
            }
        });
        try {
            var jsn = JSON.parse(req.body);
            var rr = Math.floor(Math.random()*jsn.data.entries.length);
            var submission = jsn.data.entries[rr];
            if(typeof submission.contentLevel === "undefined") throw new Error("secondary");
            if(submission.contentLevel !== 0) {
                this.logger.log(`unsafe image:\n${this.util.inspect(submission,{depth:3,showHidden:true})}`);
                this.logger.log(`Body: ${this.inspect(jsn,{depth:null})}`);
                return msg.edit("Image API returned a non-safe image! Please try again later.").catch(err=>message.channel.send(`Command failed: ${err}`));
            }
            var short = await this.shortenUrl(`http://www.sofurry.com/view/${submission.id}`);
            var extra = short.new ? `**This is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
            if([1,4].includes(submission.contentType)) {
                var attachment = new this.Discord.MessageAttachment(submission.full,"sofurry.png");
                return msg.edit(`${extra}${submission.title} (type ${this.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<${short.url}>\nRequested By: ${message.author.tag}\nIf a bad image is returned, blame the service, not the bot author!`).catch(err=>message.channel.send(`Command failed: ${err}`)).then(()=>message.channel.send(attachment));
            } else {
                return msg.edit(`${extra}${submission.title} (type ${this.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<http://www.sofurry.com/view/${submission.id}>\nRequested By: ${message.author.tag}\nIf something bad is returned, blame the service, not the bot author!`).catch(err=>message.channel.send(`Command failed: ${err}`));
            }
        }catch(e){
            this.logger.error(`Error:\n${e}`);
            this.logger.log(`Body: ${jsn}`);
            var attachment = new this.Discord.MessageAttachment(this.config.images.serverError);
            return msg.edit("Unknown API Error").then(()=>message.channel.send(attachment)).catch(err=>message.channel.send(`Command failed: ${err}`));
        }
    })
};