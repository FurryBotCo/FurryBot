module.exports = (async(self,local)=>{ 
    if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");

    if(local.args[0] === "random") {
        var user1 = local.guild.members.filter(u=>u.id!==local.author.id&&!u.user.bot).random();
    } else {
        // member mention
        if(local.message.mentions.members.first(2).length>=1) {
            var user1 = local.message.mentions.members.first(2)[0];
        }
        
        // user ID
        if(!isNaN(local.args[0]) && !(local.args.length === 0 || !local.args || local.message.mentions.members.first())) {
            var user1 = local.guild.members.get(local.args[0]);
        }
        
        // username
        if(isNaN(local.args[0]) && local.args[0].indexOf("#") === -1 && !(local.args.length == 0 || !local.args || local.message.mentions.members.first())) {
            var usr1 = self.users.find(t=>t.username==local.args[0]);
            if(usr1 instanceof self.Discord.User) var user1 = local.message.guild.members.get(usr1.id);
        }
        
        // user tag
        if(isNaN(local.args[0]) && local.args[0].indexOf("#") !== -1 && !local.message.mentions.members.first()) {
            var usr1 = self.users.find(t=>t.tag===local.args[0]);
            if(usr1 instanceof self.Discord.User) var user1 = local.guild.members.get(usr1.id);
        }
    }
    
    // 2
    if(local.args.length > 1) {
        if(local.args[1] === "random") {
            if(!user1) {} else {
                var user2 = local.guild.members.filter(u=>u.id!==user1.id&&u.id!==local.author.id&&!u.user.bot).random();
            }
        } else {
            // member mention
            if(local.message.mentions.members.first(2).length>=2) {
                var user2 = local.message.mentions.members.first(2)[1];
            }
            
            // user ID
            if(!isNaN(local.args[1]) && !(local.args.length === 1 || !local.args || local.message.mentions.members.first(2)[1])) {
                var user2 = local.guild.members.get(local.args[1]);
            }
            
            // username
            if(isNaN(local.args[1]) && local.args[1].indexOf("#") === -1 && !(local.args.length === 1 || !local.args || local.message.mentions.members.first(2)[1])) {
                var usr2 = self.users.find(t=>t.username==local.args[1]);
                if(usr2 instanceof self.Discord.User) var user2 = local.message.guild.members.get(usr.id);
            }
            
            // user tag
            if(isNaN(local.args[1]) && local.args[1].indexOf("#") !== -1 && !local.message.mentions.members.first(2)[1]) {
                var usr2 = self.users.find(t=>t.tag===local.args[1]);
                if(usr2 instanceof self.Discord.User) var user2 = local.guild.members.get(usr2.id);
            }
        }
    }

    if(!user1) {
        var data = {
			title: "User not found",
			description: "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag"
		}
		Object.assign(data, local.embed_defaults());
		var embed = new self.Discord.MessageEmbed(data);
		return local.channel.send(embed);
    }

    if(!user2) var user2 = local.member;

    var user1 = user1.user,
    user2 = user2.user,
    rand1 = Math.floor(Math.random()*3),
    rand2 = Math.floor(Math.random()*3);

    if(rand1<2) rand1+=2;
    if(rand2<2) rand2+=2;

    var r1 = Math.round(user1.username.length/rand1),
    r2 = Math.round(user2.username.length/rand2);

    var shipname = user1.username.substr(0,r1)+user2.username.substr(user2.username.length-r2,r2);
    var amount = Math.floor(Math.random()*101);

    var heart = [undefined,null,""].includes(amount) ? "unknown" : amount <= 1 ? "1" : amount >= 2 && amount < 19 ? "2-19" : amount >= 20 && amount < 39 ? "20-39" : amount >= 40 && amount < 59 ? "40-59" : amount >= 60 && amount < 79 ? "60-79" : amount >= 80 && amount < 99 ? "80-99" : amount === 100 ? "100" : "unknown";

    return local.message.reply(`I ship you as ${shipname}!~`);

})