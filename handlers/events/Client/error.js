const {
	config,
	os,
	util,
	phin,
	performance,
	Database: {
		MongoClient,
		mongo,
		mdb
	},
	functions
} = require("../../../modules/CommandRequire");

module.exports = (async function (error) {
	let embed;
	const num = this.random(10, "1234567890"),
		code = `err.${config.beta ? "beta" : "stable"}.${num}`;
	if (this.logger !== undefined) this.logger.error(`[UnknownOrigin] e1: ${error.name}: ${error.message}\n${error.stack},\nError Code: ${code}`);
	else console.error(`[UnknownOrigin] e1: ${error.name}: ${error.message}\n${error.stack},\nError Code: ${code}`);

	await this.mdb.collection("errors").insertOne({
		id: code,
		num,
		error: {
			name: error.name,
			message: error.message,
			stack: error.stack
		},
		level: "e1",
		bot: {
			version: config.bot.version,
			beta: config.beta,
			alpha: config.alpha,
			server: os.hostname()
		}
	});
	this.trackEvent({
		group: "ERRORS",
		event: "client.errors",
		properties: {
			code,
			num,
			error: {
				name: error.name,
				message: error.message,
				stack: error.stack
			},
			level: "e1",
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: os.hostname()
			}
		}
	});

	embed = {
		title: "General Error",
		description: `Error Code: \`${code}\``,
		author: {
			name: "General Error",
			icon_url: "https://i.furry.bot/furry.png"
		},
		fields: [{
			name: "Error",
			value: `Name: ${error.name}\n\
				Stack: ${error.stack}\n\
				Message: ${error.message}`,
			inline: false
		}]
	};
	return this.bot.executeWebhook(config.webhooks.errors.id, config.webhooks.errors.token, {
		embeds: [embed],
		username: `Error Reporter${config.beta ? " - Beta" : ""}`
	});
});