/*
Furry Bot™ Custom Logger V3
11-14-18 - Trademark (™) Donovan_DMC & Furry Bot Limited 
*/

const config = require("../config"),
    EventEmitter = require("events");

class FurryBotLogger extends EventEmitter {
    constructor(client) {
        super();
        this.config = config;
        this.chalk = require("chalk");
        this.util = require("util");
        this.path = require("path");
        this.fs = require("fs");
        this.fsn = require("fs-nextra");
        this.os = require("os");
        this.WebSocket = require("ws");
        this.https = require("https");
        this.server = new this.https.createServer({
            cert: this.fs.readFileSync(`${this.config.rootDir}/ssl/ssl.crt`),
            key: this.fs.readFileSync(`${this.config.rootDir}/ssl/ssl.key`)
        });
        this.wss = new this.WebSocket.Server({server:this.server});
        this.wss.broadcast = ((data)=>{
            this.wss.clients.forEach((client)=>{
                if(client.readyState === this.WebSocket.OPEN) client.send(data);
            });
            return true;
        });   
        this.wss.on("connection",async(socket,req)=>{
            const url = {
                host: req.headers.host.split(":")[0],
                port: req.headers.host.split(":")[1],
                path: req.url.split("?")[0],
                params: {}
            };
            var a = req.url.split("?")[1]||"";
            var b = a.split("&");
            if(b.length !== 0 && b[0] !== "") b.forEach((p)=>{
                var j = p.split("=");
                url.params[j[0]]=j[1]||null;
            });
            if(!url.params.auth || url.params.auth !== this.config.universalKey) {
                socket.send(JSON.stringify({success:false,error:"Invalid Authentication"}));
                socket.close();
            }
            socket.send(JSON.stringify({success:true,message:"Connection Accepted, Authorization Valid",wsType:"EHELLO",type:"IDENTIFY"}));
        });
        this.on("log",async(args)=>{
            this.wss.broadcast(JSON.stringify({type:args.type||null,message:args.message||null,beta:this.config.beta,file:args.file||null,time:args.time||null,console:true}));
        });
        this.server.listen(8888,this.config.serverOptions.bindIp);
        this.client = !client ? null : client;
        //this.isSharded = this.client !== null ? ![undefined,null].includes(this.client.shard) ? true : false : false;
        //this.shardID = this.isSharded ? this.client.shard.id : 0;
        //this.shardCount = this.isSharded ? this.client.shard.count : 1;
        this._getCallerFile = (()=>{
            try {
                var err = new Error();
                var callerfile;
                var currentfile;
        
                Error.prepareStackTrace = function (err, stack) { return stack; };
        
                currentfile = err.stack.shift().getFileName();
        
                while (err.stack.length) {
                    callerfile = err.stack.shift().getFileName();
        
                    if(currentfile !== callerfile) return callerfile;
                }
            } catch (err) {}
            return undefined;
        });
    }

    async log(msg) {
        var color = this.chalk.green,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("LOG"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
            //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            m   = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        this._log(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${m}${this.os.EOL}`);
        this.emit("log",{type:"log",message:msg,time:Date().toString().split(" ")[4],file:this.path.basename(this._getCallerFile())});
    }

    async warn(msg) {
        var color = this.chalk.yellow,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("WARN"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
            //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            m     = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        this._log(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${m}${this.os.EOL}`);
        this.emit("log",{type:"warn",message:msg,time:Date().toString().split(" ")[4],file:this.path.basename(this._getCallerFile())});
    }

    async error(msg) {
        var color = this.chalk.red,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("ERROR"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
           //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            m     = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        this._log(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${m}${this.os.EOL}`);
        this.emit("log",{type:"error",message:msg,time:Date().toString().split(" ")[4],file:this.path.basename(this._getCallerFile())});
    }

    async debug(msg) {
        var color = this.chalk.blue,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("DEBUG"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
            //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            m     = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        this._log(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${m}${this.os.EOL}`);
        this.emit("log",{type:"debug",message:msg,time:Date().toString().split(" ")[4],file:this.path.basename(this._getCallerFile())});
    }

    async info(msg) {
        var color = this.chalk.blue,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("INFO"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
            //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            m     = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        this._log(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${m}${this.os.EOL}`);
        this.emit("log",{type:"info",message:msg,time:Date().toString().split(" ")[4],file:this.path.basename(this._getCallerFile())});
    }

    async rethinkdb(msg) {
        var color = this.chalk.blue,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("RETHINKDB"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
            //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            m     = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        this._log(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${m}${this.os.EOL}`);
        this.emit("log",{type:"info",message:msg,time:Date().toString().split(" ")[4],file:this.path.basename(this._getCallerFile())});
    }

    get rethinkdblog() {
        return this.rethink
    }

    async command(msg) {
        var color = this.chalk.green,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("COMMAND"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
            //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            m     = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        this._log(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${m}${this.os.EOL}`);
        this.emit("log",{type:"command",message:msg,time:Date().toString().split(" ")[4],file:this.path.basename(this._getCallerFile())});
    }

    get commandlog() {
        return this.command;
    }

    _getDate() {
        var date = new Date();
        return `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`;
    }

    async _log(msg) {
        if(process.stdout.writable) process.stdout.write(msg);
        await this.fsn.pathExists(`${this.config.rootDir}/logs`).then(async()=>{
            await this.fsn.appendFile(`${this.config.rootDir}/logs/${this._getDate()}.txt`,msg.replace(/\[[0-9]([0-9])?m/g,""));
        }).catch(e=>{
            process.stdout.write(`Error logging to file: ${e}`);
        })
        return true;
    }
}

module.exports = FurryBotLogger;

process.on('unhandledRejection', (p) => {
	console.error("Unhandled Promise Rejection:");
	console.error(p);
});