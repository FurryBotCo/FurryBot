import config from "../config";
import logger from "morgan";
import express from "express";
import * as fs from "fs-extra";
import session from "express-session";
import cookieParser from "cookie-parser";
import chalk from "chalk";
import client from "../../";
import bodyParser from "body-parser";
import http from "http";
import https from "https";
const app: express.Application = express();

app/*.use(async (req, res, next) => {
	const s = process.hrtime();
	res.on("finish", () => {
		const t = process.hrtime(s);
		const m = t[0] * 1000 + t[1] / 1e6;
		//client.logger.debug(`Webserver: ${chalk.red(req.method.toUpperCase())} ${chalk.green(req.originalUrl)} ${chalk.yellow(res.statusCode)} ${chalk.blue(`${m}ms`)}`);
	});
	return next();
})*/.use(session({
	name: "fb-sess.id",
	secret: config.web.cookieSecret,
	cookie: {
		maxAge: 8.64e7,
		secure: false // since the api server is ran as http, we have to save it as non-secure (it will be secured through the proxy when properly accesed)
	},
	resave: false,
	saveUninitialized: true
}))
	.use(cookieParser(config.web.cookieSecret))
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

let e;

if (config.web.security.useHttps) e = https.createServer({
	ca: config.web.security.ca,
	cert: config.web.security.cert,
	key: config.web.security.key
}, app);
else e = http.createServer(app);

export default e;