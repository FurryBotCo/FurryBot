const express = require("express"),
    config = require("./config");

class FurryBotServer {
    constructor() {
        this.config = config;
        this.express = express;
    }

    load(client) {
        this.server = this.express();
        this.server.use((req,res,next)=>{
            if((!req.headers.authorization || req.headers.authorization !== this.config.apiKey) && (!req.query.auth || req.query.auth !== this.config.apiKey)) return res.status(403).json({success:false,error:"invalid credentials"});
            next();
        });
        this.server.get("/status",(req,res)=>{
            var userCount = 0;
            client.guilds.forEach((g)=>userCount+=g.memberCount);
            return res.status(200).json({success:true,clientStatus:client.user.presence.status,guildCount:client.guilds.size,userCount,shardCount:client.options.shardCount});
        })
       return this.server.listen(this.config.serverPort,this.config.bindIp,(()=>{client.log("listening")}));
    }
}

module.exports = FurryBotServer;