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
	run: (async(self,local)=>{
        local.channel.startTyping();
        if(local.args.length === 0 || !local.args || (!isNaN(local.args[0]) && local.args[0].length < 17)) {
            var user = local.member;
            var page = ![undefined,null,""].includes(local.args[0]) && !isNaN(local.args[0]) && local.args[0].length < 17 ? local.args[0] : 1;
        } else {
            if(![undefined,null,""].includes(local.args[0]) && isNaN(local.args[0]) && local.args[0].length >= 17) {
                var page = local.args[0];
                var mn = 1;
            } else {
                var page = ![undefined,null,""].includes(local.args[0]) && !isNaN(local.args[0]) && local.args[0].length < 17 ? local.args[0] : 1; // lgtm [js/useless-assignment-to-local]
            }
    
            if(![undefined,null,""].includes(local.args[1]) && isNaN(local.args[1]) && local.args[1].length >= 17) {
                var page = local.args[1];
                var mn = 0;
            } else {
                var page = ![undefined,null,""].includes(local.args[1]) && !isNaN(local.args[1]) && local.args[1].length < 17 ? local.args[1] : 1;
            }
            
            if(!mn) var mn = 1;
    
            // member mention
            if(local.message.mentions.members.first()) {
                var user = local.message.mentions.members.first();
            } else {
            
                // user ID
                if(!isNaN(local.args[mn]) && !(local.args.length === 0 || !local.args || local.message.mentions.members.first())) {
                    var user = local.guild.members.get(local.args[mn]);
                }
                
                // username
                if(isNaN(local.args[mn]) && local.args[mn].indexOf("#") === -1 && !(local.args.length === 0 || !local.args || local.message.mentions.members.first())) {
                    var usr = self.users.find(t=>t.username===local.args[mn]);
                    if(usr instanceof self.Discord.User) var user = local.message.guild.members.get(usr.id);
                }
                
                // user tag
                if(isNaN(local.args[mn]) && local.args[mn].indexOf("#") !== -1 && !local.message.mentions.members.first()) {
                    var usr = self.users.find(t=>t.tag===local.args[mn]);
                    if(usr instanceof self.Discord.User) var user = local.guild.members.get(usr.id);
                }
            }
        }
    
        
        if(!user) {
            var data = {
                title: "User not found",
                description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag\n\n(tip: you can't use an id, username, or tag as the first agument, only a mention or page number)"
            }
            Object.assign(data, local.embed_defaults());
            var embed = new self.Discord.MessageEmbed(data);
            local.channel.send(embed);
            return local.channel.stopTyping();
        }
        
        var warnings = await self.db.getUserWarnings(user.id,local.guild.id);
        if(warnings.length <= 0) {
            var data = {
                title: "No Warnings Found",
                description: `No warnings were found for the specified user **${user.user.tag}**`,
                color: 41728
            }
            Object.assign(data, local.embed_defaults("color"));
            var embed = new self.Discord.MessageEmbed(data);
            local.channel.send(embed);
            return local.channel.stopTyping();
        }
        var wr = self.chunk(warnings,10);
        var pages = wr.length;
        if([undefined,null,""].includes(page)) var page = 1;
        if(page > pages) return local.message.reply("Invalid page number.");
        var fields = [];
        for(let key in wr[page-1]) {
            var w = wr[page-1][key];
            var usr = await self.users.fetch(w.blame);
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
        Object.assign(data,local.embed_defaults());
        var embed = new self.Discord.MessageEmbed(data);
        local.channel.send(embed);
        return local.channel.stopTyping();
    })
};