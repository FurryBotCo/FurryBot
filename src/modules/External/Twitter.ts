import LoginWithTwitter from "login-with-twitter";
import config from "../../config";

const Twitter = new LoginWithTwitter({
	consumerKey: config.apiKeys.twitter.consumerKey,
	consumerSecret: config.apiKeys.twitter.consumerSecret,
	callbackUrl: config.beta ? config.apiKeys.twitter.callbackUrlBeta : config.apiKeys.twitter.callbackUrl
});

export default Twitter;
