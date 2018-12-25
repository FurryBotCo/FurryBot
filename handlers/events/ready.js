module.exports = (async(self) => {
    self.logger = new self.FurryBotLogger(self);
    self.logger.log(`Bot has started with ${self.users.size} users in ${self.channels.size} channels of ${self.guilds.size} guilds.`);
    const rotatingStatus = (async()=>{
		self.user.setActivity(`🐾 Debugging! 🐾`,{type: "PLAYING"}).then(()=>{
            setTimeout(()=>{
                self.user.setActivity(`🐾 ${self.config.defaultPrefix}help for help! 🐾`,{type: "PLAYING"}).then(()=>{
                    setTimeout(()=>{
                        self.user.setActivity(`🐾 ${self.config.defaultPrefix}help in ${self.guilds.size} guilds! 🐾`,{type: "PLAYING"}).then(()=>{
                            setTimeout(()=>{
                                self.user.setActivity(`🐾 ${self.config.defaultPrefix}help with ${self.users.size} users! 🐾`,{type: "WATCHING"}).then(()=>{
                                    setTimeout(()=>{
                                        self.user.setActivity(`🐾 ${self.config.defaultPrefix}help in ${self.channels.size} channels! 🐾`,{type: "LISTENING"}).then(()=>{
                                            setTimeout(()=>{
                                                self.user.setActivity(`🐾 ${self.config.defaultPrefix}help with ${self.options.shardCount} shard${self.options.shardCount>1?"s":""}! 🐾`,{type: "PLAYING"});
                                            },15e3);
                                        });
                                    },15e3);
                                });
                            },15e3);
                        });
                    },15e3);
                });
            },15e3);
        });
    });

    rotatingStatus();
    setInterval(rotatingStatus,75e3)
   self.logger.log(`ready with ${self.options.shardCount} shard${self.options.shardCount>1?"s":""}!`);

     self.setInterval(()=>{
        self.voiceConnections.forEach((vc)=>{
            if(vc.channel.members.filter(m=>m.id!==self.user.id).size === 0) {
                vc.channel.leave();
                self.logger.log(`Left voice channel ${vc.channel.name} (${vc.channel.id}) due to inactivity.`);
            }
        });
   },3e4);
   
   self.db = new self.FurryBotDatabase(self);
   
    await self.dbStats(self);
    // post general stats to db every 60 seconds
    self.setInterval(self.dbStats,6e4,self);
    
    /*var webhookData = {
        title: `Shard #${self.shard.id} is ready`,
        timestamp: self.getCurrentTimestamp()
    }*/
    
    //var webhookEmbed = new self.Discord.MessageEmbed(webhookData);
    
    //self.webhooks.shards.send(webhookEmbed);
    self.srv = self.server.load(self);
    if(!self.config.beta) {
        //const ls = self.listStats(self);
        setInterval(self.listStats,3e5,self);
    }

	setInterval(async()=>{
		if(["00:00:00"].includes(self.getDateTime())) {
			var date = new Date(),
			d = `${date.getMonth()+1}-${date.getDate()-1}-${date.getFullYear()}`,
			count = (await self.db.getStats("dailyjoins"))[d]||0;
			var data = {
				author: {
					name: "Donovan_DMC#1337",
					"icon_url": "https://i.donovand.info/Don.gif"
				},
				title: `Total Guilds Joined ${d}\t Current Total: ${self.guilds.size}`,
				description: `Total Guilds Joined Today: **${count}**`,
				footer: {
					text: `Shard ${self.guilds.get(self.config.bot.mainGuild).shard.id}/${self.options.shardCount} | Bot Version ${self.config.bot.version}`
				},
				color: self.randomColor(),
				timestamp: self.getCurrentTimestamp(),
				thumbnail: {
					url: "https://i.furry.bot/furry-small.png"
				}
			}
			var embed = new self.Discord.MessageEmbed(data);
			self.channels.get(self.config.bot.channels.daily).send(embed).then(n=>{
				self.logger.log(`Posted daily stats, ${d}: ${count}, total: ${self.guilds.size}`);
			}).catch(self.logger.log);
		}
    },1e3);
    console.log("end of ready");
});