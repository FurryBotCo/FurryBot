module.exports=(async (self) => {

	var xhr = new self.XMLHttpRequest();
	xhr.open("GET","https://api.bunnies.io/v2/loop/random/?media=gif", false);
	
	xhr.send();
	
	var response = JSON.parse(xhr.responseText);
	
	var attachment = new self.MessageAttachment(response.media.gif,`${response.id}.gif`);
	return self.channel.send(attachment);
});