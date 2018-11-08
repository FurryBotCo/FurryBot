module.exports=(async (self) => {
	if(self.fs.existsSync(`${process.cwd()}/ib.txt`)) {
    	var sid = self.fs.readFile(`${process.cwd()}/ib.txt`,"UTF8",(err,sid)=>{
    	   var ib = sid; 
    	});
	
    	checksid = new XMLHttpRequest();
    	
    	checksid.open("GET",`https://inkbunny.net/api_userrating.php?sid=${ib}`,false);
    	
    	checksid.send();
    	
    	var j=JSON.parse(checksid.responseText);
    	
    	if(j.error_code && j.error_code === 2) {
    	    getsid = new self.XMLHttpRequest();
    	
    	    getsid.open("GET",`https://inkbunny.net/api_login.php?${config.furryArtAPIs.inkbunny.urlCredentials}`,false);
    	
    	    getsid.send();
    	    
    	    var ib=JSON.parse(getsid.responseText).sid;
    	    self.fs.writeFileSync(`${process.cwd()}/ib.txt`,ib);
    	}
	} else {
	    getsid = new self.XMLHttpRequest();
    	
	    getsid.open("GET",`https://inkbunny.net/api_login.php?${config.furryArtAPIs.inkbunny.urlCredentials}`,false);
	
	    getsid.send();
	    
	    var ib = JSON.parse(getsid.responseText).sid;
	    self.fs.writeFileSync(`${process.cwd()}/ib.txt`,ib);
	}
	xhr = new self.XMLHttpRequest();

	xhr.open("GET",`https://inkbunny.net/api_search.php?sid=${ib}&orderby=views&type=1,3,5,8,9&count_limit=50000&submissions_per_page=100&text=-cub%20-diaper%20-ass%20-upskirt%20-pantsu%20-incest%20-age_difference%20-boobhat&random=yes&get_rid=yes`, false);
	
	xhr.send();
	
	try {
		var jsn = JSON.parse(xhr.responseText);
		var rr = Math.floor(Math.random()*jsn.submissions.length);
		var submission = jsn.submissions[rr];
		if(typeof submission.rating_id === "undefined") throw new Error("secondary");
		if(submission.rating_id !== "0") return self.message.reply("Image API returned a non-safe image! Please try again later.");
		var attachment = new self.MessageAttachment(submission.file_url_full)
		return self.channel.send(`${submission.title} (type ${submission.type_name}) by ${submission.username}\n<https://inkbunny.net/s/${submission.submission_id}>\nRID: ${jsn.rid}`,attachment)
	}catch(e){
		console.error(e);
		var attachment = new self.MessageAttachment("https://i.imgur.com/p4zFqH3.png");
		return self.channel.send(attachment);
	}
		
});