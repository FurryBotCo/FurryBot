const config = require("./config");

class FurryBotServer {
    constructor(cnf) {
        this.config = config;
        this.cnf = cnf || this.config.serverOptions;
        this.express = require("express");
        this.logger = require("morgan");
        this.https = require("https");
        this.fs = require("fs");
        this.r = require("rethinkdbdash")(this.config.db.main);
        this.bodyParser = require("body-parser");
        //this.ro = require("rethinkdbdash")(this.config.db.other);
    }

    load(client) {
        this.server = this.express();
        const checkAuth = ((req,res,next)=>{
            if(!next) return !((!req.headers.authorization || req.headers.authorization !== this.config.serverOptions.apiKey) && (!req.query.auth || req.query.auth !== this.config.serverOptions.apiKey));
            if((!req.headers.authorization || req.headers.authorization !== this.config.serverOptions.apiKey) && (!req.query.auth || req.query.auth !== this.config.serverOptions.apiKey)) return res.status(401).json({
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
        .use(this.bodyParser.json())
        .use(this.bodyParser.urlencoded({
            extended: true
        }))
        .get("/stats",async(req,res)=>{
            var userCount = 0;
			var largeGuildCount = client.guilds.filter(g=>g.large).size;
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
                        used: client.memory.process.getUsed(),
                        total: client.memory.process.getTotal()
                    },
                    system: {
                        used: client.memory.system.getUsed(),
                        total: client.memory.system.getTotal()
                    }
                },
                largeGuildCount,
                apiVersion: this.config.bot.apiVersion,
                botVersion: this.config.bot.version,
                discordjsVersion: client.Discord.version,
                nodeVersion: process.version,
                dailyJoins,
				commandCount: client.commandList.length,
				messageCount: await this.r.table("stats").get("messageCount")("count"),
				dmMessageCount: await this.r.table("stats").get("messageCount")("dmCount")
            });
        })
        .get("/stats/ping",async(req,res)=>{
            return res.status(200).json({
                success: true,
                ping:Math.round(client.ws.ping)
            });
        })
        .get("/commands",async(req,res)=>{
            const commands = require("./commands");
            var cmds = {};

            commands.map(c=>c.name.toLowerCase()).forEach((c)=>{
                cmds[c] = {};
            });

            commands.map(c=>c.commands).forEach((cmd)=>{
                cmd.forEach((c)=>{

                });
            })
            commands.forEach((category)=>{
                category.commands.forEach((cmd)=>{
                    var cc = Object.assign({},cmd);;
					delete cc.run;
                    cmds[category.name.toLowerCase()][cmd.triggers[0]] = cc;
                })
            });
            return res.status(200).json({success:true,list:cmds});
        })
        .get("/status",async(req,res)=>{
            return res.status(200).json({
                success: true,
                clientStatus: client.user.presence.status
            });
        })
        .get("/checkauth",checkAuth,async(req,res)=>{
            res.status(200).json({success:true});
        })

        // guilds section
        .get("/guilds",async(req,res)=>{
            var jsn = {
                success: true,
                guildCount: client.guilds.size
            }
            if(checkAuth(req,res,false)) {
                jsn.guilds = client.guilds.map(g=>({[g.id]:{name:g.name,memberCount:g.memberCount}}));
            }
            res.status(200).json(jsn);
        })
        .get("/guilds/:id/shard",checkAuth,async(req,res) => {
            if(!client.guilds.has(req.params.id)) return res.status(404).json({
                success: false,
                error: "invalid guild id"
            });
            return res.status(200).json({
                success: true,
                shardId: client.guilds.get(req.params.id).shardID,
                shardCount: client.options.shardCount
            });
        })
        .post("/dev/eval",checkAuth,async(req,res)=>{
            console.log(req.body);
            if(!req.body.code) return res.status(400).json({ success: false, message: "missing code" });
            for(let b of  this.config.evalBlacklist) {
                if(b.test(req.body.code)) return res.status(400).json({ success: false, message: "blacklisted code found"});
            }
            const start = client.performance.now(),
            result = await eval(req.body.code),
            end = client.performance.now();
            return res.status(200).json({ success: true, result, time: (end-start).toFixed(3) });
        });
        if(![undefined,null,""].includes(this.cnf.ssl) && this.cnf.ssl === true) {
            if(this.cnf.port === 80) throw new Error("ssl server cannot be ran on insecure port");
            var privateKey = this.fs.readFileSync(`${this.config.rootDir}/ssl/ssl.key`);
            var certificate = this.fs.readFileSync(`${this.config.rootDir}/ssl/ssl.crt`);

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