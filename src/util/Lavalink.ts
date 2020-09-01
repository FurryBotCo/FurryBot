import config from "../config";
import * as http from "http";
import * as https from "https";
import types from "./@types/lavalink";

export default class Lavalink {
	static SSL = false;
	static HOST = config.apis.lavalink.host;
	static PORT = config.apis.lavalink.port;
	static PASSWORD = config.apis.lavalink.password;
	private constructor() { }

	private static getType(type: types.ValidTypes) {
		switch (type) {
			case "youtube": return "ytsearch";
		}
	}

	static async search(type: types.ValidTypes, q: string) {
		return new Promise<types.SearchResult>((a, b) => {
			(this.SSL ? https : http)
				.request({
					method: "GET",
					port: this.PORT,
					protocol: `http${this.SSL ? "s" : ""}:`,
					hostname: this.HOST,
					path: `/loadtracks?identifier=${this.getType(type)}:${encodeURIComponent(q)}`,
					headers: {
						Authorization: config.apis.lavalink.password
					}
				}, (res) => {
					const data = [];

					res
						.on("data", (d) => data.push(d))
						.on("error", (err) => b(err))
						.on("end", () => {
							const d = JSON.parse(Buffer.concat(data).toString()) as types.AnyResult;
							switch (d.loadType) {
								case "LOAD_FAILED": return b(d);
								case "SEARCH_RESULT": return a(d);
							}
						});
				})
				.end();
		});
	}
}
