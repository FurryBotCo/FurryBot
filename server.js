const express = require("express"),
    config = require("./config");

class FurryBotServer {
    constructor() {
        this.config = config;
        this.express = express;
    }

    load(client) {
        this.server = this.express();
        this.server.use(async(req,res,next)=>{
            //if((!req.headers.authorization || req.headers.authorization !== this.config.apiKey) && (!req.query.auth || req.query.auth !== this.config.apiKey)) return res.status(403).json({success:false,error:"invalid credentials"});
            next();
        });
        this.server.get("/status",async(req,res)=>{
            var userCount = 0;
            var largeGuildCount=0;
            var rq = await client.request(`https://api.uptimerobot.com/v2/getMonitors`,{
                method: "POST",
                headers: {
                    "Cache-Control": "no-cache",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                form: {
                    api_key: this.config.uptimeRobot.apiKey,
                    format: "json"
                }
            });
            var st = JSON.parse(rq.body);
            console.log(st);
            var srv=Array.from(client.guilds.values());
            for(let i=0;i<srv.length;i++) {
                if(!srv[i].unavailable) {
                    if(srv[i].large) {
                        largeGuildCount++;
                    }
                } else {
                    console.log(`Guild Unavailable: ${srv[i].name} (${srv[i].id})`);
                }
            }
            client.guilds.forEach((g)=>userCount+=g.memberCount);
            return res.status(200).json({
                success:true,
                clientStatus:client.user.presence.status,
                guildCount:client.guilds.size,userCount,
                shardCount:client.options.shardCount,
                memoryUsage: {
                    process: {
                        used: client.getUsedMemory(),
                        total: client.getTotalMemory()
                    },
                    server: {
                        used: client.getSYSUsed(),
                        total: client.getSYSTotal()
                    }
                },
                largeGuildCount,
                apiVersion: this.config.bot.apiVersion,
                botVersion: this.config.bot.version,
                discordjsVersion: client.Discord.version,
                nodeVersion: process.version,
                monitors: {
                    website: st.monitors.filter(m=>m.id===parseInt(this.config.uptimeRobot.monitors.website),10)[0].status,
                    cdn: st.monitors.filter(m=>m.id===parseInt(this.config.uptimeRobot.monitors.cdn,10))[0].status
                }
            });
        });
        this.server.get("/ping",async(req,res)=>{
            return res.status(200).json({ping:Math.round(client.ws.ping)});
        });
       return this.server.listen(this.config.serverPort,this.config.bindIp,(()=>{client.logger.log("listening")}));
    }
}

module.exports = FurryBotServer;