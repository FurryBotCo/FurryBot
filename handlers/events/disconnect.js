module.exports = (async(self)=>{
    self.logger.debug(`Close via Disconnect event`);
    var webhookData = {
        title: `Shard #${self.shard.id} disconnected`,
        timestamp: self.getCurrentTimestamp()
    }
    var webhookEmbed = new self.Discord.MessageEmbed(webhookData);
    self.webhooks.shards.send(webhookEmbed);
    process.exit();
})