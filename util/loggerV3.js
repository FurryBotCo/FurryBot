/*
Furry Bot™ Custom Logger V3
11-14-18 - Trademark (™) Donovan_DMC & Furry Bot Limited 
*/

const config = require("../config"),
    chalk = require("chalk"),
    util = require("util"),
    path = require("path");

class FurryBotLogger {
    constructor(client) {
        this.config = config;
        this.chalk = chalk;
        this.util = util;
        this.path = path;
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
        this.methods = ["log"];
    }

    async log(msg) {
        var color = this.chalk.green,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("LOG"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
            //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            msg   = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        process.stdout.write(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${msg}\n`);
    }

    async warn(msg) {
        var color = this.chalk.yellow,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("WARN"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
            //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            msg   = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        process.stdout.write(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${msg}\n`);
    }

    async error(msg) {
        var color = this.chalk.red,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("ERROR"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
           //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            msg   = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        process.stdout.write(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${msg}\n`);
    }

    async debug(msg) {
        var color = this.chalk.blue,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("DEBUG"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
            //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            msg   = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        process.stdout.write(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${msg}\n`);
    }

    async info(msg) {
        var color = this.chalk.blue,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("INFO"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
            //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            msg   = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        process.stdout.write(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${msg}\n`);
    }

    async rethinkdb(msg) {
        var color = this.chalk.blue,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("RETHINKDB"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
            //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            msg   = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        process.stdout.write(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${msg}\n`);
    }

    get rethinkdblog() {
        return this.rethink
    }

    async command(msg) {
        var color = this.chalk.blue,
            extra = this.config.beta ? this.chalk.magenta("BETA") : "",
            type  = color.bold("COMMAND"),
            time  = this.chalk.blue.bold(Date().toString().split(" ")[4]),
            //shard = this.client !== null ? this.isSharded ? this.chalk.magenta.bold("Shard 1/1") : this.chalk.magenta.bold(`Shard ${+this.shardID+1}/${this.shardCount}`) : this.chalk.magenta.bold("General"),
            msg   = msg instanceof Object ? color.bold(this.util.inspect(msg,{depth:null})) : color.bold(msg),
            file  = typeof this._getCallerFile() !== "undefined" ? this.chalk.magenta.bold(this.path.basename(this._getCallerFile())) : this.chalk.magenta.bold("unknown.js");
        process.stdout.write(`${[undefined,null,""].includes(extra) ? "" : `[${extra}]`}[${type}][${time}][${file}]: ${msg}\n`);
    }

    get commandlog() {
        return this.command
    }
}

module.exports = FurryBotLogger;