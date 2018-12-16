module.exports = (async(self)=>{
    return new Promise(async(resolve,reject)=>{
        
        var j = await self.r.table(self.config.db.tables.stats).get("messageCount");
        
        if(!j) {
            await self.r.table(self.config.db.tables.stats).insert({
                id: "messageCount",
                count: 0,
                dmCount: 0,
            });
            
            var j = await self.r.table(self.config.db.tables.stats).get("messageCount");
        }
        
        await self.r.table(self.config.db.tables.stats).get("messageCount").update({
            count: +j.count + self.stats.messagesSinceLastPost,
            dmCount: +j.dmCount + self.stats.dmMessagesSinceLastPost
        });
        
        self.stats.messagesSinceLastPost = 0;
        self.stats.dmMessagesSinceLastPost = 0;
        //self.stats.commandTotalsSinceLastPost = 0;
        
        if(!self.logger) {
            console.debug("Posted db stats");
        } else {
            self.logger.debug("Posted db stats");
        }
        
       // return self.r.table("stats").get("general").without("id");
        resolve(self.r.table(self.config.db.tables.stats).get("messageCount"));
    });
})