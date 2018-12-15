module.exports = (async (self,local) => {
	local.channel.startTyping();
	var image = await self.fsn.readFile(`${process.cwd()}/images/deersteak.png`);
	await self.download(`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`,`${config.rootDir}/tmp/${message.author.id}.png`);
	var profile = await self.fsn.readFile(`${process.cwd()}/tmp/${local.author.id}.png`);
	
	var d = new Date();
	var time = d.getHours() < 10?d.getMinutes() < 10?`0${d.getHours()}:0${d.getMinutes()}`:`0${d.getHours()}:${d.getMinutes()}`:`${d.getHours()}:${d.getMinutes()}`
	
    var i = new self.Canvas(376, 79)
		.addImage(profile, 1, 12, 50, 50)
		.addImage(image, 0, 0, 376, 79)
		.setColor("#36393F")
		.addRect(74, 16, 196, 22)
		.addRect(268, 18, 370, 24)
		.setColor("#555E5D")
		.setTextFont("0.75em Whitney")
		.addText(`Today at ${time}`, 253, 33)
		.setColor("#FFF")
		.addText(message.member.displayName, 77, 33)
        .toBufferAsync();
		
	var attachment = new local.MessageAttachment(i);
	
	local.channel.send(`Here you go!\n(This is an inside joke from ${self.users.fetch("185938944460980224").tag} <https://assets.mcprocdn.com/images/deersteak.png>)`,attachment);
	return local.channel.stopTyping();
});