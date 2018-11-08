module.exports = (async (self) => {
	return self.message.reply("Command temporarily disabled.");
	/*var xhr = new self.XMLHttpRequest();
	xhr.open("GET", "https://api.furrybot.me/antijokes/", false);

	await xhr.send();
	var j = JSON.parse(xhr.responseText);
	var data = {
	 "title": "Here's an anti-joke for you",
		"description": `Posted by ${j.poster}`,
		"fields": [
		  {
			"name": "Joke",
			"value": j.joke
		  }
		]
	  };
	Object.assign(data, embed_defaults);
	var embed = new self.MessageEmbed(data);
	var m = await self.channel.send(embed);
	var data2={
	 "title": "Here's an anti-joke for you",
		"description": `Posted by ${j.poster}`,
		"fields": [
		  {
			"name": "Joke",
			"value": j.joke
		  },
		  {
			"name": "Punchline",
			"value": j.punchline
		  }
		]
	  };
	Object.assign(data2, self.embed_defaults);
	var embed2 = new self.MessageEmbed(data2);
	setTimeout((msg,e2)=>{msg.edit(e2);}, 7000,m,embed2);*/
});