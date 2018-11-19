module.exports = (async(self)=>{
    return new Promise(async(resolve,reject)=>{
        
        var j = await self.r.table("stats").get("general");
        
        if(!j) {
            await self.r.table("stats").insert({
                id: "general",
                channelCount: 0,
                guildCount: 0,
                userCount: 0,
                shardCount: 0,
                messageCount: 0,
                dmMessageCount: 0,
                commandTotals: 0
            });
            
            var j = await self.r.table("stats").get("general");
        }
        
        var channelCount =  self.channels.size,
        guildCount = self.guilds.size,
        userCount = self.users.size,
        shardCount = self.options.shardCount;
        
        await self.r.table("stats").get("general").update({
            channelCount,
            guildCount,
            userCount,
            shardCount,
            messageCount: +j.messageCount + self.stats.messagesSinceLastPost,
            dmMessageCount: +j.dmMessageCount + self.stats.dmMessagesSinceLastPost,
            commandTotals: +j.commandTotals + self.stats.commandTotalsSinceLastPost
        });
        
        self.stats.messagesSinceLastPost = 0;
        self.stats.dmMessagesSinceLastPost = 0;
        self.stats.commandTotalsSinceLastPost = 0;
        
        if(!self.logger) {
            console.debug("Posted db stats");
        } else {
            self.logger.debug("Posted db stats");
        }
        
       // return self.r.table("stats").get("general").without("id");
        resolve(self.r.table("stats").get("general").without("id"));
    });
})