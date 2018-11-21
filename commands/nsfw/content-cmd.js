module.exports = (async (self,local) => {
    
    if(self.os.hostname() !== "FURRYBOT-SERVER") return local.message.reply("This bot is not running on its main server, so this command is disabled!");
    const gay = await self.fsn.readdir("D:\\xampp\\websites\\furcdn.net\\webroot\\furrybot\\nsfw\\yiff\\gay").then((f)=>f.length),
        straight = await self.fsn.readdir("D:\\xampp\\websites\\furcdn.net\\webroot\\furrybot\\nsfw\\yiff\\straight").then((f)=>f.length),
        bulge = await self.fsn.readdir("D:\\xampp\\websites\\furcdn.net\\webroot\\furrybot\\nsfw\\bulge").then((f)=>f.length);

        return local.channel.send(`Content Counts\n\n**Gay**: ${gay}\n**Straight**: ${straight}\n**Bulge**: ${bulge}\n**Total**: ${gay.length+straight.length+bulge.length}`);
});