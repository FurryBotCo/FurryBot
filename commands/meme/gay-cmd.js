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
		"gay",
		"homo"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 5e3,
	description: "Gay up an image",
	usage: "[image]",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let user, imgurl, m, req, j;
		if(message.args.length >= 1) {
			// get member from message
			user = await message.getUserFromArgs();
			imgurl = user instanceof this.Eris.User ? user.staticAvatarURL : message.unparsedArgs.join("%20");
		} else if (message.attachments[0]) imgurl = message.attachments[0].url;
		else if((m = message.channel.messages.filter(m => m.attachments.size>=1)) && m.size >= 1) imgurl = m.last().attachments[0].url;
		else imgurl = message.author.staticAvatarURL;

		if(!imgurl) return message.channel.createMessage(`<@!${message.author.id}>, please either attach an image or provide a url`);
		req = await this.memeRequest("/gay",[imgurl]);
		if(req.statusCode !== 200) {
			try {
				j = {status:req.statusCode,message:JSON.stringify(req.body)};
			}catch(error){
				j = {status:req.statusCode,message:req.body};
			}
			message.channel.createMessage(`<@!${message.author.id}>, API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
			return this.logger.log(`imgurl: ${imgurl}`);
		}
		return message.channel.createMessage("",{
			file: req.body,
			name: "gay.png"
		}).catch(err => message.channel.createMessage(`<@!${message.author.id}>, Error sending: ${err}`));
	})
};