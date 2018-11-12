module.exports = (async(self) => {
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

   self.user.setActivity("Debugging!", {type: "PLAYING"});
   console.log(`Shard #${self.shard.id} Logged in (${+self.shard.id+1}/${self.shard.count})`);
   // TODO: test shard count = 1
});