import * as Eris from "eris";
import * as fs from "fs";
import config from "@src/config/config";
import Logger from "@Logger";
import cat from "./commands";
import Command from "@modules/cmd/Command";
import Category from "@modules/cmd/Category";
import functions from "@util/functions";
import Temp from "@util/Temp";
import MessageCollector from "@util/MessageCollector";

class FurryBot extends Eris.Client {
    logger: Logger;
    commands: Command[];
    categories: Category[];
    commandTriggers: string[];
    commandTimeout: {
        [key: string]: Set<string>
    };
    ucwords: (str: string) => string;
    srv: any;
    ls: any;
    Temp: Temp;
    MessageCollector: MessageCollector;
    yiffNoticeViewed: Set<string>;
    constructor(token: string, options: Eris.ClientOptions) {
        super(token, options);

        this.logger = new Logger();

        fs.readdirSync(`${__dirname}/handlers/events/client`).map(d => {
            let e = require(`${__dirname}/handlers/events/client/${d}`).default;
            this.on(e.event, e.listener.bind(this));
        });

        this.commands = cat.map(c => c.commands).reduce((a, b) => a.concat(b));
        this.categories = cat;
        this.commandTriggers = cat.map(c => c.commands).reduce((a, b) => a.concat(b)).map(c => c.triggers).reduce((a, b) => a.concat(b));

        this.commandTimeout = {};

        this.commands.map(c => this.commandTimeout[c.triggers[0]] = new Set());
        this.yiffNoticeViewed = new Set();

        this.ucwords = functions.ucwords;

        this.MessageCollector = new MessageCollector(this);

        global.console.log = (async (msg: string | any[] | Object | Buffer | Promise<any>): Promise<boolean> => this.logger._log("log", msg));
        global.console.info = (async (msg: string | any[] | Object | Buffer | Promise<any>): Promise<boolean> => this.logger._log("info", msg));
        global.console.debug = (async (msg: string | any[] | Object | Buffer | Promise<any>): Promise<boolean> => this.logger._log("debug", msg));
        global.console.warn = (async (msg: string | any[] | Object | Buffer | Promise<any>): Promise<boolean> => this.logger._log("warn", msg));
        global.console.error = (async (msg: string | any[] | Object | Buffer | Promise<any>): Promise<boolean> => this.logger._log("error", msg));
    }

    getCommand(cmd: string | string[]): {
        command: Command[];
        category: Category;
    } | null {
        if (!cmd) return null;
        if (!(cmd instanceof Array)) {
            cmd = [cmd];
        }

        let command: Command[] = [];

        const client = this;

        function walkCmd(c: string[], ct?: Command): any {
            let b: Command;
            const d = c[0];
            if (!ct) b = client.commands.find(cc => cc.triggers.includes(d));
            else if (ct && typeof ct.subCommands !== "undefined") b = ct.subCommands.find(cc => cc.triggers.includes(d));
            else b = null;
            if (!b) return null;
            c.shift();
            if (c.length > 0 && b.hasSubCommands) {
                command.push(b);
                return walkCmd(c, b);
            } else {
                command.push(b);
                return command;
            }
        }

        //console.log(cmd);
        walkCmd([...cmd]);
        //console.log(command);
        //if (!this.commandTriggers.includes(cmd)) return null;
        //let command = this.commands.find(c => c.triggers.includes(cmd));
        let category = this.getCategoryFromCommand(cmd[0]);
        return {
            command,
            category
        };
    }

    getCategory(cat: string): Category | null {
        cat = cat.toLowerCase();
        if (!this.categories.map(c => c.name.toLowerCase()).includes(cat)) return null;
        return this.categories.find(c => c.name.toLowerCase() === cat);
    }

    getCategoryFromCommand(cmd: string): Category | null {
        if (!cmd) return null;
        cmd = cmd.toLowerCase();
        if (!this.commandTriggers.includes(cmd)) return null;
        let command = this.commands.find(c => c.triggers.includes(cmd));
        return this.getCategory(command.category.name);
    }
}

export default FurryBot;