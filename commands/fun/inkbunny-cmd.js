module.exports = (async(self,local)=>{
    if(!self.config.furryArtAPIs.inkbunny.sid) {
        await self.fsn.readFile(`${process.cwd()}/inkbunny-sid.txt`,"UTF8").then(async(sid)=>{
            if(sid === "") sid = "nosid";
            var req = await self.request(`https://inkbunny.net/api_userrating.php?sid=${sid}`,{
                method: "GET",
                headers: {
                    "User-Agent": self.config.web.userAgent
                }
            });
            var a = JSON.parse(req.body);
            if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
                switch(a.error_code) {
                    case 2:
                        var login = await self.request(`https://inkbunny.net/api_login.php?${self.config.furryArtAPIs.inkbunny.urlCredentials}`,{
                            method: "GET",
                            headers: {
                                "User-Agent": self.config.web.userAgent
                            }
                        });
                        var b = JSON.parse(login.body);
                        if(typeof b.error_code !=="undefined" && typeof b.sid === "undefined") {
                            switch(b.error_code) {
                                case 0:
                                    self.logger.error(`[CommandHandler:${local.command}][InkbunnyLogin]: Invalid Credentials`);
                                    break;
                
                                default:
                                    self.logger.error(`[CommandHandler:${local.command}][InkbunnyLogin]: ${e}`);
                            }
                        } else {
                            await self.fsn.writeFile(`${process.cwd()}/inkbunny-sid.txt`,b.sid);
                            self.config.furryArtAPIs.inkbunny.sid = b.sid;
                            self.logger.log(`[CommandHandler:${local.command}][InkbunnyLogin]: Generated new SID`);
                        }
                        break;
        
                    default:
                        self.logger.error(`[CommandHandler:${local.command}][InkbunnyLogin]: ${e}`);
                }
            } else {
                self.config.furryArtAPIs.inkbunny.sid = a.sid;
            }
        }).catch(async(e)=>{
            if(e.code === "ENOENT") {
                var a = await self.request(`https://inkbunny.net/api_login.php?${self.config.furryArtAPIs.inkbunny.urlCredentials}`,{
                    method: "GET",
                    headers: {
                        "User-Agent": self.config.web.userAgent
                    }
                });
                if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
                    switch(a.error_code) {
                        case 0:
                            self.logger.error(`[CommandHandler:${local.command}][InkbunnyLogin]: Invalid Credentials`);
                            break;
        
                        default:
                            self.logger.error(`[CommandHandler:${local.command}][InkbunnyLogin]: ${e}`);
                    }
                } else {
                    await self.fsn.writeFile(`${process.cwd()}/inkbunny-sid.txt`,a.sid);
                    self.config.furryArtAPIs.inkbunny.sid = a.sid;
                    self.logger.log(`[CommandHandler:${local.command}][InkbunnyLogin]: Generated new SID`);
                }
            } else {
                self.logger.error(e);
            }
        });
    } else {
        var req = await self.request(`https://inkbunny.net/api_userrating.php?sid=${self.config.furryArtAPIs.inkbunny.sid}`,{
                method: "GET",
                headers: {
                    "User-Agent": self.config.web.userAgent
                }
            });
            var a = JSON.parse(req.body);
            if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
                switch(a.error_code) {
                    case 2:
                        var login = await self.request(`https://inkbunny.net/api_login.php?${self.config.furryArtAPIs.inkbunny.urlCredentials}`,{
                            method: "GET",
                            headers: {
                                "User-Agent": self.config.web.userAgent
                            }
                        });
                        var b = JSON.parse(login.body);
                        if(typeof b.error_code !=="undefined" && typeof b.sid === "undefined") {
                            switch(b.error_code) {
                                case 0:
                                    self.logger.error(`[CommandHandler:${local.command}][InkbunnyLogin]: Invalid Credentials`);
                                    break;
                
                                default:
                                    self.logger.error(`[CommandHandler:${local.command}][InkbunnyLogin]: ${e}`);
                            }
                        } else {
                            await self.fsn.writeFile(`${process.cwd()}/inkbunny-sid.txt`,b.sid);
                            self.config.furryArtAPIs.inkbunny.sid = b.sid;
                            self.logger.log(`[CommandHandler:${local.command}][InkbunnyLogin]: Generated new SID`);
                        }
                        break;
        
                    default:
                        self.logger.error(`[CommandHandler:${local.command}][InkbunnyLogin]: ${e}`);
                }
            } else {
                self.config.furryArtAPIs.inkbunny.sid = a.sid;
            }
    }
    // blacklisted tags: cub, diaper, ass, upskirt, pantsu, incest, age_difference, boobhat
    var req = await self.request(`https://inkbunny.net/api_search.php?sid=${self.config.furryArtAPIs.inkbunny.sid}&orderby=views&type=1,3,5,8,9&count_limit=50000&submissions_per_page=100&text=-cub%20-diaper%20-ass%20-upskirt%20-pantsu%20-incest%20-age_difference%20-boobhat&random=yes&get_rid=yes`,{
        method: "GET",
        headers: {
            "User-Agent": self.config.web.userAgent
        }
    });
    
    try {
        var jsn = JSON.parse(req.body);
        var rr = Math.floor(Math.random()*jsn.submissions.length);
        var submission = jsn.submissions[rr];
        if(typeof submission.rating_id === "undefined") throw new Error("secondary");
        if(submission.rating_id !== "0") {
            self.logger.log(`unsafe image:\n${self.util.inspect(submission,{depth:3,showHidden:true})}`);
            self.logger.log(`Body: ${jsn}`);
            return local.message.reply("Image API returned a non-safe image! Please try again later.");
        }
        var short = await self.shortenUrl(`https://inkbunny.net/s/${submission.submission_id}`);
        var extra = short.new ? `**This is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
        var attachment = new self.Discord.MessageAttachment(submission.file_url_full,submission.file_name)
        return local.channel.send(`${extra}${submission.title} (type ${submission.type_name}) by ${submission.username}\n<${short.url}>\nRequested By: ${local.author.tag}\nRID: ${jsn.rid}`,attachment)
    }catch(e){
        self.logger.error(`Error:\n${e}`);
        self.logger.log(`${self.util.inspect(jsn,{depth:3})}`);
        var attachment = new self.Discord.MessageAttachment(self.config.images.serverError);
        return local.channel.send("Unknown API Error",attachment);
    }
})