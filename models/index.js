const Discord = require("discord.js"),
	UserEntry = require("./UserEntry"),
	user = new Discord.User(null,{
		username: "Donovan_DMC",
		discriminator: "1337",
		id: "242843345402069002"
	}),
	u = new UserEntry(user);
console.log(u);