module.exports = (async(self,rateLimitInfo)=>{
    self.logger.warn(`Ratelimit: ${self.util.inspect(rateLimitInfo,{showHidden: true, depth: null, color: true})}`);
    var dt = {
        timestamp: new Date(),
        file: self.filename
    }
    Object.assign(dt,rateLimitInfo);
    self.mixpanel.track(`bot.events.rateLimit`,dt)
});