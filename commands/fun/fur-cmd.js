module.exports=(async (self,local) => {
	Object.assign(self,local);
	if(self.args.length === 0 ) {
		const site = Math.floor(Math.random()*76);
		// 0 (1) - 25: Inkbunny
		var web = site >= 1 && site <= 25 ? "inkbunny" : site >= 26 && site <= 50 ? "sofurry" : site >= 51 && site <= 75 ? "furrybot" : "furrybot";
	} else {
		//`furrybot/${types.join(",furrybot/")}`
		const sites = [
			"inkbunny",
			"sofurry",
			"furrybot"
		],
		// possibilities for furrybot site
		types = [
			"boop",
			"cuddle",
			"fursuit",
			"hold",
			"hug",
			"kiss",
			"lick",
			"propose"
		];
		// nsfw possibilities in nsfw channels
		if(self.channel.nsfw) types.push("bulge","yiff/gay","yiff/straight");

		if(self.args[0].toLowerCase() === "list") return self.message.reply(`Valid Values:\n**${sites.join("**\n**")}**\n**furrybot/${types.join("**\n**furrybot/")}**.`);
		if(self.args[0].toLowerCase().indexOf("/") !== -1) {
			var a = self.args[0].toLowerCase().split("/");
			if(a.length === 1) {
				var web = "furrybot",
				 type = "hug";
			}
			if(a.length >= 2) {
				var b = [...a];
				b.shift();
				var c = b.join("/");
				if(!types.includes(c)) return self.message.reply(`Invalid type for \`furrybot\`, valid types: **${types.join("**, **")}**, ex: **furrybot/hug**.`);
				var web = "furrybot",
				 type = c;
			}
		} else {
			if(!sites.includes(self.args[0].toLowerCase())) return new Error("ERR_INVALID_USAGE");
			var web = self.args[0].toLowerCase();
		}
	}
	switch(web) {
		case "inkbunny":
			if(!self.config.furryArtAPIs.inkbunny.sid) {
				await self.fsn.readFile(`${process.cwd()}/ib.txt`,"UTF8").then(async(sid)=>{
					var req = await self.request(`https://inkbunny.net/api_userrating.php?sid=${sid}`,{
						method: "GET"
					});
					var a = JSON.parse(req.body);
					if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
						switch(a.error_code) {
							case 2:
								var login = await self.request(`https://inkbunny.net/api_login.php?${self.config.furryArtAPIs.inkbunny.urlCredentials}`,{
									method: "GET"
								});
								var b = JSON.parse(login.body);
								if(typeof b.error_code !=="undefined" && typeof b.sid === "undefined") {
									switch(b.error_code) {
										case 0:
											console.error(`[CommandHandler:${self.command}][InkbunnyLogin]: Invalid Credentials`);
											break;
						
										default:
											console.error(`[CommandHandler:${self.command}][InkbunnyLogin]: ${e}`);
									}
								} else {
									await self.fsn.writeFile(`${process.cwd()}/ib.txt`,b.sid);
									self.config.furryArtAPIs.inkbunny.sid = b.sid;
									console.log(`[CommandHandler:${self.command}][InkbunnyLogin]: Generated new SID`);
								}
								break;
				
							default:
								console.error(`[CommandHandler:${self.command}][InkbunnyLogin]: ${e}`);
						}
					} else {
						self.config.furryArtAPIs.inkbunny.sid = a.sid;
					}
				}).catch(async(e)=>{
					if(e.code === "ENOENT") {
						var a = await self.request(`https://inkbunny.net/api_login.php?${self.config.furryArtAPIs.inkbunny.urlCredentials}`,{
							method: "GET"
						});
						if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
							switch(a.error_code) {
								case 0:
									console.error(`[CommandHandler:${self.command}][InkbunnyLogin]: Invalid Credentials`);
									break;
				
								default:
									console.error(`[CommandHandler:${self.command}][InkbunnyLogin]: ${e}`);
							}
						} else {
							await self.fsn.writeFile(`${process.cwd()}/ib.txt`,a.sid);
							self.config.furryArtAPIs.inkbunny.sid = a.sid;
							console.log(`[CommandHandler:${self.command}][InkbunnyLogin]: Generated new SID`);
						}
					} else {
						console.error(e);
					}
				});
			} else {
				var req = await self.request(`https://inkbunny.net/api_userrating.php?sid=${self.config.furryArtAPIs.inkbunny.sid}`,{
						method: "GET"
					});
					var a = JSON.parse(req.body);
					if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
						switch(a.error_code) {
							case 2:
								var login = await self.request(`https://inkbunny.net/api_login.php?${self.config.furryArtAPIs.inkbunny.urlCredentials}`,{
									method: "GET"
								});
								var b = JSON.parse(login.body);
								if(typeof b.error_code !=="undefined" && typeof b.sid === "undefined") {
									switch(b.error_code) {
										case 0:
											console.error(`[CommandHandler:${self.command}][InkbunnyLogin]: Invalid Credentials`);
											break;
						
										default:
											console.error(`[CommandHandler:${self.command}][InkbunnyLogin]: ${e}`);
									}
								} else {
									await self.fsn.writeFile(`${process.cwd()}/ib.txt`,b.sid);
									self.config.furryArtAPIs.inkbunny.sid = b.sid;
									console.log(`[CommandHandler:${self.command}][InkbunnyLogin]: Generated new SID`);
								}
								break;
				
							default:
								console.error(`[CommandHandler:${self.command}][InkbunnyLogin]: ${e}`);
						}
					} else {
						self.config.furryArtAPIs.inkbunny.sid = a.sid;
					}
			}
			// blacklisted tags: cub, diaper, ass, upskirt, pantsu, incest, age_difference, boobhat
			var req = await self.request(`https://inkbunny.net/api_search.php?sid=${self.config.furryArtAPIs.inkbunny.sid}&orderby=views&type=1,3,5,8,9&count_limit=50000&submissions_per_page=100&text=-cub%20-diaper%20-ass%20-upskirt%20-pantsu%20-incest%20-age_difference%20-boobhat&random=yes&get_rid=yes`,{
				method: "GET"
			});
			
			try {
				var jsn = JSON.parse(req.body);
				var rr = Math.floor(Math.random()*jsn.submissions.length);
				var submission = jsn.submissions[rr];
				if(typeof submission.rating_id === "undefined") throw new Error("secondary");
				if(submission.rating_id !== "0") {
					console.log(`[CommandHandler:${self.command}][Inkbunny]: unsafe image:\n${self.util.inspect(submission,{depth:null,showHidden:true})}`);
					console.log(`[CommandHandler:${self.command}][Inkbunny]: Body: ${jsn}`);
					return self.message.reply("Image API returned a non-safe image! Please try again later.");
				}
				var attachment = new self.Discord.MessageAttachment(submission.file_url_full,submission.file_name)
				return self.channel.send(`${submission.title} (type ${submission.type_name}) by ${submission.username}\n<https://inkbunny.net/s/${submission.submission_id}>\nRID: ${jsn.rid}\nSite: Inkbunny`,attachment)
			}catch(e){
				console.error(`[CommandHandler:${self.command}][Inkbunny]: Error:\n${e}`);
				console.log(`[CommandHandler:${self.command}][Inkbunny]: Body: ${jsn}`);
				var attachment = new self.Discord.MessageAttachment("https://furrybot.furcdn.net/NotFound.png");
				return self.channel.send("Unknown API Error",attachment);
			}
			break;
		
		case "sofurry":
			const contentType = [
				"story",
				"art",
				"music",
				"journal",
				"photo"
			]
			var req = await self.request("https://api2.sofurry.com/browse/search?search=furry&format=json&minlevel=0&maxlevel=0",{
				method: "GET"
			});
			try {
				var jsn = JSON.parse(req.body);
				var rr = Math.floor(Math.random()*jsn.data.entries.length);
				var submission = jsn.data.entries[rr];
				if(typeof submission.contentLevel === "undefined") throw new Error("secondary");
				if(submission.contentLevel !== 0) {
					console.log(`[CommandHandler:${self.command}][SoFurry]: unsafe image:\n${self.util.inspect(submission,{depth:null,showHidden:true})}`);
					console.log(`[CommandHandler:${self.command}][SoFurry]: Body: ${jsn}`);
					return self.message.reply("Image API returned a non-safe image! Please try again later.");
				}
				if([1,4].includes(submission.contentType)) {
					var attachment = new self.Discord.MessageAttachment(submission.full,"sofurry.png");
					return self.channel.send(`${submission.title} (type ${self.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<http://www.sofurry.com/view/${submission.id}>\nSite: SoFurry`,attachment);
				} else {
					return self.channel.send(`${submission.title} (type ${self.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<http://www.sofurry.com/view/${submission.id}>\nSite: SoFurry`);
				}
			}catch(e){
				console.error(`[CommandHandler:${self.command}][SoFurry]: Error:\n${e}`);
				console.log(`[CommandHandler:${self.command}][SoFurry]: Body: ${jsn}`);
				var attachment = new self.Discord.MessageAttachment("https://furrybot.furcdn.net/NotFound.png");
				return self.channel.send("Unknown API Error",attachment);
			}
			break;

		case "furrybot":
			try {
				if(!type) type = "hug";
				var safe = self.channel.nsfw ? !["bulge","yiff/gay","yiff/straight"].includes(type) : true;
				var req = await self.imageAPIRequest(safe,type);
				var attachment = new self.Discord.MessageAttachment(req.response.image);
				return self.channel.send(`<${req.response.image}>\nSite: FurCDN-FurryBot-${self.ucwords(type)}`,attachment);
			}catch(e){
				console.error(`[CommandHandler:${self.command}][furrybot/${type}]: Error:\n${e}`);
				console.log(`[CommandHandler:${self.command}][furrybot/${type}]: Body: ${jsn}`);
				var attachment = new self.Discord.MessageAttachment("https://furrybot.furcdn.net/NotFound.png");
				return self.channel.send("Unknown API Error",attachment);
			}

			break;

		default:
			return self.message.reply("Unknown API Error.");
		}
		
});