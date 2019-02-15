module.exports = {
	triggers: [
        "ship"
    ],
	userPermissions: [],
	botPermissions: [
        "ATTACH_FILES"
    ],
	cooldown: 5e3,
	description: "Ship some people!",
	usage: "<@user1> [@user2]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) { 
        if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
        message.channel.startTyping();
        if(message.args[0] === "random") {
            var user1 = message.guild.members.filter(u=>u.id!==message.author.id&&!u.user.bot).random();
        } else {
            var user1 = await message.getUserFromArgs(0,false,false,0);
        }
        
        // 2
        if(message.args.length > 1) {
            if(message.args[1] === "random") {
                if(!user1) {} else {
                    var user2 = message.guild.members.filter(u=>u.id!==user1.id&&u.id!==message.author.id&&!u.user.bot).random();
                }
            } else {
               var user2 = await message.getUserFromArgs(1,false,false,1);
            }
        }
    
        if(!user1) return message.errorEmbed("INVALID_USER");
    
        if(user1 instanceof this.Discord.GuildMember) var user1 = user1.user;
        if(user2 instanceof this.Discord.GuildMember) var user2 = user2.user;
        if(!user2) var user2 = message.author;
    
        if(user1.id === user2.id) {
            message.reply("That's a bit self centered...");
            return message.channel.stopTyping();
        }

        const builtin = [
            {
                users: [
                    "365255872181567489", // ❄w❄pup#7756
                    "398251412246495233"  // Furry Bot#7119
                ],
                percent: 100
            },{
                users: [
                    "398251412246495233", // Furry Bot#7119
                    "434662676547764244"  // Jinjin#1806
                ],
                percent: 100
            },{
                users: [
                    "242843345402069002", // Donovan_DMC#1337
                    "434662676547764244"  // Jinjin#1806
                ],
                percent: 100
            },{
                users: [
                    "158750488563679232", // Skullbite#5245
                    "242843345402069002"  // Donovan_DMC#1337
                ],
                percent: 100
            },{
                users: [
                    
                    "242843345402069002", // Donovan_DMC#1337
                    "398251412246495233"  // Furry Bot#7119
                ],
                percent: 100
            },{
                users: [
                    "346702890368368640",  // Sheri Blossom#8443
                    "398251412246495233" // Furry Bot#7119
                ],
                percent: 0
            },{
                users: [
                    "348992216695439360",
                    user2.id
                ],
                percent: 100
            },{
                users: [
                    "348992216695439360",
                    user1.id
                ],
                percent: 100
            }
        ];

        rand1 = Math.floor(Math.random()*3),
        rand2 = Math.floor(Math.random()*3);
    
        if(rand1<2) rand1+=2;
        if(rand2<2) rand2+=2;
    
        var r1 = Math.round(user1.username.length/rand1),
        r2 = Math.round(user2.username.length/rand2);
    
        var shipname = user1.username.substr(0,r1)+user2.username.substr(user2.username.length-r2,r2);
        var t = builtin.filter(b=>b.users.includes(user1.id)).filter(b=>b.users.includes(user2.id));
        var amount = t.length > 0 ? t[0].percent : Math.floor(Math.random()*101);
    
        const heart = [undefined,null,""].includes(amount) ? "unknown" : amount <= 1 ? "1" : amount >= 2 && amount < 19 ? "2-19" : amount >= 20 && amount < 39 ? "20-39" : amount >= 40 && amount < 59 ? "40-59" : amount >= 60 && amount < 79 ? "60-79" : amount >= 80 && amount < 99 ? "80-99" : amount === 100 ? "100" : "unknown";
        const shiptext = [undefined,null,""].includes(amount) ? "unknown" : amount <= 1 ? "Not Happening.." : amount >= 2 && amount < 19 ? "Unlikely.." : amount >= 20 && amount < 39 ? "Maybe?" : amount >= 40 && amount < 59 ? "Hopeful!" : amount >= 60 && amount < 79 ? "Good!" : amount >= 80 && amount < 99 ? "Amazing!" : amount === 100 ? "Epic!" : "unknown";
        const heartIcon = await this.fsn.readFile(`${this.config.rootDir}/assets/images/ship/ship-${heart}-percent.png`);
        var u1 = user1.displayAvatarURL().split(".");
        u1.pop();
        var imgpath1 = `${this.config.rootDir}/tmp/${message.guild.id}-${message.channel.id}-${message.author.id}-ship-u1.png`;
        await this.download(`${u1.join(".")}.png`,imgpath1);
        var profile1 = await this.fsn.readFile(imgpath1);
        var u2 = user2.displayAvatarURL().split(".");
        u2.pop();
        var imgpath2 = `${this.config.rootDir}/tmp/${message.guild.id}-${message.channel.id}-${message.author.id}-ship-u2.png`;
        await this.download(`${u2.join(".")}.png`,imgpath2);
        var profile2 = await this.fsn.readFile(imgpath2);
        const img = new this.Canvas(384,128)
        .addImage(profile1,0,0,128,128)
        .addImage(heartIcon,128,0,128,128)
        .addImage(profile2,256,0,128,128);
        const shiph = await img.toBufferAsync();
        var attch = new this.Discord.MessageAttachment(shiph,"ship.png");
        var data = {
            title: ":heart: **Shipping!** :heart:",
            description: `Shipping **${user1.tag}** with **${user2.tag}**\n**${amount}%** - ${shiptext}\nShipname: ${shipname}`,
            image: {
                url: "attachment://ship.png"
            }
        }
        Object.assign(data,message.embed_defaults());
        var embed = new this.Discord.MessageEmbed(data);
        embed.attachFiles(attch);
        await message.channel.send(embed);
        await this.fsn.unlink(imgpath1);
        await this.fsn.unlink(imgpath2);
        return message.channel.stopTyping();
    })
};