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
	run: (async(self,local)=>{
        const contentType = [
            "story",
            "art",
            "music",
            "journal",
            "photo"
        ]
        var req = await self.request("https://api2.sofurry.com/browse/search?search=furry&format=json&minlevel=0&maxlevel=0",{
            method: "GET",
            headers: {
                "User-Agent": self.config.web.userAgent
            }
        });
        try {
            var jsn = JSON.parse(req.body);
            var rr = Math.floor(Math.random()*jsn.data.entries.length);
            var submission = jsn.data.entries[rr];
            if(typeof submission.contentLevel === "undefined") throw new Error("secondary");
            if(submission.contentLevel !== 0) {
                self.logger.log(`unsafe image:\n${self.util.inspect(submission,{depth:3,showHidden:true})}`);
                self.logger.log(`Body: ${self.inspect(jsn,{depth:null})}`);
                return local.message.reply("Image API returned a non-safe image! Please try again later.");
            }
            var short = await self.shortenUrl(`http://www.sofurry.com/view/${submission.id}`);
            var extra = short.new ? `**This is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
            if([1,4].includes(submission.contentType)) {
                var attachment = new self.Discord.MessageAttachment(submission.full,"sofurry.png");
                return local.channel.send(`${extra}${submission.title} (type ${self.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<${short.url}>\nRequested By: ${local.author.tag}`,attachment);
            } else {
                return local.channel.send(`${extra}${submission.title} (type ${self.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<http://www.sofurry.com/view/${submission.id}>\nRequested By: ${local.author.tag}`);
            }
        }catch(e){
            self.logger.error(`Error:\n${e}`);
            self.logger.log(`Body: ${jsn}`);
            var attachment = new self.Discord.MessageAttachment(self.config.images.serverError);
            return local.channel.send("Unknown API Error",attachment);
        }
    })
};