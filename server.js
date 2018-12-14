const express = require("express"),
    config = require("./config");

class FurryBotServer {
    constructor(cnf) {
        this.cnf = cnf || {};
        this.config = config;
        this.express = express;
        this.logger = require("morgan");
        this.https = require("https");
        this.fs = require("fs");
        this.r = require("rethinkdbdash")(this.config.db.bot);
        //this.ro = require("rethinkdbdash")(this.config.db.other);
    }

    load(client) {
        this.server = this.express();
        this.checkAuth = ((req,res,next)=>{
            if(!next) return !((!req.headers.authorization || req.headers.authorization !== this.config.apiKey) && (!req.query.auth || req.query.auth !== this.config.apiKey));
            if((!req.headers.authorization || req.headers.authorization !== this.config.apiKey) && (!req.query.auth || req.query.auth !== this.config.apiKey)) return res.status(401).json({
                success: false,
                error: "invalid credentials"
            });
            next();
        });
        this.server.use(async(req,res,next)=>{
            // return res.status(403).json({success:false,error:"invalid credentials"});
            next();
        })
        .use(this.logger("dev"))
        .get("/stats",async(req,res)=>{
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
            var d = new Date();
            var date = `${d.getMonth().toString().length > 1 ? d.getMonth()+1 : `0${d.getMonth()+1}`}-${d.getDate().toString().length > 1 ? d.getDate() : `0${d.getDate()}`}-${d.getFullYear()}`;
            var a = await this.r.table("dailyjoins").getAll(date);
            var dailyJoins = a.length >= 1 ? a[0].count : null;
            return res.status(200).json({
                success:true,
                clientStatus: client.user.presence.status,
                guildCount: client.guilds.size,userCount,
                shardCount: client.options.shardCount,
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
                dailyJoins,
                monitors: {
                    website: st.monitors.filter(m=>m.id===parseInt(this.config.uptimeRobot.monitors.website),10)[0].status,
                    cdn: st.monitors.filter(m=>m.id===parseInt(this.config.uptimeRobot.monitors.cdn,10))[0].status
                }
            });
        })
        .get("/stats/guilds",async(req,res)=>{
            var jsn = {
                success: true,
                guildCount: client.guilds.size
            }
            if(this.checkAuth(req,res,false)) {
                jsn.guilds = client.guilds.map(g=>({[g.id]:{name:g.name,memberCount:g.memberCount}}));
            }
            res.status(200).json(jsn);
        })
        .get("/stats/ping",async(req,res)=>{
            return res.status(200).json({
                success: true,
                ping:Math.round(client.ws.ping)
            });
        })
        .get("/status",async(req,res)=>{
            return res.status(200).json({
                success: true,
                clientStatus: client.user.presence.status
            });
        })
        .get("/checkauth",this.checkAuth,async(req,res)=>{
            res.status(200).json({success:true});
        })
        if(![undefined,null,""].includes(this.cnf.ssl) && this.cnf.ssl === true) {
            if(this.cnf.port === 80) throw new Error("ssl server cannot be ran on insecure port");
            var privateKey = this.fs.readFileSync(`${client.config.rootDir}/ssl/ssl.key`);
            var certificate = this.fs.readFileSync(`${client.config.rootDir}/ssl/ssl.crt`);

            return this.https.createServer({
                key: privateKey,
                cert: certificate
            }, this.server).listen(this.cnf.port,this.cnf.bindIp,(()=>{client.logger.log("listening")}));
        } else {
            return this.server.listen(this.cnf.port,this.cnf.bindIp,(()=>{client.logger.log("listening")}));
        }
    }
}

module.exports = FurryBotServer;