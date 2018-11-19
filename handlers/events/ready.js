module.exports = (async(self) => {
    self.logger = new self.FurryBotLogger(self);
    var resp = await self.request(`https://api.furrybot.me/commands${self.config.beta?"?beta":""}`, {
        method: "GET",
        headers: {
            Authorization: `Key ${self.config.apiKey}`
        }
    });
    var response = JSON.parse(resp.body);
    self.config.commandList = {fullList: response.return.fullList, all: response.return.all};
    self.config.commandList.all.forEach((command)=>{
        self.commandTimeout[command] = new Set();
    });
    self.logger.debug("Command Timeouts & Command List loaded");
    self.logger.log(`Bot has started with ${self.users.size} users in ${self.channels.size} channels of ${self.guilds.size} guilds.`);

    self.rotatingStatus = self.setInterval(()=>{
        for(let key in self.config.bot.rotatingStatus) {
            var interval = key*15e3;
            setTimeout((st)=>{
                self.user.setActivity(eval(st.message),{type:st.type});
            },interval,self.config.bot.rotatingStatus[key]);
        }
    }, self.config.bot.rotatingStatus.length*15e3);
   self.logger.log(`ready with ${self.options.shardCount} shards!`);

     self.setInterval(()=>{
        self.voiceConnections.forEach((vc)=>{
            if(vc.channel.members.filter(m=>m.id!==self.user.id).size === 0) {
                vc.channel.leave();
                self.logger.log(`Left voice channel ${vc.channel.name} (${vc.channel.id}) due to 30+ seconds of inactivity.`);
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
    
});