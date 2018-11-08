module.exports=(async (self) => {

	xhr = new self.XMLHttpRequest();

	xhr.open("GET","https://aws.random.cat/meow", false);
	
	xhr.send();
	
	try {
		var json=JSON.parse(xhr.responseText);
		var attachment = new self.MessageAttachment(json.file);
	}catch(e){
		console.log(e);
		var attachment = new self.MessageAttachment("https://i.imgur.com/p4zFqH3.png");
	}
	return self.channel.send(attachment);
		
});