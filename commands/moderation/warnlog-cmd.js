module.exports = {
	triggers: [
        "warnlog"
    ],
	userPermissions: [
        "MANAGE_GUILD"
    ],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Check the warnings a user has",
	usage: "<@member/id> [page]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
        message.channel.startTyping();
        if(message.args.length === 0 || !message.args || (!isNaN(message.args[0]) && message.args[0].length < 17)) {
            var user = message.member;
            var page = ![undefined,null,""].includes(message.args[0]) && !isNaN(message.args[0]) && message.args[0].length < 17 ? message.args[0] : 1;
        } else {
            if(![undefined,null,""].includes(message.args[0]) && isNaN(message.args[0]) && message.args[0].length >= 17) {
                var page = message.args[0];
                var mn = 1;
            } else {
                var page = ![undefined,null,""].includes(message.args[0]) && !isNaN(message.args[0]) && message.args[0].length < 17 ? message.args[0] : 1; // lgtm [js/useless-assignment-to-message]
            }
    
            if(![undefined,null,""].includes(message.args[1]) && isNaN(message.args[1]) && message.args[1].length >= 17) {
                var page = message.args[1];
                var mn = 0;
            } else {
                var page = ![undefined,null,""].includes(message.args[1]) && !isNaN(message.args[1]) && message.args[1].length < 17 ? message.args[1] : 1;
            }
            
            if(!mn) var mn = 1;
    
            var user = await message.getMemberFromArgs(mn);
        }
    
        
        if(!user) return message.errorEmbed("INVALID_USER");
        
        var warnings = await client.db.getUserWarnings(user.id,message.guild.id).then(res=>res.sort((a,b)=>new Date(a.timestamp) - new Date(b.timestamp)));
        if(warnings.length <= 0) {
            var data = {
                title: "No Warnings Found",
                description: `No warnings were found for the specified user **${user.user.tag}**`,
                color: 41728
            }
            Object.assign(data, message.embed_defaults("color"));
            var embed = new client.Discord.MessageEmbed(data);
            message.channel.send(embed);
            return message.channel.stopTyping();
        }
        var wr = client.chunk(warnings,10);
        var pages = wr.length;
        if([undefined,null,""].includes(page)) var page = 1;
        if(page > pages) return message.reply("Invalid page number.");
        var fields = [];
        for(let key in wr[page-1]) {
            var w = wr[page-1][key];
            var usr = await client.users.fetch(w.blame);
            var blame = !usr ? "Unknown" : usr.tag;
            fields.push({
                name: `#${w.wid} - ${new Date(w.timestamp).toDateString()} by **${blame}**`,
                value: w.reason,
                inline: false
            });
        }
        var data = {
            title: `Warn Log for **${user.user.tag}** - Page ${page}/${pages}`,
            fields
        };
        Object.assign(data,message.embed_defaults());
        var embed = new client.Discord.MessageEmbed(data);
        message.channel.send(embed);
        return message.channel.stopTyping();
    })
};