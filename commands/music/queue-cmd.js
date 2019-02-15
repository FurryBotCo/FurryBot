module.exports = {
	triggers: [
        "queue",
        "q"
    ],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Get the current music queue",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
        var queue = await this.r.table("guilds").get(message.guild.id)("music")("queue");
        var ql = this.chunk(queue,10);
        if(ql.length >= 1) {
            var pages = ql.length;
            if([undefined,null,""].includes(page)) var page = 1;
            if(page > pages) return message.reply("Invalid page number.");
            var fields = [];
            var i = 0;
            for(let key in ql[page-1]) {
                var q = ql[page-1][key];
                var usr = await this.users.fetch(q.addedBy);
                var addedBy = !usr ? "Unknown" : usr.tag;
                if(i === 0) {
                    fields.push({
                        name: `${q.title} added by ${addedBy} at ${new Date(q.addedTimestamp).toDateString()}`,
                        value: `Currently Playing`,
                        inline: false
                    });
                } else {
                    fields.push({
                        name: `${q.title} added by ${addedBy} at ${new Date(q.addedTimestamp).toDateString()}`,
                        value: `Position ${+i+1}`,
                        inline: false
                    });
                }
            }
        } else {
            var fields = [
                {
                    name: "Nothing playing",
                    value: `Nothing is currently playing, queue something up with \`${message.gConfig.prefix}play <song search>\``,
                    inline: false
                }
            ]
        }
        var data = {
            title: `Queue for ${message.guild.name} - Page ${page}/${pages}`,
            fields,
            color: 2424780
        };
        var embed = new this.Discord.MessageEmbed(data);
        return message.channel.send(embed);
    })
};