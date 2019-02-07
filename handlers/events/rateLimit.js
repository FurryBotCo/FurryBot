module.exports = (async(client,rateLimitInfo)=>{
    client.logger.warn(`Ratelimit: ${client.util.inspect(rateLimitInfo,{showHidden: true, depth: null, color: true})}`);
    var data = {
        title: `Ratelimited - Timeout: ${client.ms(rateLimitInfo.timeout)}`,
        fields: [
            {
                name: "Limit",
                value: rateLimitInfo.limit,
                inline: false
            },{
                name: "Method",
                value: rateLimitInfo.method.toUpperCase(),
                inline: false
            },{
                name: "Path",
                value: rateLimitInfo.path,
                inline: false
            },{
                name: "Route",
                value: rateLimitInfo.route,
                inline: false
            }
        ],
        timestamp: new Date().toISOString(),
        color: 16762455
    }
    var embed = new client.Discord.MessageEmbed(data);
    return client.channels.get(client.config.bot.channels.rateLimit).send(embed).catch(noerr => null);
});