import * as fs from "fs";
import chalk, { Chalk } from "chalk";
import _getCallerFile from "@util/_getCallerFile";
import os from "os";
import config from "@config";

class Logger {
    constructor() {

    }

    async log(msg: string | any[] | Object | Buffer | Promise<any>): Promise<boolean> {
        return this._log("log", msg);
    }

    async warn(msg: string | any[] | Object | Buffer | Promise<any>): Promise<boolean> {
        return this._log("warn", msg);
    }

    async error(msg: string | any[] | Object | Buffer | Promise<any>): Promise<boolean> {
        return this._log("error", msg);
    }

    async info(msg: string | any[] | Object | Buffer | Promise<any>): Promise<boolean> {
        return this._log("info", msg);
    }

    async debug(msg: string | any[] | Object | Buffer | Promise<any>): Promise<boolean> {
        return this._log("debug", msg);
    }

    async command(msg: string | any[] | Object | Buffer | Promise<any>): Promise<boolean> {
        return this._log("info", msg);
    }

    async _log(type: "log" | "warn" | "error" | "info" | "debug", msg: string | any[] | Object | Buffer | Promise<any>): Promise<boolean> {
        if (!process.stdout.writable) return false;
        if (typeof msg !== "string") {
            if (msg instanceof Promise) msg = await msg;
            //if (msg instanceof Array) msg = msg.join(" ");
            try {
                if (typeof msg === "object") msg = JSON.stringify(msg);
            } catch (e) {
                // apparently some random error throws the Logger class into here,
                // throwing a circular error which then screws up more by being thrown above the logger
            }
            if (msg instanceof Buffer) msg = msg.toString();
            if (msg instanceof Function) msg = msg.toString();
        }
        const date = new Date();
        const d = date.toString().split(" ")[4];
        const logDir = `${__dirname}/../../logs`;
        if (!fs.existsSync(logDir)) {
            process.stderr.write(`log directory (${logDir}) does not exist\n`);
            return false;
        }
        let c: Chalk;
        switch (type.toLowerCase()) {
            case "log":
                c = chalk.green;
                break;

            case "warn":
                c = chalk.yellow;
                break;

            case "error":
                c = chalk.red;
                break;

            case "info":
                c = chalk.green;
                break;

            case "debug":
                c = chalk.cyan;
                break;
        }
        if (msg.toString().indexOf(config.bot.token)) msg = msg.toString().replace(new RegExp(config.bot.token, "g"), "[TOKEN]");
        fs.appendFileSync(`${logDir}/${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}.log`, `[${d}][${type}]: ${msg}${os.EOL}`);
        process.stdout.write(`${chalk.grey(`[${chalk.blue(d)}][${c(type)}]: ${c(msg.toString())}`)}\n`);
        return true;
    }
}

export default Logger;