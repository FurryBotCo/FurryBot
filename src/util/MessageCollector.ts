import * as Eris from "eris";
import { BaseClient } from "clustersv2";
import ExtendedMessage from "@ExtendedMessage";
import FurryBot from "@FurryBot";

class MessageCollector {
	collectors: {
		[str: string]: {
			resolve: Function, // tslint:disable-line ban-types
			filter: Function // tslint:disable-line ban-types
		}
	};
	constructor(bot: FurryBot) {
		this.collectors = {};
		bot.on("messageCreate", this.verify.bind(this));
	}

	async verify(msg: ExtendedMessage) {
		const collector = this.collectors[`${msg.channel.id}-${msg.author.id}`];
		if (collector && collector.filter(msg)) {
			collector.resolve(msg);
		}
	}

	awaitMessage(channelId: string, userId: string, timeout: number, filter: (msg: ExtendedMessage) => void = (msg: ExtendedMessage) => true): Promise<ExtendedMessage> {
		return new Promise(resolve => {
			if (this.collectors[`${channelId}-${userId}`]) {
				delete this.collectors[`${channelId}-${userId}`];
			}

			this.collectors[`${channelId}-${userId}`] = { resolve, filter };

			setTimeout(resolve.bind(null, false), timeout);
		});
	}
}

export default MessageCollector;
