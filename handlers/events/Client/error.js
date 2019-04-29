module.exports = (async function(error) {
	let embed;
	const num = this.random(10,"1234567890"),
		code = `err.${this.config.beta ? "beta" : "stable"}.${num}`;
	if(this.logger !== undefined) this.logger.error(`[UnknownOrigin] e1: ${error.name}: ${error.message}\n${error.stack},\nError Code: ${code}`);
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
			version: this.config.bot.version,
			beta: this.config.beta,
			alpha: this.config.alpha,
			server: require("os").hostname()
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
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: require("os").hostname()
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
		fields: [
			{
				name: "Error",
				value: `Name: ${error.name}\n\
				Stack: ${error.stack}\n\
				Message: ${error.message}`,
				inline: false
			}
		]
	};
	return this.bot.executeWebhook(this.config.webhooks.errors.id,this.config.webhooks.errors.token,{ embeds: [ embed ], username: `Error Reporter${this.config.beta ? " - Beta" : ""}` });
});