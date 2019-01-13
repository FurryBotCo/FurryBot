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
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
        var queue = await client.r.table("guilds").get(message.guild.id)("music")("queue");
        var ql = client.chunk(queue,10);
        var pages = ql.length;
        if([undefined,null,""].includes(page)) var page = 1;
        if(page > pages) return message.reply("Invalid page number.");
        var fields = [];
        for(let key in ql[page-1]) {
            var q = ql[page-1][key];
            var usr = await client.users.fetch(q.addedBy);
            var addedby = !usr ? "Unknown" : usr.tag;
            fields.push({
                name: `#${q.title} added by ${addedBy} at ${new Date(q.timestamp).toDateString()}`,
                value: w.reason,
                inline: false
            });
        }
        var data = {
            title: `Queue for ${message.guild.name} - Page ${page}/${pages}`,
            fields
        };
        var embed = new client.Discord.MessageEmbed(data);
        return message.channel.send(embed);
    })
};