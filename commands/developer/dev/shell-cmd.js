const {
	config,
	Trello,
	os,
	util,
	request,
	phin,
	uuid,
	fs,
	path,
	colors,
	Canvas,
	fsn,
	chalk,
	chunk,
	ytdl,
	_,
	perf,
	performance,
	PerformanceObserver,
	child_process,
	shell,
	stringSimilarity,
	truncate,
	wordGen,
	deasync,
	functions,
	MessageEmbed,
	Database: {
		MongoClient,
		mongo,
		mdb
	},
	ExtendedMessage,
	Snowflake,
	MessageCollector,
	Permissions,
	LoggerV5
} = require("../../../modules/CommandRequire");
	
module.exports = {
	triggers: [
		"shell",
		"sh"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 0,
	description: "Execute shell code",
	usage: "<code>",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		// extra check, to be safe
		if (!config.developers.includes(message.author.id)) return message.channel.createMessage(`<@!${message.author.id}>, You cannot run this command as you are not a developer of this bot.`);
		let exec, start, res, m, end, embed;
		exec = message.unparsedArgs.join(" ");
		start = performance.now();
		try {
			res = await eval(exec);
		}catch(e){
			//return message.channel.createMessage(`Error evaluating: ${err}`);
			m = typeof e.message !== "string" ? require("util").inspect(e.message,{depth: 1}) : e.message;
			//this.log(require("util").inspect(e.message,{depth: 1}));
	
			end = performance.now();
			if(e.length > 1000) {
				/*
				form: {
						"api_dev_key": config.apis.pastebin.devKey,
						"api_user_key": config.apis.pastebin.userKey,
						"api_option": "paste",
						"api_paste_code": e,
						"api_paste_private": 2,
						"api_paste_name": "Furry Bot Eval",
						"api_paste_expire_date": "N"
					}*/
				const req = await phin({
					method: "POST",
					url: "https://pastebin.com/api/api_post.php",
					form: {
						"api_dev_key": config.apis.pastebin.devKey,
						"api_user_key": config.apis.pastebin.userKey,
						"api_option": "paste",
						"api_paste_code": e,
						"api_paste_private": 2,
						"api_paste_name": "Furry Bot Eval",
						"api_paste_expire_date": "N"
					},
					parse: "none"
				});
				res = `Uploaded ${req.body.toString()}`;
			}
			embed = new MessageEmbed({
				title: `Evaluated - Time: \`\`${(end-start).toFixed(3)}ms\`\``,
				author: {
					name: `${message.author.username}#${message.author.discriminator}`,
					icon_url: message.author.avatarURL
				},
				color: 3322313,
				fields: [
					{
						name: ":inbox_tray:  Input",
						value: `\`\`\`bash\n${exec}\`\`\``,
						inline: false
					}, {
						name: ":outbox_tray:  Output",
						value: res,
						inline: false
					}
				]
			});

			try {
				this.logger.debug(`[Shell]: ${require("util").inspect(e,{depth: 3,color:true})}`);
			} catch(e) {
				console.error(e);
			}
			Object.assign(embed,message.embed_defaults());
			message.channel.createMessage({ embed }).catch(err => {
				message.channel.createMessage(`I could not return the result: ${err}`).catch(error => {
					message.author.getDMChannel().then(dm => dm.createMessage(`I could not return the result: ${error}`)).catch(noerr => null);
				});
			});
		}
		if([null,undefined,""].includes(res)) {
			res = "```fix\nfinished with no return```";
		} else {
			try {
				if(typeof res !== "string") res = require("util").inspect(res,{showHidden:true,depth: 3});
			} catch(e) {
				try {
					if(typeof res !== "string") res = JSON.stringify(res);
				} catch(e) {}
			}
			if(res.length > 1000) {
				const req = await phin({
					method: "POST",
					url: "https://pastebin.com/api/api_post.php",
					form: {
						"api_dev_key": config.apis.pastebin.devKey,
						"api_user_key": config.apis.pastebin.userKey,
						"api_option": "paste",
						"api_paste_code": res,
						"api_paste_private": 2,
						"api_paste_name": "Furry Bot Shell",
						"api_paste_expire_date": "N"
					}
				});
				res = `Uploaded ${req.body.toString()}`;
			}
			res = "```bash\n"+res+"```";
		}
		end = performance.now();
		embed = new MessageEmbed({
			title: `Evaluated - Time: \`${(end-start).toFixed(3)}ms\``,
			author: {
				name: `${message.author.username}#${message.author.discriminator}`,
				icon_url: message.author.avatarURL
			},
			color: 3322313,
			fields: [
				{
					name: ":inbox_tray:  Input",
					value: "```bash\n"+exec+"```",
					inline: false
				}, {
					name: ":outbox_tray:  Output",
					value: res,
					inline: false
				}
			]
		});
		console.log(embed);
		Object.assign(embed,message.embed_defaults());
		
		message.channel.createMessage({ embed }).catch(err => {
			this.logger.error(err);
			message.channel.createMessage(`I could not return the result: ${err}`).catch(error => {
				message.author.getDMChannel().then(dm => dm.createMessage(`I could not return the result: ${err}`)).catch(noerr => null);
			});
		});
	})
};