module.exports = (async function() {
    this.analytics.track({
        userId: "CLIENT",
        event: "client.events.disconnect",
        properties: {
            bot: {
                version: this.config.bot.version,
                beta: this.config.beta,
                alpha: this.config.alpha,
                server: this.os.hostname()
            }
        }
    });
    if(!this.logger) console.log("Close via Disconnect event");
    else this.logger.debug("Close via Disconnect event");

    process.exit();
});