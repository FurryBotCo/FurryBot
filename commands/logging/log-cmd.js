module.exports=(async (message, gConfig) => {
	if(!message) return new Error ("missing message parameter");
	if(!gConfig) return new Error ("missing gConfig parameter");
	await require(`../../BaseCommand.js`)(message, gConfig);
	if(!args[0] || ["enable","en","e","disable","dis","d"].indexOf(args[0]) === -1 || !args[1]) {
		return new Error("INVALID_USAGE");
	}
	var type = [...args];
	type.shift();
	var event = type.join("").toLowerCase();
	if(typeof gConfig.logging === "undefined") db.updateGuild(message.guild.id, config.logging.def);
	
	if(!config.logging.types.includes(event)) {
		var data = {
			title: "Invalid command usage",
			description: `Invalid event\n\nuse the command **${gConfig.prefix}logevents** to see the possible events`
		}
		Object.assign(data, embed_defaults);
		var embed = new Discord.MessageEmbed(data);
		return message.channel.send(embed);
	}
	
	switch(args[0]) {
		case "enable":
		case "en":
		case "e":
			// enable
			break;
			
		case "disable":
		case "dis":
		case "d":
			// disable
			break;
	}
});