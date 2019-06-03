const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../modules/CommandRequire");


module.exports = {
	triggers: [
		"giphy",
		"gif"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	description: "Get a gif from giphy.",
	usage: "<@user or text>",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		let embed, rq;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		rq = await phin({
			method: "GET",
			url: `https://api.giphy.com/v1/gifs/search?api_key=${config.apis.giphy.apikey}&q=${message.args.join("%20")}&limit=50&offset=7&rating=G&lang=en`,
			parse: "json"
		});

		if(rq.body.data.length === 0) return message.reply(`No results were found for "${message.args.join(" ")}".`);
		embed = {
			title: `Results for "${message.args.join(" ")}" on giphy`,
			thumbnail: {
				url: "attachment://PoweredByGiphy.png"
			},
			image: {
				url: rq.body.data[Math.floor(Math.random() * rq.body.data.length)].images.fixed_width.url
			}
		};

		return message.channel.createMessage({ embed },[
			{
				file: await functions.getImageFromURL("https://assets.furry.bot/PoweredByGiphy.png"),
				name: "PoweredByGiphy.png"
			}
		]);
	})
};