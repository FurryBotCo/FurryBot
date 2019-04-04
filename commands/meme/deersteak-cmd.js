module.exports = {
	triggers: [
		"deersteak",
		"deer_steak"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 5e3,
	description: "this is an old meme of ours, carried down for months.",
	usage: "[@user]",
	nsfw: false,
	devOnly: true,
	betaOnly: true,
	guildOwnerOnly: false,
	run: (async function(message) {
		let image, profile, d, time, i;
		image = await this.fsn.readFile(`${process.cwd()}/images/deersteak.png`);
		await this.download(`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`,`${this.config.rootDir}/tmp/${message.author.id}.png`);
		profile = await this.fsn.readFile(`${process.cwd()}/tmp/${message.author.id}.png`);
		
		d = new Date();
		time = d.getHours() < 10?d.getMinutes() < 10?`0${d.getHours()}:0${d.getMinutes()}`:`0${d.getHours()}:${d.getMinutes()}`:`${d.getHours()}:${d.getMinutes()}`;
		
		i = await new this.Canvas(376, 79)
			.addImage(profile, 1, 12, 50, 50)
			.addImage(image, 0, 0, 376, 79)
			.setColor("#36393F")
			.addRect(74, 16, 196, 22)
			.addRect(268, 18, 370, 24)
			.setColor("#555E5D")
			.setTextFont("0.75em Whitney")
			.addText(`Today at ${time}`, 253, 33)
			.setColor("#FFF")
			.addText(message.member.nick || message.member.username, 77, 33)
			.toBufferAsync();
			
		const u = await this.bot.getRESTUser("185938944460980224");
		return message.channel.createMessage(`Here you go!\n(this is an inside joke from ${u.username}#${u.discriminator} <https://assets.furry.bot/deersteak.png>)`,{
			file: i,
			name: "deersteak.png"
		});
	})
};