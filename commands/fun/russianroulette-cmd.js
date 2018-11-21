module.exports = (async (self,local) => {
	
	var val = Math.floor(Math.random()*6);
	var bullets = typeof local.args[0] !== "undefined" ? parseInt(local.args[0]) : 3;
	
	if(val<=bullets-1) {
		return local.message.reply("You died!");
	} else {
		return local.message.reply("You lived!");
	}
});