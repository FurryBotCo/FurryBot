module.exports = (async (self,local) => {
	Object.assign(self,local);
	var xhr = new self.XMLHttpRequest();
	
	xhr.open("GET","https://dog.ceo/api/breeds/image/random",false);
	
	xhr.send();
	
	var parts = JSON.parse(xhr.responseText).message.replace("https://","").split("/");
	
	var attachment = new self.MessageAttachment(JSON.parse(xhr.responseText).message,`${parts[2]}_${parts[3]}.png`);
	
	return self.channel.send(`Breed: ${parts[2]}`,attachment);
});