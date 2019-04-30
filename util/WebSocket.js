const WebSocket = require("ws"),
	https = require("https"),
	fs = require("fs"),
	{ db, websocket: { heartbeat_interval, codes }, rootDir, universalKey } = require("../config"),
	deasync = require("deasync"),
	{ MongoClient } = require("mongodb"),
	mongo = deasync(MongoClient.connect)("mongodb://furry.bot:27017/analytics",{
		auth: {
			user: "web",
			password: universalKey
		},
		ssl: true,
		sslCert: fs.readFileSync(`${rootDir}/ssl/ssl.crt`),
		sslKey: fs.readFileSync(`${rootDir}/ssl/ssl.key`),
		sslCA: fs.readFileSync(`${rootDir}/ssl/ca.crt`),
		appname: "Web",
		useNewUrlParser: true,
		authSource: "admin"
	}),
	mdb = mongo.db("analytics"),
	uuid = require("uuid/v4"),
	server = https.createServer({
		ca: fs.readFileSync(`${rootDir}/ssl/ca.crt`),
		key: fs.readFileSync(`${rootDir}/ssl/ssl.key`),
		cert: fs.readFileSync(`${rootDir}/ssl/ssl.crt`),
	}),
	wss = new WebSocket.Server({ server });

/*
OP Codes
0: Heartbeat
1: Hello,
2: identify
3: data
4: analytics
5: resume
10: info
11: echo
*/
wss.broadcast = ((data,name = null) => {
	try {
		if(typeof data === "string") data = JSON.parse(data);
	} catch(e) {
		throw new Error("Websocket data must be JSON");
	}
	wss.clients.forEach((client) => {
		if(client.readyState === WebSocket.OPEN && client.authed && client.type === "recieve") {
			if(name !== null) {
				if(client.name === name) {
					client.send(JSON.stringify(Object.assign(data,{ s: client.s, name })));
					client.s++;
				}
			} else {
				client.send(JSON.stringify(Object.assign(data,{ s: client.s, name })));
				client.s++;
			}
		}
	});

});
wss.on("connection",async(socket,request) => {
	const host = request.headers.host.split(":")[0],
		port = parseInt(request.headers.host.split(":")[1],10);
	console.log(`Connection made from origin ${request.headers.origin} to host ${host} on port ${port}`);
	socket.s = 0;
	socket.sendJSON = (async(data) => {
		try {
			if(typeof data === "string") data = JSON.parse(data);
		} catch(e) {
			throw new Error("Websocket data must be JSON");
		}
		return new Promise((resolve,reject) => {
			if(socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify(Object.assign(data,{s: socket.s})),resolve);
				socket.s++;
			} else {
				resolve(false);
			}
		});
	});

	socket.authed = false;
	socket.sendJSON({
		op: 1,
		d: {
			heartbeat_interval,
			event: "HELLO",
			message: "Please authenticate"
		}
	});
	const authTimeout = setTimeout(async() => {
		await socket.sendJSON({
			op: 3,
			d: {
				success: false,
				event: "CLOSE",
				message: "Closing due to no valid authentication provided."
			}
		});
		socket.close(codes.NO_AUTH);
	},30e3);
	socket.on("message",async(data) => {
		try {
			data = JSON.parse(data);
		} catch(e) {
			return socket.sendJSON({
				op: 3,
				d: {
					success: false,
					event: "INVALID_DATA",
					message: "Invalid data sent, expected JSON."
				}
			});
		}
		
		if(!socket.authed) {
			if(data.op === 2) {
				if(typeof data.token !== "undefined" && data.token === universalKey) {
					socket.authed = true;
					socket.type = data.type || "recieve";
					socket.name = data.name || "test";
					clearTimeout(authTimeout);
					socket.heartbeat = setInterval(async() => {
						await socket.sendJSON({
							op: 3,
							d: {
								success: false,
								event: "CLOSE",
								message: "Closing due to a missed heartbeat."
							}
						});
						socket.close(codes.MISSED_PING);
					},( heartbeat_interval + 1e4));
					return socket.sendJSON({
						op: 3,
						d: {
							success: true,
							event: "AUTHENTICATED",
							message: "Authenticated. Please start sending heartbeats."
						}
					});
				} else {
					return socket.sendJSON({
						op: 3,
						d: {
							success: false,
							event: "INVALID_AUTHENTICATION",
							message: "invalid authentication"
						}
					});
				}
			} else return socket.sendJSON({
				op: 3,
				d: {
					success: false,
					event: "INVALID_AUTHENTICATION",
					message: "Please authenticate before sending any data"
				}
			});
		}

		let groups, properties, rs;
		switch(data.op) {
		case 0:
			clearInterval(socket.heartbeat);
			socket.heartbeat = setInterval(async() => {
				await socket.sendJSON({
					op: 3,
					d: {
						success: false,
						event: "CLOSE",
						message: "Closing due to a missed heartbeat."
					}
				});
				socket.close(codes.MISSED_PING);
			},( heartbeat_interval + 1e4));
			return socket.sendJSON({
				op: 0,
				d: {
					success: true,
					event: "HEARTBEAT",
					message: "heartbeat acknowledged."
				}
			});
			break; // eslint-disable-line no-unreachable

		case 4:
			if(socket.type === "recieve") return socket.sendJSON({
				op: 3,
				d: {
					success: false,
					event: "INVALID_USAGE",
					message: "This connection was not designated as a SEND connection"
				}
			});
			groups = await mdb.listCollections().toArray().then(res => res.map(c => c.name));
			properties = data.d.properties ? data.d.properties : {};
			if(!groups.includes(socket.name)) return socket.sendJSON({
				op: 3,
				d: {
					success: false,
					event: "INVALID_GROUP",
					message: "socket group (name) is invalid"
				}
			});
			rs = await mdb.collection(socket.name).insertOne({
				id: uuid(),
				userId: data.d.userId,
				event: data.d.userId,
				timestamp: data.d.timestamp || new Date().toISOString(),
				properties
			});
			if(rs.result.ok) {
				await socket.sendJSON({
					op: 3,
					d: {
						success: true,
						event: "TRACK",
						group: socket.name,
						res: rs.ops
					}
				});
				return wss.broadcast({
					op: 4,
					d: data.d
				},socket.name);
			} else {
				console.error(rs);
				return socket.sendJSON({
					op: 3,
					d: {
						success: false,
						event: "UNKNOWN_ERROR",
						message: "Unknown internal server error, check console"
					}
				});
			}
			break; // eslint-disable-line no-unreachable

		case 5:
			if(data.d.s < socket.s) return socket.sendJSON({
				op: 3,
				d: {
					success: false,
					event: "INVALID_SEQUENCE",
					message: "the provided sequence to resume was lower than the current sequence."
				}
			});
			socket.s = data.d.s;
			return socket.sendJSON({
				op: 3,
				d: {
					s: data.d.s,
					event: "SET_SEQUENCE"
				}
			});
			break; // eslint-disable-line no-unreachable

		case 10:
			return socket.sendJSON({
				op: 10,
				d: {
					name: socket.name,
					type: socket.type,
					host,
					port,
					authenticated: socket.authed,
					heartbeat_interval,
					sequence: socket.s,
					origin: request.headers.origin
				}
			});
			break; // eslint-disable-line no-unreachable

		case 11:
			return socket.sendJSON(data);
			break; // eslint-disable-line no-unreachable

		default:
			return socket.sendJSON({
				op: 3,
				d: {
					success: false,
					event: "INVALID_MESSAGE",
					message: "invalid message"
				}
			});
		}
	});
});
/*setInterval((type = null) => {
	wss.broadcast({
		op: 4,
		d: {
			data: "test"
		}
	}, type);
},1e3,"test");*/
server.listen(3002);