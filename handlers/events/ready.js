module.exports = (async(self) => {
    self.logger = new (require(`${self.config.rootDir}/util/loggerV3.js`))(self);
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
    console.debug("Command Timeouts & Command List loaded");
    console.log(`Bot has started with ${self.users.size} users in ${self.channels.size} channels of ${self.guilds.size} guilds.`);

    self.rotatingStatus = self.setInterval(()=>{
        for(let key in self.config.bot.rotatingStatus) {
            var interval = key*15e3;
            setTimeout((st)=>{
                self.user.setActivity(eval(st.message),{type:st.type});
            },interval,self.config.bot.rotatingStatus[key]);
        }
    }, self.config.bot.rotatingStatus.length*15e3);
    self.player = new self.PlayerManager(self, self.config.musicPlayer.nodes, {
        user: self.user.id,
        shards: self.options.shardCount
    });
   console.log(`Shard #${self.shard.id} Logged in (${+self.shard.id+1}/${self.options.totalShardCount})`);
});