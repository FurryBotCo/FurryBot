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
	run: (async(client,message)=>{
        const msg = await message.channel.send(`Fetching.. ${client.config.emojis.load}`);
        if(!client.config.apis.inkbunny.sid) {
            await client.fsn.readFile(`${process.cwd()}/inkbunny-sid.txt`,"UTF8").then(async(sid) => {
                if(sid === "") sid = "nosid";
                var req = await client.request(`https://inkbunny.net/api_userrating.php?sid=${sid}`,{
                    method: "GET",
                    headers: {
                        "User-Agent": client.config.web.userAgent
                    }
                });
                var a = JSON.parse(req.body);
                if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
                    switch(a.error_code) {
                        case 2:
                            var login = await client.request(`https://inkbunny.net/api_login.php?${client.config.apis.inkbunny.urlCredentials}`,{
                                method: "GET",
                                headers: {
                                    "User-Agent": client.config.web.userAgent
                                }
                            });
                            var b = JSON.parse(login.body);
                            if(typeof b.error_code !=="undefined" && typeof b.sid === "undefined") {
                                switch(b.error_code) {
                                    case 0:
                                        client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: Invalid Credentials`);
                                        break;
                    
                                    default:
                                        client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${e}`);
                                }
                            } else {
                                await client.fsn.writeFile(`${process.cwd()}/inkbunny-sid.txt`,b.sid);
                                client.config.apis.inkbunny.sid = b.sid;
                                client.logger.log(`[CommandHandler:${message.command}][InkbunnyLogin]: Generated new SID`);
                            }
                            break;
            
                        default:
                            client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${e}`);
                    }
                } else {
                    client.config.apis.inkbunny.sid = a.sid;
                }
            }).catch(async(e)=>{
                if(e.code === "ENOENT") {
                    var a = await client.request(`https://inkbunny.net/api_login.php?${client.config.apis.inkbunny.urlCredentials}`,{
                        method: "GET",
                        headers: {
                            "User-Agent": client.config.web.userAgent
                        }
                    });
                    if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
                        switch(a.error_code) {
                            case 0:
                                client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: Invalid Credentials`);
                                break;
            
                            default:
                                client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${e}`);
                        }
                    } else {
                        await client.fsn.writeFile(`${process.cwd()}/inkbunny-sid.txt`,a.sid);
                        client.config.apis.inkbunny.sid = a.sid;
                        client.logger.log(`[CommandHandler:${message.command}][InkbunnyLogin]: Generated new SID`);
                    }
                } else {
                    client.logger.error(e);
                }
            });
        } else {
            var req = await client.request(`https://inkbunny.net/api_userrating.php?sid=${client.config.apis.inkbunny.sid}`,{
                    method: "GET",
                    headers: {
                        "User-Agent": client.config.web.userAgent
                    }
                });
                var a = JSON.parse(req.body);
                if(typeof a.error_code !=="undefined" && typeof a.sid === "undefined") {
                    switch(a.error_code) {
                        case 2:
                            var login = await client.request(`https://inkbunny.net/api_login.php?${client.config.apis.inkbunny.urlCredentials}`,{
                                method: "GET",
                                headers: {
                                    "User-Agent": client.config.web.userAgent
                                }
                            });
                            var b = JSON.parse(login.body);
                            if(typeof b.error_code !=="undefined" && typeof b.sid === "undefined") {
                                switch(b.error_code) {
                                    case 0:
                                        client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: Invalid Credentials`);
                                        break;
                    
                                    default:
                                        client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${e}`);
                                }
                            } else {
                                await client.fsn.writeFile(`${process.cwd()}/inkbunny-sid.txt`,b.sid);
                                client.config.apis.inkbunny.sid = b.sid;
                                client.logger.log(`[CommandHandler:${message.command}][InkbunnyLogin]: Generated new SID`);
                            }
                            break;
            
                        default:
                            client.logger.error(`[CommandHandler:${message.command}][InkbunnyLogin]: ${e}`);
                    }
                } else {
                    client.config.apis.inkbunny.sid = a.sid;
                }
        }
        // blacklisted tags: cub, diaper, ass, upskirt, pantsu, incest, age_difference, boobhat, vore
        var req = await client.request(`https://inkbunny.net/api_search.php?sid=${client.config.apis.inkbunny.sid}&orderby=views&type=1,3,5,8,9&count_limit=50000&submissions_per_page=100&text=-cub%20-diaper%20-ass%20-upskirt%20-pantsu%20-incest%20-age_difference%20-boobhat%20-vore&random=yes&get_rid=yes`,{
            method: "GET",
            headers: {
                "User-Agent": client.config.web.userAgent
            }
        });
        
        try {
            var jsn = JSON.parse(req.body);
            var rr = Math.floor(Math.random()*jsn.submissions.length);
            var submission = jsn.submissions[rr];
            if(typeof submission.rating_id === "undefined") throw new Error("secondary");
            if(submission.rating_id !== "0") {
                client.logger.log(`unsafe image:\n${client.util.inspect(submission,{depth:3,showHidden:true})}`);
                client.logger.log(`Body: ${jsn}`);
                return msg.edit("Image API returned a non-safe image! Please try again later.").catch(err=>message.channel.send(`Command failed: ${err}`));
            }
            var attachment = new client.Discord.MessageAttachment(submission.file_url_full,submission.file_name)
            return msg.edit(`${submission.title} (type ${submission.type_name}) by ${submission.username}\n<https://inkbunny.net/s/${submission.submission_id}>\nRequested By: ${message.author.tag}\nRID: ${jsn.rid}\nIf a bad image is returned, blame the service, not the bot author!`).catch(err=>message.channel.send(`Command failed: ${err}`)).then(()=>message.channel.send(attachment)).catch(err=>message.channel.send(`Command failed: ${err}`));
        }catch(e){
            client.logger.error(`Error:\n${e}`);
            client.logger.log(`${client.util.inspect(jsn,{depth:3})}`);
            var attachment = new client.Discord.MessageAttachment(client.config.images.serverError);
            return msg.edit("Unknown API Error").then(()=>message.channel.send(attachment)).catch(err=>message.channel.send(`Command failed: ${err}`));
        }
    })
};