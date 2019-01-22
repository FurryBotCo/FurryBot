const os = require("os");
module.exports = {
	memory: {
		process: {
			getTotal: (()=>process.memoryUsage().heapTotal),
			getUsed: (()=>process.memoryUsage().heapUsed),
			getRSS: (()=>process.memoryUsage().rss),
			getExternal: (()=>process.memoryUsage().external),
			getAll: (()=>({
					total: process.memoryUsage().heapTotal,
					used: process.memoryUsage().heapUsed,
					rss: process.memoryUsage().rss,
					external: process.memoryUsage().external
			}))
		},
		system: {
			getTotal: (()=>os.totalmem()),
			getUsed: (()=>os.totalmem() - os.freemem()),
			getFree: (()=>os.freemem()),
			getAll: (()=>({
				total: os.totalmem(),
				used: os.totalmem() - os.freemem(),
				free: os.freemem()
			}))
		}
	},
	checkSemVer: ((ver)=>require("semver").valid(ver) === ver),
	getCurrentTimestamp: (()=>new Date().toISOString()),
	secondsToHours: ((seconds)=>{
		var sec_num = parseInt(seconds, 10);
		var hours   = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours   < 10) hours   = "0"+hours;
		if (minutes < 10) minutes = "0"+minutes;
		if (seconds < 10) seconds = "0"+seconds;
		return `${hours}:${minutes}:${seconds}`;
	}),
	ucwords: ((str)=> str.toString().toLowerCase().replace(/^(.)|\s+(.)/g,(r)=>r.toUpperCase())),
	toReadableDate: ((date)=>{
		if(!(date instanceof Date)) throw new Error("must provide javascript Date object.");
		var a = date.toISOString().replace("Z","").split("T");
        return `${a[0]} ${a[1].split(".")[0]} UTC`;
	}),
	makeSafe: ((msg)=>msg.replace(/\@everyone/,"@\u200beveryone").replace(/\@here/,"@\u200bhere")),
	ms: ((ms)=>{
		var cd = ms/1000;
		if(cd === 1) {
			var cooldown = `${cd} second`;
		} else if (cd === 0) {
			var cooldown = `none`;
		} else {
			if(cd >= 60) {
				var mm=cd/60;
				if(mm === 1) {
					var cooldown = `${mm} minute`;
				} else {
					if(mm >= 60) {
						var hh = mm/60;
						if(hh === 1) {
							var cooldown = `${hh} hour`;
						} else {
							if(hh >= 24) {
								var dd = hh/24;
								if(dd === 1) {
									var cooldown = `${dd} day`;
								} else {
									var cooldown = `${dd} days`;
								}
							} else {
								var cooldown = `${hh} hours`;
							}
						}
					} else {
						var cooldown = `${mm} minutes`;
					}
				}
			} else {
				var cooldown = `${cd} seconds`;
			}
		}
		return cooldown;
	}),
	parseTime: ((time) => {
        const methods = [
          { name: 'd', count: 86400 },
          { name: 'h', count: 3600 },
          { name: 'm', count: 60 },
          { name: 's', count: 1 }
        ]

        const timeStr = [ Math.floor(time / methods[0].count).toString() + methods[0].name ]
        for (let i = 0; i < 3; i++) {
          timeStr.push(Math.floor(time % methods[i].count / methods[i + 1].count).toString() + methods[i + 1].name)
        }

        return timeStr.filter(g => !g.startsWith('0')).join(', ')
    })
}