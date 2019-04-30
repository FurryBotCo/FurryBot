const WebSocket = require("ws"),
	{ universalKey, beta } = require("../config");

module.exports = class AnalyticsWebSocket {
	constructor(name = "test", type = "recieve") {
		this.name = name;
		this.type = type;
		this.sequence = null;
		this.heartbeat = null;
		this.heartbeat_interval = null;
		this.reconnect_count = 0;
		this.resume = null;
		this.connect.call(this);
	}

	async connect() {
		if(typeof this.ws !== "undefined" && this.ws.readyState === WebSocket.OPEN) this.ws.close();
		this.ws = null;
		const ws = new WebSocket("wss://furry.bot:3002");
		ws.parent = this;
		ws.onerror = this.onerror;
		ws.onopen = this.onopen;
		ws.onclose = this.onclose;
		ws.onmessage = this.onmessage;
		return this.ws = ws;
	}

	async reconnect() {
		this.reconnect_count++;
		return this.connect();
	}

	async sendJSON(data) {
		try {
			if(typeof data === "string") data = JSON.parse(data);
		} catch(e) {
			throw new Error("Websocket data must be JSON");
		}
		return new Promise((resolve,reject) => {
			if([undefined,null,""].includes(this.sequence)) this.sequence = 0;
			if(this.ws.readyState === WebSocket.OPEN) {
				this.ws.send(JSON.stringify(Object.assign(data,{s: this.sequence})),resolve);
				this.sequence++;
				return resolve(true);
			} else {
				return resolve(false);
			}
		});
	}

	async onerror(e) {
		console.error("Analytics WebSocket Error");
		console.error(e);
	}

	async onopen() {
		console.debug("Analytics WebSocket Opened");
	}

	async onclose(e) {
		console.error("Analytics WebSocket Closed");
		console.error(e);
		this.parent.resume = this.parent.sequence;
		return this.parent.reconnect();
	}

	async onmessage(data) {
		try {
			data = JSON.parse(data.data);
		} catch(e) {
			return;
		}
		if(beta) console.debug(`WebSocket message, ${JSON.stringify(data)}`);
		if(typeof data.s !== "undefined") this.parent.sequence = data.s;
		switch(data.op) {
		case 0:
			if(!data.d.success) throw new Error(data);
			if(data.d.event === "HEARTBEAT") console.debug(`Analytics WebSocket Heartbeat, s: ${this.parent.sequence}`);
			break;
			
		case 1:
			this.parent.heartbeat_interval = data.d.heartbeat_interval;
			return this.parent.sendJSON({
				op: 2,
				token: universalKey,
				type: this.parent.type,
				name: this.parent.name
			});

		case 3:
			switch(data.d.event.toUpperCase()) {
			case "AUTHENTICATED":
				this.parent.heartbeat = setInterval(() => {
					this.parent.sendJSON({
						op: 0
					});
				},this.parent.heartbeat_interval);
				if(![undefined,null,""].includes(this.parent.resume)) this.parent.sendJSON({
					op: 5,
					d: {
						s: this.parent.resume
					}
				});
				this.parent.resume = null;
				break;
			}
		}
	}
};