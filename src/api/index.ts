import express from "express";
import morgan from "morgan";
import session from "express-session";
import FurryBot from "../main";
import config from "../config";
import http from "http";
import https from "https";
import * as fs from "fs-extra";

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
	constructor(client: FurryBot) {
		this.client = client;
		this.app = express();
		this.setupRan = false;
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
				secret: config.web.cookieSecret,
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
			}));

		fs
			.readdirSync(`${__dirname}/routes`)
			.map(r => new (require(`${__dirname}/routes/${r}`).default)() as Route)
			.map(r => this.addRoute(r));
	}

	launch() {
		if (!this.setupRan) this.setup();
		const client = this.client;
		let srv: http.Server | https.Server;
		if (config.web.security.useHttps) srv = https.createServer({
			ca: config.web.security.ca,
			cert: config.web.security.cert,
			key: config.web.security.key
		}, this.app);
		else srv = http.createServer(this.app);

		const svr = http.createServer(express())
			.on("error", () => client.log("warn", "Attempted to start api server, but the port is in use.", "APIServer"))
			.on("listening", () => (svr.close(), this.srv = srv.listen(config.web.api.port, config.web.api.ip, () => client.log("debug", `Listening on ${config.web.api.ip}:${config.web.api.port}`, "APIServer"))))
			.on("close", () => client.log("debug", "Port test server closed, starting bot api server.", "APIServer"))
			.listen(config.web.api.port, config.web.api.ip);
	}
}
