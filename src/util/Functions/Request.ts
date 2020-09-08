import * as http from "http";
import * as https from "https";
import qs from "querystring";
import config from "../../config";
import Logger from "../Logger";
import URL from "url";
import phin from "phin";

export default class Request {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}

	static async createPaste(content: string, name: string, expire?: string, privacy?: 0 | 1 | 2) {
		return new Promise<string>((a, b) => {
			const d = qs.stringify({
				api_option: "paste",
				api_dev_key: config.keys.pastebin.devKey,
				api_user_key: config.keys.pastebin.userKey,
				api_paste_code: content,
				api_paste_private: privacy ?? 2,
				api_paste_name: name,
				api_paste_expire_date: expire || "1D"
			});

			const req = https.request({
				hostname: "pastebin.com",
				port: 443,
				path: "/api/api_post.php",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				}
			}, (res) => {
				const data = [];
				res
					.on("data", (d) => data.push(d))
					.on("error", (err) => b(err))
					.on("end", () => a(Buffer.concat(data).toString()));
			});
			req.write(d);
			req.end();
		});
	}

	/**
	 * get the image at a url as a buffer
	 * @static
	 * @param {string} url
	 * @returns {Promise<Buffer>}
	 * @memberof Request
	 */
	static async fetchURL(url: string, withHeaders: true): Promise<{
		headers: http.IncomingHttpHeaders;
		body: Buffer;
		statusCode: number;
		statusMessage: string;
	}>;
	static async fetchURL(url: string, withHeaders?: false): Promise<Buffer>;
	static async fetchURL(url: string, withHeaders?: boolean): Promise<Buffer | {
		headers: http.IncomingHttpHeaders;
		body: Buffer;
		statusCode: number;
		statusMessage: string;
	}> {
		withHeaders = !!withHeaders;
		return new Promise((a, b) => {
			const uri = URL.parse(url);
			(uri.protocol === "https:" ? https : http).request({
				method: "GET",
				host: uri.host,
				path: uri.path,
				protocol: uri.protocol,
				port: uri.port || uri.protocol === "https:" ? 443 : 80,
				timeout: 3e4,
				headers: {
					"User-Agent": config.web.userAgent
				},
				rejectUnauthorized: false
			}, (res) => {
				const data = [];
				res
					.on("data", (d) => data.push(d))
					.on("error", (err) => b(err))
					.on("end", () => a(withHeaders === true ? ({
						headers: res.headers,
						body: Buffer.concat(data),
						statusCode: res.statusCode,
						statusMessage: res.statusMessage
					}) : Buffer.concat(data))
					);
			}).end();
		});
	}

	static get getImageFromURL() { return this.fetchURL; }

	/**
	 * Download an image to a directory
	 * @static
	 * @param {string} url
	 * @param {string} filename
	 * @returns {Promise<void>}
	 * @memberof Request
	 */
	static async downloadImage(url: string, filename: string): Promise<void> {
		return this.fetchURL(url, false).then(img => fs.writeFileSync(filename, img));
	}


	static async chewyBotAPIRequest(cat: string): Promise<string> {
		let r: phin.IResponse;
		try {
			r = await phin({
				method: "GET",
				url: `https://api.chewey-bot.top/${cat}`,
				headers: {
					"User-Agent": config.web.userAgent,
					"Authorization": config.apiKeys.chewyBot.key
				},
				timeout: 5e3
			});
			const b = JSON.parse(r.body.toString());
			return b.data;
		} catch (e) { // cannot annotate try-catch clauses
			const err = e as Error;
			Logger.error("Request", `${r.statusCode} ${r.statusMessage}`);
			Logger.error("Request", err);
			Logger.error("Request", r.body.toString());
			if (err.message.indexOf("JSON") !== -1 && err.stack.indexOf("JSON.parse") !== -1) return null;
			throw err;
		}
	}
}
