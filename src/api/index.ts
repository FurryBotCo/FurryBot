/// <reference path="../util/@types/Express.d.ts" />
import express from "express";
import morgan from "morgan";
import session from "express-session";
import FurryBot from "../main";
import config from "../config";
import http from "http";
import https from "https";
import * as fs from "fs-extra";
import Logger from "../util/Logger";
import onFinished from "on-finished";
import SessionStore from "../util/SessionStore";

export class Route {
	client: FurryBot;
	app: express.Router;
	path: string;
	setupRan: boolean;
	constructor(path: string, client?: FurryBot) {
		this.path = path;
		this.client = client || null;
		this.app = express.Router();
		this.setupRan = false;
	}

	// override
	setup() {
		this.setupRan = true;
	}

	setClient(client: FurryBot) {
		this.client = client;
		return this;
	}
}

export default class API {
	client: FurryBot;
	app: express.Application;
	setupRan: boolean;
	srv: http.Server | https.Server;
	launchAttempts: number;
	maxAttempts: number;
	timeBetweenAttempts: number;
	constructor(client: FurryBot) {
		this.client = client;
		this.app = express();
		this.setupRan = false;
		this.launchAttempts = 0;
		this.maxAttempts = 8;
		this.timeBetweenAttempts = 1.5e4;
	}

	addRoute<R extends Route = any>(route: R) {
		if (!route.client) route.setClient(this.client);
		route.setup();
		this.app.use(route.path, route.app);
		return this;
	}

	setup() {
		this.setupRan = true;
		const app = this.app;

		app
			.use(session({
				name: "fbapi",
				secret: config.web.api.cookieSecret,
				cookie: {
					maxAge: 8.64e7,
					secure: true
				},
				resave: false,
				saveUninitialized: true
			}))
			.set("view engine", "ejs")
			.set("views", `${config.dir.base}/src/api/views/templates`)
			.use(morgan("dev"))
			.use(express.json())
			.use(express.urlencoded({
				extended: true
			}))
			.use(async (req, res, next) => {
				if (req.session.id) {
					req.data = SessionStore.get(req.session.id);
					onFinished(res, () => {
						SessionStore.set(req.sessionID, req.data);
					});
				}

				return next();
			})
			.use("/assets/items", express.static(`${config.dir.base}/src/assets/items`));

		fs
			.readdirSync(`${__dirname}/routes`)
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			.map(r => new (require(`${__dirname}/routes/${r}`).default)() as Route)
			.map(r => this.addRoute(r));
	}

	launch() {
		this.launchAttempts++;
		if (!this.setupRan) this.setup();
		const client = this.client;
		let srv: http.Server | https.Server;
		if (config.web.api.security.ssl) srv = https.createServer({
			ca: config.web.api.security.ca,
			cert: config.web.api.security.cert,
			key: config.web.api.security.key
		}, this.app);
		else srv = http.createServer(this.app);

		const svr = http.createServer(express())
			.on("error", () => {
				Logger.warn([`Cluster #${this.client.cluster.id}`, "API Server"], `[${this.launchAttempts}/${this.maxAttempts}]: Attempted to start api server, but it was not able to bind. Is the port in use? ${this.launchAttempts >= this.maxAttempts ? "Max start attempts reached, not attempting to start anymore." : `Attempting to start again in ${this.timeBetweenAttempts / 1000} seconds.`}`);
				if (this.launchAttempts >= this.maxAttempts) return;
				// this seems to throw an internal error
				setTimeout(this.launch.bind(this), this.timeBetweenAttempts);
			})
			.on("listening", () => (svr.close(), this.srv = srv.listen(config.web.api.port, config.web.api.ip, () => Logger.debug([`Cluster #${this.client.cluster.id}`, "API Server"], `Listening on ${config.web.api.host}:${config.web.api.port}`))))
			.on("close", () => Logger.debug([`Cluster #${this.client.cluster.id}`, "API Server", "Port Test"], "Port test server closed, starting bot api server."))
			.listen(config.web.api.port, config.web.api.ip);
	}
}
