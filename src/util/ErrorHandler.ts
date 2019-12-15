import Eris from "eris";
import { BaseClient } from "clustersv2";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";

const errors = {
	400: "We had an internal error when fetching something that this needed.",
	401: "We had an internal authentication error when fetching something that this needed.",
	403: "We had an internal forbidden error when fetching something that this needed.",
	404: "Whatever we were trying to get for this wasn't found.",
	410: "Whatever we were trying to get for this is gone.",
	413: "Whatever we tried to upload was too large. This is a Discord error, there is almost nothing we can do about this! Please try again.",
	429: "We were ratelimited while running this, try again later.",
	500: "Some server we were trying to contact returned an internal server error.",
	502: "Some server we were trying to contact returned a bad gateway error.",
	504: "Some server we were trying to contact returned a gateway timeout error.",
	40005: "Whatever we tried to upload was too large. This is a Discord error, there is almost nothing we can do about this! Please try again.",
	50013: "I cannot send messages to that channel."
};

const errorText = {
	400: "bad request",
	401: "unauthorized",
	403: "forbidden",
	404: "not found",
	410: "gone",
	413: "request entity too large", // officially, payload too large
	429: "too many requests",
	500: "internal server error",
	502: "bad gateway",
	504: "gateway timeout",
	40005: "request entity too large",
	50013: "missing permissions"
};

export default class ErrorHandler {
	client: FurryBot;
	constructor(client: FurryBot) {
		this.client = client;
	}

	handleInline<E extends Error>(e: number | string): string;
	handleInline<E extends Error>(e: E): string | E;
	handleInline<E extends Error>(e: number | E | string): string | E {
		if (typeof e === "number") {
			if (Object.keys(errors).indexOf(e.toString()) !== -1) return errors[e];
			else throw e;
		} else if (e instanceof Error) {
			if (Object.keys(errorText).some(t => e.message.toLowerCase().indexOf(t.toLowerCase()) !== -1)) {
				for (const k in errorText) {
					if (e.message.toLowerCase().indexOf(errorText[k].toLowerCase()) !== -1) return `${errors[k]}\nCode: \`${k}\``;
				}
			} else if (Object.keys(errorText).some(t => e.name.indexOf(t) !== -1)) {
				for (const k in errorText) {
					if (e.name.toLowerCase().indexOf(errorText[k].toLowerCase()) !== -1) return `${errors[k]}\nCode: \`${k}\``;
				}
			} else throw e;
		} else {
			if (Object.keys(errorText).some(t => e.toLowerCase().indexOf(t.toLowerCase()) !== -1)) {
				for (const k in errorText) {
					if (e.toLowerCase().indexOf(errorText[k].toLowerCase()) !== -1) return `${errors[k]}\nCode: \`${k}\``;
				}
			}
		}

		throw e;
	}

	globalHandler(type: "uncaughtException", data: { error: Error; }, msg?: ExtendedMessage);
	globalHandler(type: "unhandledRejection", data: { reason: string; promise: Promise<any>; }, msg?: ExtendedMessage);
	globalHandler(type: "SIGINT" | "SIGTERM", data: { signal: number; }, msg?: ExtendedMessage);
	globalHandler(type: "exit" | "beforeExit", data: { code: number; }, msg?: ExtendedMessage);
	globalHandler(type: "uncaughtException" | "unhandledRejection" | "SIGINT" | "SIGTERM" | "SIGKILL" | "exit" | "beforeExit", data, msg?: ExtendedMessage) {
		return this.client.emit("error", { type, data, msg: msg || null });
	}
}
