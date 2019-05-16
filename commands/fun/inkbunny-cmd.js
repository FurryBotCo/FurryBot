module.exports = {
	triggers: [
		"inkbunny",
		"ib"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles", // 32768
		"embedLinks" // 16384
	],
	cooldown: 2e3,
	description: "Get a random image from InkBunny!",
	usage: "",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let msg, req, a, b, login, tagBlacklist, tags, bl, jsn, rr, submission;
		msg = await message.channel.createMessage(`Fetching.. ${this.config.emojis.load}`);
		if(!this.config.apis.inkbunny.sid) {
			await this.fsn.readFile(`${process.cwd()}/inkbunny-sid.txt`,"UTF8").then(async(sid) => {
				if(sid === "") sid = "nosid";
				req = await this.request(`https://inkbunny.net/api_userrating.php?sid=${sid}`,{
					method: "GET",
					headers: {
						"User-Agent": this.config.web.userAgent
					}
				});
				a = JSON.parse(req.body);
				if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
					switch(a.error_code) {
					case 2:
						login = await this.request(`https://inkbunny.net/api_login.php?${this.config.apis.inkbunny.urlCredentials}`,{
							method: "GET",
							headers: {
								"User-Agent": this.config.web.userAgent
							}
						});
						b = JSON.parse(login.body);
						if(typeof b.error_code !=="undefined" && typeof b.sid === "undefined") {
							switch(b.error_code) {
							case 0:
								this.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: Invalid Credentials`);
								break;
                    
							default:
								this.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${a}`);
							}
						} else {
							await this.fsn.writeFile(`${process.cwd()}/inkbunny-sid.txt`,b.sid);
							this.config.apis.inkbunny.sid = b.sid;
							this.logger.log(`[CommandHandler:${message.command}][InkbunnyLogin]: Generated new SID`);
						}
						break;
            
					default:
						this.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${a}`);
					}
				} else {
					this.config.apis.inkbunny.sid = a.sid;
				}
			}).catch(async(e) => {
				if(e.code === "ENOENT") {
					a = await this.request(`https://inkbunny.net/api_login.php?${this.config.apis.inkbunny.urlCredentials}`,{
						method: "GET",
						headers: {
							"User-Agent": this.config.web.userAgent
						}
					});
					if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
						switch(a.error_code) {
						case 0:
							this.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: Invalid Credentials`);
							break;
            
						default:
							this.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${e}`);
						}
					} else {
						await this.fsn.writeFile(`${process.cwd()}/inkbunny-sid.txt`,a.sid);
						this.config.apis.inkbunny.sid = a.sid;
						this.logger.log(`[CommandHandler:${message.command}][InkbunnyLogin]: Generated new SID`);
					}
				} else {
					this.logger.error(e);
				}
			});
		} else {
			req = await this.request(`https://inkbunny.net/api_userrating.php?sid=${this.config.apis.inkbunny.sid}`,{
				method: "GET",
				headers: {
					"User-Agent": this.config.web.userAgent
				}
			});
			a = JSON.parse(req.body);
			if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
				switch(a.error_code) {
				case 2:
					login = await this.request(`https://inkbunny.net/api_login.php?${this.config.apis.inkbunny.urlCredentials}`,{
						method: "GET",
						headers: {
							"User-Agent": this.config.web.userAgent
						}
					});
					b = JSON.parse(login.body);
					if(typeof b.error_code !=="undefined" && typeof b.sid === "undefined") {
						switch(b.error_code) {
						case 0:
							this.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: Invalid Credentials`);
							break;
                    
						default:
							this.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${a}`);
						}
					} else {
						await this.fsn.writeFile(`${process.cwd()}/inkbunny-sid.txt`,b.sid);
						this.config.apis.inkbunny.sid = b.sid;
						this.logger.log(`[CommandHandler:${message.command}][InkbunnyLogin]: Generated new SID`);
					}
					break;
            
				default:
					this.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${a}`);
				}
			} else {
				this.config.apis.inkbunny.sid = a.sid;
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
		tags = message.unparsedArgs.length > 0 ? `${message.unparsedArgs.join("%20").toLowerCase()}%20-${tagBlacklist.join("%20-")}` : `furry%20-${tagBlacklist.join("%20-")}`;
        
		bl = message.unparsedArgs.join(" ").match(this.config.tagBlacklist);
		if(bl !== null && bl.length > 0) return message.channel.createMessage(`<@!${message.author.id}>, Your search contained blacklisted tags, **${bl.join("**, **")}**`);
		req = await this.request(`https://inkbunny.net/api_search.php?sid=${this.config.apis.inkbunny.sid}&orderby=views&type=1,3,5,8,9&count_limit=50000&submissions_per_page=100&text=${tags}&random=yes&get_rid=yes`,{
			method: "GET",
			headers: {
				"User-Agent": this.config.web.userAgent
			}
		});
        
		try {
			jsn = JSON.parse(req.body);
			rr = Math.floor(Math.random()*jsn.submissions.length);
			submission = jsn.submissions[rr];
			if(typeof submission.rating_id === "undefined") throw new Error("secondary");
			if(submission.rating_id !== "0") {
				this.logger.log(`unsafe image:\n${this.util.inspect(submission,{depth:3,showHidden:true})}`);
				this.logger.log(`Body: ${jsn}`);
				return msg.edit("Image API returned a non-safe image! Please try again later.").catch(err => message.channel.createMessage(`Command failed: ${err}`));
			}
			return msg.edit(`${submission.title} (type ${submission.type_name}) by ${submission.username}\n<https://inkbunny.net/s/${submission.submission_id}>\nRequested By: ${message.author.username}#${message.author.discriminator}\nRID: ${jsn.rid}\nIf a bad image is returned, blame the service, not the bot or its author!`).catch(err => message.channel.createMessage(`Command failed: ${err}`)).then(async() => message.channel.createMessage("",{
				file: await this.getImageFromURL(submission.file_url_full),
				name: submission.file_name
			})).catch(err => message.channel.createMessage(`Command failed: ${err}`));
		}catch(e){
			this.logger.error(`Error:\n${e}`);
			this.logger.log(`${this.util.inspect(jsn,{depth:3})}`);
			return msg.edit("Unknown API Error").then(async() => message.channel.createMessage("",{
				file: await this.getImageFromURL(this.config.images.serverError),
				name: "error.png"
			})).catch(err => message.channel.createMessage(`Command failed: ${err}`));
		}
	})
};