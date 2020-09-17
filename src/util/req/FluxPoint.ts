import * as https from "https";
import config from "../../config";
import { WelcomeFormat, AnyImageFormat, TextFormat } from "../@types/FluxPoint";

export default class FluxPoint {
	private constructor() { }

	static async welcome(data: WelcomeFormat) {
		return new Promise<Buffer>((a, b) => {
			const req = https.request({
				method: "POST",
				protocol: "https:",
				port: 443,
				hostname: "api.fluxpoint.dev",
				path: "/gen/welcome",
				headers: {
					"Authorization": config.apis.fluxpoint,
					"Content-Type": "application/json"
				}
			}, (res) => {
				const data = [];

				res
					.on("data", (d) =>
						data.push(d)
					)
					.on("error", (err) =>
						b(err)
					)
					.on("end", () =>
						a(Buffer.concat(data))
					);
			});

			req.write(JSON.stringify(data));

			req.end();
		});
	}

	static async custom(data: {
		base: AnyImageFormat;
		images: AnyImageFormat[];
		texts: TextFormat[];
		output: "png" | "jpg" | "webp";
	}) {
		return new Promise<Buffer>((a, b) => {
			const req = https.request({
				method: "POST",
				protocol: "https:",
				port: 443,
				hostname: "api.fluxpoint.dev",
				path: "/gen/custom",
				headers: {
					"Authorization": config.apis.fluxpoint,
					"Content-Type": "application/json"
				}
			}, (res) => {
				const data = [];

				res
					.on("data", (d) =>
						data.push(d)
					)
					.on("error", (err) =>
						b(err)
					)
					.on("end", () =>
						a(Buffer.concat(data))
					);
			});

			req.write(JSON.stringify(data));

			req.end();
		});
	}
}
