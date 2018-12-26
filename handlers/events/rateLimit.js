module.exports = (async(client,rateLimitInfo)=>{
    client.logger.warn(`Ratelimit: ${client.util.inspect(rateLimitInfo,{showHidden: true, depth: null, color: true})}`);
    var dt = {
        timestamp: new Date(),
        file: client.filename
    };
    
    Object.assign(dt,rateLimitInfo);
    client.mixpanel.track(`bot.events.rateLimit`,dt)
});