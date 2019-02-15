module.exports = {
	triggers: [
		"profile"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Get your user profile",
	usage: "[@member/id]",
	nsfw: false,
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	run: (async function(message) {
		message.channel.startTyping();
		// get member from message
		var member = message.args.length <= 0 ? message.member : await message.getMemberFromArgs();
		
		if(!member) return message.errorEmbed("INVALID_USER");
		var position = "1/2";
		var level = message.uConfig.level;
		var xp_left = message.uConfig.xp;
		var rank = this.config.levels.getRank(level);
		var image = await this.fsn.readFile(`${this.config.rootDir}/images/profile.png`);
		//var corners = await fsn.readFile(`${config.rootDir}/images/corners.png`);
		var pr = new this.Canvas(593, 348)
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
		if(member.nickname !== null) {
			pr.setColor("#F00")
			.addText(member.user.tag, 150, 220)
			.setColor("#00F")
			.addText(member.nickname, 150, 190);
		} else {
			pr.setColor("#00F")
			.addText(member.user.tag, 150, 190);
		}
		var u = member.user.displayAvatarURL().split(".");
		u.pop();
		var imgpath = `${this.config.rootDir}/tmp/${message.guild.id}-${message.channel.id}-${member.user.id}-profile.png`;
		await this.download(`${u.join(".")}.png`,imgpath);
		var img = await this.fsn.readFile(imgpath);
		pr.addImage(img, 18, 128, 119, 119);
		var a = await pr.toBufferAsync();
		var at = new this.Discord.MessageAttachment(a);
		await message.channel.send(at);
		await this.fsn.unlink(imgpath);
		message.channel.stopTyping();
	})
};