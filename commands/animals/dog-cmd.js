module.exports = {
	triggers: [
		"dog",
		"doggo",
		"puppy"
	],
	userPermissions: [],
	botPermissions: [
		"ATTACH_FILES"
	],
	cooldown: 3e3,
	description: "Get a picture of a doggo!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async (client,message) => {
		message.channel.startTyping();
		var xhr = new client.XMLHttpRequest();
		
		xhr.open("GET","https://dog.ceo/api/breeds/image/random",false);
		
		xhr.send();
		var req = await client.request("https://dog.ceo/api/breeds/image/random",{
			method: "GET",
			headers: {
				"User-Agent": client.config.web.userAgent
			}
		})
		var j = JSON.parse(req.body);
		var parts = j.message.replace("https://","").split("/");
		
		var attachment = new messageAttachment(j.message,`${parts[2]}_${parts[3]}.png`);
		
		message.channel.send(`Breed: ${parts[2]}`,attachment);
		return message.channel.stopTyping();
	})
};