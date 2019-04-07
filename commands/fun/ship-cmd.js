module.exports = {
	triggers: [
		"ship"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles", // 32768
		"embedLinks" // 16384
	],
	cooldown: 5e3,
	description: "Ship some people!",
	usage: "<@user1> [@user2]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) { 
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let user1, user2, rand1, rand2, r1, r2, shipname, t, amount, u1, u2, imgpath1, imgpath2, profile1, profile2, attch, data, embed;
		if(message.args[0] === "random") user1 = message.channel.guild.members.filter(u => u.id !== message.author.id && !u.user.bot).random();
		else user1 = await message.getUserFromArgs(0,false,false,0);
        
		// 2
		if(message.args.length > 1) {
			if(message.args[1] === "random") {
				if(!user1) {} else user2 = message.channel.guild.members.filter(u => u.id !== user1.id && u.id !== message.author.id && !u.user.bot).random();
			} else user2 = await message.getUserFromArgs(1,false,false,1);
		}
		if(!user1) return message.errorEmbed("INVALID_USER");
		if(user1 instanceof this.Eris.Member) user1 = user1.user;
		if(user2 instanceof this.Eris.Member) user2 = user2.user;
		if(!user2) user2 = message.author;
    
		if(user1.id === user2.id) {
			return message.channel.createMessage(`<@!${message.author.id}>, That's a bit self centered...`);
		}

		const builtin = [
			{
				users: [
					"365255872181567489", // owopup#7756
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
					"242843345402069002", // Donovan_DMC#3621
					"434662676547764244"  // Jinjin#1806
				],
				percent: 100
			},{
				users: [
					"158750488563679232", // Skullbite#5245
					"242843345402069002"  // Donovan_DMC#3621
				],
				percent: 100
			},{
				users: [
                    
					"242843345402069002", // Donovan_DMC#3621
					"398251412246495233"  // Furry Bot#7119
				],
				percent: 100
			},{
				users: [
					"346702890368368640",  // Sheri Blossom#8443
					"398251412246495233" // Furry Bot#7119
				],
				percent: 0
			}
		];
		try {
			rand1 = Math.floor(Math.random()*3),
			rand2 = Math.floor(Math.random()*3);
		
			if(rand1<2) rand1+=2;
			if(rand2<2) rand2+=2;
		
			r1 = Math.round(user1.username.length/rand1),
			r2 = Math.round(user2.username.length/rand2);
		
			shipname = user1.username.substr(0,r1) + user2.username.substr(user2.username.length - r2,r2);
			t = builtin.filter(b => b.users.includes(user1.id)).filter(b => b.users.includes(user2.id));
			amount = t.length > 0 ? t[0].percent : Math.floor(Math.random()*101);
			const heart = [undefined,null,""].includes(amount) ? "unknown" : amount <= 1 ? "1" : amount >= 2 && amount <= 19 ? "2-19" : amount >= 20 && amount < 39 ? "20-39" : amount >= 40 && amount < 59 ? "40-59" : amount >= 60 && amount < 79 ? "60-79" : amount >= 80 && amount <= 99 ? "80-99" : amount === 100 ? "100" : "unknown",
				shiptext = [undefined,null,""].includes(amount) ? "unknown" : amount <= 1 ? "Not Happening.." : amount >= 2 && amount <= 19 ? "Unlikely.." : amount >= 20 && amount < 39 ? "Maybe?" : amount >= 40 && amount < 59 ? "Hopeful!" : amount >= 60 && amount < 79 ? "Good!" : amount >= 80 && amount <= 99 ? "Amazing!" : amount === 100 ? "Epic!" : "unknown",
				heartIcon = await this.fsn.readFile(`${this.config.rootDir}/assets/images/ship/ship-${heart}-percent.png`);
			u1 = user1.avatarURL.split(".");
			u1.pop();
			imgpath1 = `${this.config.rootDir}/tmp/${message.channel.guild.id}-${message.channel.id}-${message.author.id}-ship-u1.png`;
			await this.download(`${u1.join(".")}.png`,imgpath1);
			profile1 = await this.fsn.readFile(imgpath1);
			u2 = user2.avatarURL.split(".");
			u2.pop();
			imgpath2 = `${this.config.rootDir}/tmp/${message.channel.guild.id}-${message.channel.id}-${message.author.id}-ship-u2.png`;
			await this.download(`${u2.join(".")}.png`,imgpath2);
			profile2 = await this.fsn.readFile(imgpath2);
			const img = new this.Canvas(384,128)
				.addImage(profile1,0,0,128,128)
				.addImage(heartIcon,128,0,128,128)
				.addImage(profile2,256,0,128,128);
			const file = await img.toBufferAsync();
			//attch = new this.Discord.MessageAttachment(shiph,"ship.png");
			embed = {
				title: ":heart: **Shipping!** :heart:",
				description: `Shipping **${user1.username}#${user1.discriminator}** with **${user2.username}#${user2.discriminator}**\n**${amount}%** - ${shiptext}\nShipname: ${shipname}`,
				image: {
					url: "attachment://ship.png"
				}
			};
			Object.assign(embed,message.embed_defaults());
			await message.channel.createMessage({ embed },{
				file,
				name: "ship.png"
			});
			//await this.fsn.unlink(imgpath1);
			//await this.fsn.unlink(imgpath2);
		} catch(e) {
			this.logger.error({shipname, amount});
			throw e;
		}
	})
};