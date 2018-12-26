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
	run: (async (client,message) => {
		message.channel.startTyping();
		var position = "1/2";
		var level = message.uConfig.level;
		var xp_left = message.uConfig.xp;
		var rank = client.config.levels.getRank(level);
		var image = await client.fsn.readFile(`${client.config.rootDir}/images/profile.png`);
		//var corners = await fsn.readFile(`${config.rootDir}/images/corners.png`);
		var pr = new client.Canvas(593, 348)
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
		if(message.member.nickname !== null) {
			pr.setColor("#F00");
			pr.addText(message.author.tag, 150, 220);
			pr.setColor("#00F");
			pr.addText(message.member.nickname, 150, 190);
		} else {
			pr.setColor("#00F");
			pr.addText(message.author.tag, 150, 190);
		}
		var u = message.author.displayAvatarURL().split(".");
		u.pop();
		var imgpath = `${client.config.rootDir}/tmp/${message.guild.id}-${message.channel.id}-${message.author.id}-profile.png`;
		await client.download(`${u.join(".")}.png`,imgpath);
		var img = await client.fsn.readFile(imgpath);
		pr.addImage(img, 18, 128, 119, 119);
		var a = await pr.toBufferAsync();
		var at = new client.Discord.MessageAttachment(a);
		await message.channel.send(at);
		await client.fsn.unlink(imgpath);
		message.channel.stopTyping();
	})
};