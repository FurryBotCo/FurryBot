module.exports = {
	triggers: [
		"content"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "Get the content count for the image types",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		return message.reply("message.client has been temporarily disabled.");
		/*let req, counts, txt, content;

		req = await message.client.request("https://api.furrybot.me/image-counts.php",{
			method: "GET"
		});
		counts = JSON.parse(req.body);
		
		content = "";
		for(let category in counts) {
			content+=`**${category}**\n`;
			if(counts[category] instanceof Object) {
				for(let level1 in counts[category]) {
					if(counts[category][level1] instanceof Object) {
						content+=`${level1}:\n`;
						for(let level2 in counts[category][level1]) {
							content+=`\t${level2}: ${counts[category][level1][level2]}\n`;
						}
					} else {
						content+=`${level1}: ${counts[category][level1]}\n`;
					}
				}
			}
		}
		return message.channel.send(content);*/
	})
};