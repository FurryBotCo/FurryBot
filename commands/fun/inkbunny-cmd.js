module.exports = {
	triggers: [
		"inkbunny",
		"ib"
	],
	userPermissions: [],
	botPermissions: [
		"ATTACH_FILES",
		"EMBED_LINKS"
	],
	cooldown: 2e3,
	description: "Get a random image from InkBunny!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let msg, req, a, b, login, tagBlacklist, tags, bl, jsn, rr, submission, attachment;
		msg = await message.channel.send(`Fetching.. ${message.client.config.emojis.load}`);
		if(!message.client.config.apis.inkbunny.sid) {
			await message.client.fsn.readFile(`${process.cwd()}/inkbunny-sid.txt`,"UTF8").then(async(sid) => {
				if(sid === "") sid = "nosid";
				req = await message.client.request(`https://inkbunny.net/api_userrating.php?sid=${sid}`,{
					method: "GET",
					headers: {
						"User-Agent": message.client.config.web.userAgent
					}
				});
				a = JSON.parse(req.body);
				if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
					switch(a.error_code) {
					case 2:
						login = await message.client.request(`https://inkbunny.net/api_login.php?${message.client.config.apis.inkbunny.urlCredentials}`,{
							method: "GET",
							headers: {
								"User-Agent": message.client.config.web.userAgent
							}
						});
						b = JSON.parse(login.body);
						if(typeof b.error_code !=="undefined" && typeof b.sid === "undefined") {
							switch(b.error_code) {
							case 0:
								message.client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: Invalid Credentials`);
								break;
                    
							default:
								message.client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${a}`);
							}
						} else {
							await message.client.fsn.writeFile(`${process.cwd()}/inkbunny-sid.txt`,b.sid);
							message.client.config.apis.inkbunny.sid = b.sid;
							message.client.logger.log(`[CommandHandler:${message.command}][InkbunnyLogin]: Generated new SID`);
						}
						break;
            
					default:
						message.client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${a}`);
					}
				} else {
					message.client.config.apis.inkbunny.sid = a.sid;
				}
			}).catch(async(e) => {
				if(e.code === "ENOENT") {
					a = await message.client.request(`https://inkbunny.net/api_login.php?${message.client.config.apis.inkbunny.urlCredentials}`,{
						method: "GET",
						headers: {
							"User-Agent": message.client.config.web.userAgent
						}
					});
					if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
						switch(a.error_code) {
						case 0:
							message.client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: Invalid Credentials`);
							break;
            
						default:
							message.client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${e}`);
						}
					} else {
						await message.client.fsn.writeFile(`${process.cwd()}/inkbunny-sid.txt`,a.sid);
						message.client.config.apis.inkbunny.sid = a.sid;
						message.client.logger.log(`[CommandHandler:${message.command}][InkbunnyLogin]: Generated new SID`);
					}
				} else {
					message.client.logger.error(e);
				}
			});
		} else {
			req = await message.client.request(`https://inkbunny.net/api_userrating.php?sid=${message.client.config.apis.inkbunny.sid}`,{
				method: "GET",
				headers: {
					"User-Agent": message.client.config.web.userAgent
				}
			});
			a = JSON.parse(req.body);
			if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
				switch(a.error_code) {
				case 2:
					login = await message.client.request(`https://inkbunny.net/api_login.php?${message.client.config.apis.inkbunny.urlCredentials}`,{
						method: "GET",
						headers: {
							"User-Agent": message.client.config.web.userAgent
						}
					});
					b = JSON.parse(login.body);
					if(typeof b.error_code !=="undefined" && typeof b.sid === "undefined") {
						switch(b.error_code) {
						case 0:
							message.client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: Invalid Credentials`);
							break;
                    
						default:
							message.client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${a}`);
						}
					} else {
						await message.client.fsn.writeFile(`${process.cwd()}/inkbunny-sid.txt`,b.sid);
						message.client.config.apis.inkbunny.sid = b.sid;
						message.client.logger.log(`[CommandHandler:${message.command}][InkbunnyLogin]: Generated new SID`);
					}
					break;
            
				default:
					message.client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${a}`);
				}
			} else {
				message.client.config.apis.inkbunny.sid = a.sid;
			}
		}
		// blacklisted tags: cub, diaper, ass, upskirt, pantsu, incest, age_difference, boobhat, vore
		tagBlacklist = [
			"cub",
			"diaper",
			"ass",
			"upskirt",
			"pantsu",
			"incest",
			"age_difference",
			"boobhat",
			"vore"
		];
		tags = message.unparseArgs.length > 0 ? `${message.unparseArgs.join("%20").toLowerCase()}%20-${tagBlacklist.join("%20-")}` : `furry%20-${tagBlacklist.join("%20-")}`;
        
		bl = message.unparseArgs.join(" ").match(message.client.config.tagBlacklist);
		if(bl !== null && bl.length > 0) return message.reply(`Your search contained blacklisted tags, **${bl.join("**, **")}**`);
		req = await message.client.request(`https://inkbunny.net/api_search.php?sid=${message.client.config.apis.inkbunny.sid}&orderby=views&type=1,3,5,8,9&count_limit=50000&submissions_per_page=100&text=${tags}&random=yes&get_rid=yes`,{
			method: "GET",
			headers: {
				"User-Agent": message.client.config.web.userAgent
			}
		});
        
		try {
			jsn = JSON.parse(req.body);
			rr = Math.floor(Math.random()*jsn.submissions.length);
			submission = jsn.submissions[rr];
			if(typeof submission.rating_id === "undefined") throw new Error("secondary");
			if(submission.rating_id !== "0") {
				message.client.logger.log(`unsafe image:\n${message.client.util.inspect(submission,{depth:3,showHidden:true})}`);
				message.client.logger.log(`Body: ${jsn}`);
				return msg.edit("Image API returned a non-safe image! Please try again later.").catch(err => message.channel.send(`Command failed: ${err}`));
			}
			attachment = new message.client.Discord.MessageAttachment(submission.file_url_full,submission.file_name);
			return msg.edit(`${submission.title} (type ${submission.type_name}) by ${submission.username}\n<https://inkbunny.net/s/${submission.submission_id}>\nRequested By: ${message.author.tag}\nRID: ${jsn.rid}\nIf a bad image is returned, blame the service, not the bot author!`).catch(err => message.channel.send(`Command failed: ${err}`)).then(() => message.channel.send(attachment)).catch(err=>message.channel.send(`Command failed: ${err}`));
		}catch(e){
			message.client.logger.error(`Error:\n${e}`);
			message.client.logger.log(`${message.client.util.inspect(jsn,{depth:3})}`);
			attachment = new message.client.Discord.MessageAttachment(message.client.config.images.serverError);
			return msg.edit("Unknown API Error").then(() => message.channel.send(attachment)).catch(err => message.channel.send(`Command failed: ${err}`));
		}
	})
};