module.exports = {
	triggers: [
		"profile"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles", // 32768
		"embedLinks" // 16384
	],
	cooldown: 2e3,
	description: "Get your user profile",
	usage: "[@member/id]",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		
		let member, position, level, xp_left, rank, image, pr, u, imgpath, img, a, at;
		// get member from message
		member = message.args.length <= 0 ? message.member : await message.getMemberFromArgs();
		
		if(!member) return message.errorEmbed("INVALID_USER");
		position = "1/2";
		level = message.uConfig.level;
		xp_left = message.uConfig.xp;
		rank = this.config.levels.getRank(level);
		image = await this.fsn.readFile(`${this.config.rootDir}/images/profile.png`);
		//corners = await fsn.readFile(`${config.rootDir}/images/corners.png`);
		pr = new this.Canvas(593, 348)
			.addImage(image, 0, 0, 593, 348)
			//.addImage(profile, 18, 128, 119, 119)
			//.addImage(corners, 18, 128, 119, 119)
			.setColor("#000")
			.setTextFont("24px Calibri")
			.setTextAlign("left")
			.addText(position, 20, 300)
			.addText(level, 160,300)
			.addText(xp_left, 295, 300)
			.setColor(rank.color)
			.addText(rank.name, 445, 300)
			.setColor("#F00");
		if(member.nick !== null) {
			pr.setColor("#F00")
				.addText(`${member.user.username}#${member.user.discriminator}`, 150, 220)
				.setColor("#00F")
				.addText(member.nick, 150, 190);
		} else {
			pr.setColor("#00F")
				.addText(`${member.user.username}#${member.user.discriminator}`, 150, 190);
		}
		u = member.user.avatarURL.split(".");
		u.pop();
		imgpath = `${this.config.rootDir}/tmp/${message.channel.guild.id}-${message.channel.id}-${member.user.id}-profile.png`;
		await this.download(`${u.join(".")}.png`,imgpath);
		img = await this.fsn.readFile(imgpath);
		pr.addImage(img, 18, 128, 119, 119);
		a = await pr.toBufferAsync();
		await message.channel.createMessage("",{
			file: a,
			name: "profile.png"
		});
		await this.fsn.unlink(imgpath);
	})
};