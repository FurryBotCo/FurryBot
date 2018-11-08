module.exports = (async(self) => {
    var resp = await self.request("https://api.furrybot.me/commands", {
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
    self.debug("Command Timeouts & Command List loaded");
    self.log(`Bot has started with ${self.users.size} users in ${self.channels.size} channels of ${self.guilds.size} guilds.`);

    self.embed_defaults_na = {"footer": {text: `Shard ${self.shard !== null?self.shard.id+"/"+self.shard.count+0:"1/1"} - Bot Version ${self.config.bot.version}`}, "color": self.randomColor(), "timestamp": self.getCurrentTimestamp(),"thumbnail": {"url": "https://i.furrybot.me/furry-small.png"}};
    self.embed_defaults_nt = {"footer": {text: `Shard ${self.shard !== null?self.shard.id+"/"+self.shard.count+0:"1/1"} - Bot Version ${self.config.bot.version}`}, "color": self.randomColor(), "timestamp": self.getCurrentTimestamp()};
    self.user.setActivity("Debugging!", {type: "PLAYING"});
});