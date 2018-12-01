module.exports = (async(self,local) => { 
    if(local.args.length < 1) return new Error("ERR_INVALID_USAGE");
    local.channel.startTyping();
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
        local.channel.send(embed);
        return local.channel.stopTyping();
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

    const heart = [undefined,null,""].includes(amount) ? "unknown" : amount <= 1 ? "1" : amount >= 2 && amount < 19 ? "2-19" : amount >= 20 && amount < 39 ? "20-39" : amount >= 40 && amount < 59 ? "40-59" : amount >= 60 && amount < 79 ? "60-79" : amount >= 80 && amount < 99 ? "80-99" : amount === 100 ? "100" : "unknown";
    const shiptext = [undefined,null,""].includes(amount) ? "unknown" : amount <= 1 ? "Not Happening.." : amount >= 2 && amount < 19 ? "Unlikely.." : amount >= 20 && amount < 39 ? "Maybe?" : amount >= 40 && amount < 59 ? "Hopeful!" : amount >= 60 && amount < 79 ? "Good!" : amount >= 80 && amount < 99 ? "Amazing!" : amount === 100 ? "Epic!" : "unknown";
    const heartIcon = await self.fsn.readFile(`${self.config.rootDir}/assets/images/ship/ship-${heart}-percent.png`);
    var u1 = user1.displayAvatarURL().split(".");
	u1.pop();
	var imgpath1 = `${self.config.rootDir}/tmp/${local.guild.id}-${local.channel.id}-${local.author.id}-ship-u1.png`;
	await self.download(`${u1.join(".")}.png`,imgpath1);
    var profile1 = await self.fsn.readFile(imgpath1);
    var u2 = user2.displayAvatarURL().split(".");
	u2.pop();
	var imgpath2 = `${self.config.rootDir}/tmp/${local.guild.id}-${local.channel.id}-${local.author.id}-ship-u2.png`;
	await self.download(`${u2.join(".")}.png`,imgpath2);
	var profile2 = await self.fsn.readFile(imgpath2);
    const img = new self.Canvas(384,128)
    .addImage(profile1,0,0,128,128)
    .addImage(heartIcon,128,0,128,128)
    .addImage(profile2,256,0,128,128);
    const shiph = await img.toBufferAsync();
    var attch = new self.Discord.MessageAttachment(shiph,"ship.png");
    var data = {
        title: ":heart: **Shipping!** :heart:",
        description: `Shipping **${user1.tag}** with **${user2.tag}**\n**${amount}%** - ${shiptext}\nShipname: ${shipname}`,
        image: {
            url: "attachment://ship.png"
        }
    }
    Object.assign(data,local.embed_defaults());
    var embed = new self.Discord.MessageEmbed(data);
    embed.attachFiles(attch);
    await local.channel.send(embed);
    await self.fsn.unlink(imgpath1);
    await self.fsn.unlink(imgpath2);
    return local.channel.stopTyping();
})