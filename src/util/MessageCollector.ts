import FurryBot from "../main";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import { Message } from "eris";

class MessageCollector {
	collectors: {
		[str: string]: {
			resolve: Function, // tslint:disable-line ban-types
			filter: Function // tslint:disable-line ban-types
		}
	};
	constructor(bot: FurryBot) {
		this.collectors = {};

		bot.bot.on("messageCreate", this.verify.bind(this));
	}

	async verify(msg: ExtendedMessage | Message) {
		const collector = this.collectors[`${msg.channel.id}-${msg.author.id}`];
		if (collector && collector.filter(msg)) {
			collector.resolve(msg);
		}
	}

	awaitMessage(channelId: string, userId: string, timeout: number, filter: Function = (msg: Message) => true): Promise<Message> { // tslint:disable-line ban-types
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
