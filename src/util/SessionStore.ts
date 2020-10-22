/// <reference path="./@types/Discord.d.ts" />

import Eris from "eris";

interface SessionData {
	state: string;
	return: string;
	tokenSecret: string;
	discord: {
		accessToken: string;
		expiresIn: number;
		refreshToken: string;
		tokenType: string;
		time: number;
	};
	user: Eris.User;
}

class Store {
	entries: Map<string, Partial<SessionData>>;
	constructor() {
		this.entries = new Map();
	}

	get(id: string) {
		return this.entries.get(id) || {};
	}
	set(id: string, d: Partial<SessionData>) {
		return this.entries.set(id, d);
	}
	delete(id: string) {
		return this.entries.delete(id);
	}
}

const SessionStore = new Store();

export { SessionData, Store };
export default SessionStore;
