module.exports = {
	getTotalMemory: function () {
		var used = process.memoryUsage().heapTotal;
		return Math.round(used * 100) / 100;
	},
	getUsedMemory: function () {
		var used = process.memoryUsage().heapUsed;
		return Math.round(used * 100) / 100;
	},
	getTotalMemoryMB: function () {
		var used = process.memoryUsage().heapTotal / 1024 / 1024;
		return Math.round(used * 100) / 100;
	},
	getUsedMemoryMB: function () {
		var used = process.memoryUsage().heapUsed / 1024 / 1024;
		return Math.round(used * 100) / 100;
	},
	getRSS: function () {
		var used = process.memoryUsage().rss / 1024 / 1024;
		return `${Math.round(used * 100) / 100}MB`;
	},
	getExternal: function () {
		var used = process.memoryUsage().external / 1024 / 1024;
		return `${Math.round(used * 100) / 100}MB`;
	},
	getAll: function () {
		var used = process.memoryUsage();
		console.log("\n\nMemory Totals:\n");
		for (var key in used) {
		 console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100}MB`);
		}
	},
	getSYSTotal: function(measurement="b") {
		var os = require("os");
		switch(measurement.toLowerCase()) {
			case "b":
				return (Math.round((os.totalmem())*100) / 100);
			break;
			
			case "kb":
				return (Math.round((os.totalmem() / 1024)*10) / 100);
			break;
			
			case "mb":
				return (Math.round((os.totalmem() / 1024 / 1024)*100) / 100);
			break;
			
			case "gb":
				return (Math.round((os.totalmem() / 1024 / 1024 / 1024)*100) / 100);
			break;
			
			default:
				throw new Error("Invalid Measurement");
		}
	},
	getSYSFree: function(measurement="b") {
		var os = require("os")
		switch(measurement.toLowerCase()) {
			case "b":
				return (Math.round((os.freemem())*100) / 100);
			break;
			
			case "kb":
				return (Math.round((os.freemem() / 1024)*100) / 100);
			break;
			
			case "mb":
				return (Math.round((os.freemem() / 1024 / 1024)*100) / 100);
			break;
			
			case "gb":
				return (Math.round((os.freemem() / 1024 / 1024 / 1024)*100) / 100);
			break;
			
			default:
				throw new Error("Invalid Measurement");
		}
	},
	getSYSUsed: function(measurement="b") {
		var os = require("os")
		switch(measurement.toLowerCase()) {
			case "b":
				return (Math.round((+(Math.round((os.totalmem())*100) / 100)-Math.round((os.freemem())*100) / 100)* 100) / 100);
			break;
			
			case "kb":
				return (Math.round((+(Math.round((os.totalmem() / 1024)*100) / 100)-Math.round((os.freemem() / 1024)*100) / 100)* 100) / 100);
			break;
			
			case "mb":
				return (Math.round((+(Math.round((os.totalmem() / 1024 / 1024)*100) / 100)-Math.round((os.freemem() / 1024 / 1024)*100) / 100)* 100) / 100);
			break;
			
			case "gb":
				return (Math.round((+(Math.round((os.totalmem() / 1024 / 1024 / 1024)*100) / 100)-Math.round((os.freemem() / 1024 / 1024 / 1024)*100) / 100)* 100) / 100);
			break;
			
			default:
				throw new Error("Invalid Measurement");
		}
	},
	getSYSTotalB: function() {
		return this.getSYSTotal("B");
	},
	getSYSFreeB: function() {
		return this.getSYSFree("B");
	},
	getSYSUsedB: function() {
		return this.getSYSUsed("B");
	},
	getSYSTotalKB: function() {
		return this.getSYSTotal("KB");
	},
	getSYSFreeKB: function() {
		return this.getSYSFree("KB");
	},
	getSYSUsedKB: function() {
		return this.getSYSUsed("KB");
	},
	getSYSTotalMB: function() {
		return this.getSYSTotal("MB");
	},
	getSYSFreeMB: function() {
		return this.getSYSFree("MB");
	},
	getSYSUsedMB: function() {
		return this.getSYSUsed("MB");
	},
	getSYSTotalGB: function() {
		return this.getSYSTotal("GB");
	},
	getSYSFreeGB: function() {
		return this.getSYSFree("GB");
	},
	getSYSUsedGB: function() {
		return this.getSYSUsed("GB");
	},
	getSYSCPUCount: function() {
		var os = require("os");
		var cpu_count=0;
		for(i=0;i < os.cpus().length;i++) {
			cpu_count++;
		}
		return cpu_count;
	},
	getSYSType: function() {
		var os = require("os");
		return os.type();
	},
	getSYSName: function() {
		var os = require("os");
		return os.hostname();
	},
	getSYSArchitecture: function() {
		var os = require("os");
		return os.arch();
	},
	getSYSArch: function() {
		return this.getSYSArchitecture();
	},
	getSYSPlatform: function() {
		var os = require("os");
		return os.platform();
	},
	getSYSRelease: function() {
		var os = require("os");
		return os.release();
	},
	getSYSVersion: function() {
		return this.getSYSRelease();
	},
	checkSemVer: function(ver) {
		var semver = require("semver");
		var s=semver.valid(ver);
		if(s === ver) {
			return ver;
		} else {
			throw new Error("Invalid Version");
		}
	},
	getCurrentTimestamp: function() {
		var date=new Date();
		return date.toISOString();
	},
	secondsToHours: function(seconds) {
		var sec_num = parseInt(seconds, 10);
		var hours   = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours   < 10) {hours   = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}
		return hours+':'+minutes+':'+seconds;
	},
	ucwords: function(string) {
		if(typeof string !== "string") string=string.toString();
		var str = (string.toLowerCase() + '')
		.replace(/^(.)|\s+(.)/g, function ($1) {
		  return $1.toUpperCase()
		});
		return str;
	},
	toReadableDate: function(date) {
        var a=date.toString().replace("Z","").split("T");
        var b=a[0].split("-");
        var c=a[1].split(".")[0].split(":")
        var year=b[0];
        var month=b[1];
        var day=b[2];
        var hour=c[0];
        var minute=c[1];
        var second=c[2];
        var timezone="UTC";
        var time=`${year}/${month}/${day} ${hour}:${minute}:${second}`;
        return `${time.split("GM")[0]} UTC`;
	},
	toCST: function(timestamp) {
		console.log(timestamp);
		var a=timestamp.toString().split(" ");
		var b=a[1].split(":");
		var c=+b[0]+6;
		if(c>24) {
			var n=+c-24;
			var c=0+n;
			var c=`0${c}`;
		}
		var ts=`${a[0]} ${c}:${b[1]}:${b[2]} CST`;
		console.log(ts);
		return ts;
	},
	getMusic: async function(url, guild_id) {
		return new Promise(async function (resolve, reject) {
			var ytdl=require("ytdl-core");
			var fs = require("fs");
			var filename=`tmp-${guild_id}.mp3`;
			await ytdl(url).pipe(fs.createWriteStream(`music\\${filename}`));
			setTimeout(function(filename){
				resolve([{"filename":filename,"location":`music\\${filename}`}]);
			}, 2500, filename);
		});
	},
    memoryCheckup: function(time, message) {
        return setInterval(function() {
            console.log(`${message} Memory Checkup: ${this.getUsedMemory()}/${this.getTotalMemory()}`)
        }, (time * 1000));
    },
	makeSafe: function(message) {
		return message.replace(/\@everyone/,"@\u200beveryone").replace(/\@here/,"@\u200bhere");
	},
	ms: function(ms) {
		var cd=ms/1000;
		if(cd == 1) {
			var cooldown=`${cd} second`;
		} else if (cd == 0) {
			var cooldown=`none`;
		} else {
			if(cd >= 60) {
				var mm=cd/60;
				if(mm == 1) {
					var cooldown=`${mm} minute`;
				} else {
					if(mm >= 60) {
						var hh=mm/60;
						if(hh == 1) {
							var cooldown=`${hh} hour`;
						} else {
							if(hh >= 24) {
								var dd=hh/24;
								if(dd == 1) {
									var cooldown=`${dd} day`;
								} else {
									var cooldown=`${dd} days`;
								}
							} else {
								var cooldown=`${hh} hours`;
							}
						}
					} else {
						var cooldown=`${mm} minutes`;
					}
				}
			} else {
				var cooldown=`${cd} seconds`;
			}
		}
		return cooldown;
	},
	get time(){return this.ms;},
	validateurl: function(str) {
		return str.match(config.urlRegex)?this.length>0:false;
	},
	get validateUrl(){return this.validateurl;},
	get validateURL(){return this.validateurl;},
	mentionToId: function(m) {
		if(!config.mentionRegex.test(m)) throw new Error("Invalid mention");
		return m.replace("!","").replace("<@","").replace("<","");
	}
};
