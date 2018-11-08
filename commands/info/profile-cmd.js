module.exports=(async (message, gConfig) => {
	if(!message) return new Error ("missing message parameter");
	if(!gConfig) return new Error ("missing gConfig parameter");
	await require(`../../BaseCommand.js`)(message, gConfig);
	var position="1/2";
	var level="15";
	var xp_left="5";
	var rank=config.levels.getRank(level);
	var image = await fsn.readFile(`${config.rootDir}/images/profile.png`);
	//var corners = await fsn.readFile(`${config.rootDir}/images/corners.png`);
	var pr = new Canvas(593, 348)
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
	var u=message.author.displayAvatarURL.split(".");
	u.pop();
	fetch(u.join(".")+".png")
		.then(res=>res.buffer())
		.then(buffer=>pr.addImage(buffer, 18, 128, 119, 119));
	var a = await pr.toBufferAsync();
	var at = new Discord.Attachment(a);
	message.channel.send(at);
});