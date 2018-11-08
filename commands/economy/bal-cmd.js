module.exports=(async (message,gConfig,uConfig) => {
	if(!message) return new Error ("missing message parameter");
	if(!gConfig) return new Error ("missing gConfig parameter");
	if(!uConfig) return new Error ("missing uConfig parameter");
    await require(handlers.baseCommand)(message,gConfig,uConfig);
	
	return message.reply(`Your ballance is ${uConfig.bal}.`);
});