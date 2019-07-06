import config from "@config";
import logger from "morgan";
import express from "express";
import * as fs from "fs";
import chalk from "chalk";
import client from "@root/index";
import bodyParser from "body-parser";

const app: express.Application = express();

app/*.use(async (req, res, next) => {
	const s = process.hrtime();
	res.on("finish", () => {
		const t = process.hrtime(s);
		const m = t[0] * 1000 + t[1] / 1e6;
		//client.logger.debug(`Webserver: ${chalk.red(req.method.toUpperCase())} ${chalk.green(req.originalUrl)} ${chalk.yellow(res.statusCode)} ${chalk.blue(`${m}ms`)}`);
	});
	return next();
})*/
	.use(logger("dev"))
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({
		extended: true
	}));

fs.readdirSync(`${__dirname}/routes`).filter(f => !fs.lstatSync(`${__dirname}/routes/${f}`).isDirectory()).map(f => app.use(`/${f.split(".")[0]}`, require(`${__dirname}/routes/${f}`).default));

app.use(async (req, res) => res.status(404).json({
	success: false,
	error: "page not found"
}));

export default app;