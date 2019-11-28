import phin from "phin";
import * as os from "os";
import https from "https";
import * as fs from "fs-extra";

const agent = new https.Agent({
	rejectUnauthorized: false,
	ca: fs.readFileSync("/etc/ssl/local/X1/intermediate/CA-Chain.crt").toString(),
	cert: fs.readFileSync("/etc/ssl/local/X1/certs/localhost.crt").toString(),
	key: fs.readFileSync("/etc/ssl/local/X1/certs/localhost.key").toString()
});
interface AnalyticsResponse {
	id: string;
	type: string;
	group: string;
	internalId: string;
	uuid: string;
}

export default class Analytics {
	key: string;
	type: string;
	group: string;
	userAgent: string;
	constructor(key: string, type: string, group: string, userAgent: string) {
		this.key = key;
		this.type = type;
		this.group = group;
		this.userAgent = userAgent;
	}

	async track(event: string, extra: any): Promise<AnalyticsResponse> {
		return null;
		const r = await phin({
			method: "POST",
			url: `${os.hostname() === "main.extra-v4.furry.bot" ? "https://127.2.3.4" : "https://analytics.furry.bot"}/track/${this.type}/${this.group}`,
			headers: {
				"User-Agent": this.userAgent,
				"Authorization": this.key
			},
			data: {
				event,
				...extra
			},
			parse: "json",
			core: {
				agent
			}
		});

		if (r.statusCode !== 200 || !r.body.success) throw new Error(`${r.statusCode} ${r.statusMessage}: ${JSON.stringify(r.body)}`);

		return r.body;
	}
}
