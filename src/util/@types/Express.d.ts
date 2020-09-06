import "express";
import { SessionData as Data } from "../SessionStore";

declare global {
	namespace Express {
		interface SessionData {
		}

		interface Request<B = any> {
			body: B;
			data: Partial<Data>;
		}
	}
}
