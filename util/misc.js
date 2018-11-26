const config = require("../config.js");

module.exports = {
	errorMessages: async (e) => {
		
		var err = e.toString();
		// Voice
		if(err.includes("Disconnected")) {
			return `Discord messed up something. ${config.emojis.furweary}\n\nTry moving the server's voice region to fix this issue. If that doesn't fix it, join our support server <${config.discordSupportInvite}> make sure to tell the support you had error **VC1**`;
		}
		
		if(err.includes("Voice connection timeout")) {
			return `Discord messed up something. ${config.emojis.furweary}\n\nTo fix this, first try **${config.defaultPrefix}stop**. If that doesn't work, you have to remove me and add me again. I know, it's stupid ${config.emojis.fursalty}. If that still doesn't work, join our support server <${config.discordSupportInvite}> make sure to tell the support you had error **VC2**`;
		}
		
		if(err.includes("Already encoding")) {
			return `Discord messed up something. ${config.emojis.furweary}\n\nWe're pretty sure this is happening because you're spamming commands, so cool down. If this isn't the case, join our support server <${config.discordSupportInvite}>, make sure to tell the support you had error **VC3**.`;
		}
		
		// Discord
		if (err.includes('DiscordRESTError [50001]: Missing Access')) {
			return `Discord messed up something. ${config.emojis.furweary}\n\nWhatever you just tried, it didn't work. I don't have proper permissions. Make sure I have the correct permissions then try again. If this is still happening after you mess around with permissions, join our support server <${config.discordSupportInvite}>, make sure to tell the support you had error **PERMS1**`;
		}
		
		if (err.includes('Request timed out (>15000ms) on POST')) {
			return `Discord messed up something. ${config.emojis.furweary}\n\nDiscord is having connection issues ${config.emojis.furweary}. Try again later.`;
		}
		
		if(err.includes("DiscordRESTError [50013]: Missing Permissions")) {
			return `Discord messed up something. ${config.emojis.furweary}\n\nWhatever you just tried, it didn't work. I don't have proper permissions. Make sure I have the correct permissions then try again. If this is still happening after you mess around with permissions, join our support server <${config.discordSupportInvite}>, make sure to tell the support you had error **PERMS1**`;
		}
		
		if(err.includes('Must be 2000 or fewer in length')) {
			return `Discord messed up something. ${config.emojis.furweary}\n\nWhatever that was, it had too many characters.  Discord has a limit of 2,000 characters.`;
		}
		
		if (err.includes('DiscordHTTPError: 500 INTERNAL SERVER ERROR on POST')) {
			return `Discord messed up something. ${config.emojis.furweary}\n\nDiscord is having connection issues ${config.emojis.furweary}. Try again later.`;
		}
		
		if (err.includes('504 Gateway Timeout')) {
			return `Looks like the service for this command is down ${config.emojis.furweary}. All we can do is wait, sorry. ${config.emojis.furcry}`;
		}
		
		return false;
	},
 
	
	randomColor: () => {
		return Math.floor(Math.random() * 0xFFFFFF)
	  },

	randomInArray: (array) => {
		return array[Math.floor(Math.random() * array.length)]
	},

	removeDuplicates: (array) => {
		return Array.from(new Set(array).values())
	},

	codeBlock: (str, lang) => {
		return `${'```'}${lang || ''}\n${str}\n${'```'}`
	},

	parseTime: (time) => {
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
	},
	
	paginate: (text, limit = 2000) => {
		const lines = text.split('\n')
		const pages = []

		let chunk = ''

		for (const line of lines) {
		  if (chunk.length + line.length > limit && chunk.length > 0) {
			pages.push(chunk)
			chunk = ''
		  }

		  if (line.length > limit) {
			const lineChunks = line.length / limit

			for (let i = 0; i < lineChunks; i++) {
			  const start = i * limit
			  const end = start + limit
			  pages.push(line.slice(start, end))
			}
		  } else {
			chunk += `${line}\n`
		  }
		}

		if (chunk.length > 0) {
		  pages.push(chunk)
		}

		return pages
    }
}