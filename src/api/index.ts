import config from "../config";
import logger from "morgan";
import express from "express";
import * as fs from "fs-extra";
import session from "express-session";
import cookieParser from "cookie-parser";
import chalk from "chalk";
import bodyParser from "body-parser";
import http from "http";
import https from "https";
import FurryBot from "@FurryBot";

export default (async (client: FurryBot) => {
	const app: express.Application = express();

	app.use(session({
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

	await Promise.all(fs.readdirSync(`${__dirname}/routes`).filter(f => !fs.lstatSync(`${__dirname}/routes/${f}`).isDirectory()).map(async (f) => app.use(`/${f.split(".")[0]}`, await require(`${__dirname}/routes/${f}`).default(client))));

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

	return e;
});
