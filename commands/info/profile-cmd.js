module.exports = (async (self,local) => {
	local.channel.startTyping();
	var position = "1/2";
	var level = local.uConfig.level;
	var xp_left = local.uConfig.xp;
	var rank = self.config.levels.getRank(level);
	var image = await self.fsn.readFile(`${self.config.rootDir}/images/profile.png`);
	//var corners = await fsn.readFile(`${config.rootDir}/images/corners.png`);
	var pr = new self.Canvas(593, 348)
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
	if(local.member.nickname !== null) {
		pr.setColor("#F00");
		pr.addText(local.author.tag, 150, 220);
		pr.setColor("#00F");
		pr.addText(local.member.nickname, 150, 190);
	} else {
		pr.setColor("#00F");
		pr.addText(local.author.tag, 150, 190);
	}
	var u = local.author.displayAvatarURL().split(".");
	u.pop();
	var imgpath = `${self.config.rootDir}/tmp/${local.guild.id}-${local.channel.id}-${local.author.id}.png`;
	await self.download(`${u.join(".")}.png`,imgpath);
	var img = await self.fsn.readFile(imgpath);
	pr.addImage(img, 18, 128, 119, 119);
	var a = await pr.toBufferAsync();
	var at = new self.Discord.MessageAttachment(a);
	local.channel.send(at);
	local.channel.stopTyping();
});