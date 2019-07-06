/* eslint-disable no-octal */
export default {
	constant: {
		/*
		CREATE_INSTANT_INVITE: 1 << 0x0, // 1
		KICK_MEMBERS:		  1 << 0x1, // 2
		BAN_MEMBERS:		   1 << 0x2, // 4
		ADMINISTRATOR:		 1 << 0x3, // 8
		MANAGE_CHANNELS:	   1 << 0x4, // 16
		MANAGE_GUILD:		  1 << 0x5, // 32
		ADD_REACTIONS:		 1 << 0x6, // 64
		VIEW_AUDIT_LOG:		1 << 0x7, // 128
		PRIORITY_SPEAKER:	  1 << 0x8, // 256
		READ_MESSAGES:		 1 << 10, // 1024
		SEND_MESSAGES:		 1 << 11, // 2048
		SEND_TTS_MESSAGES:	 1 << 12, // 4096
		MANAGE_MESSAGES:	   1 << 13, // 8192
		EMBED_LINKS:		   1 << 14, // 16384
		ATTACH_FILES:		  1 << 15, // 32768
		READ_MESSAGE_HISTORY:  1 << 16, // 65536
		MENTION_EVERYONE:	  1 << 17, // 131072
		USE_EXTERNAL_EMOJIS:   1 << 18, // 262144
		CONNECT:			   1 << 20, // 1048576
		SPEAK:				 1 << 21, // 2097152
		MUTE_MEMBERS:		  1 << 22, // 4194304
		DEAFEN_MEMBERS:		1 << 23, // 8388608
		MOVE_MEMBERS:		  1 << 24, // 16777216
		USE_VAD:			   1 << 25, // 33554432
		CHANGE_NICKNAME:	   1 << 26, // 67108864
		MANAGE_NICKNAMES:	  1 << 27,	// 134217728
		MANAGE_ROLES:		  1 << 28, // 268435456
		MANAGE_WEBHOOKS:	   1 << 29, // 536870912
		MANAGE_EMOJIS:		 1 << 30  // 1073741824
		*/
		createInstantInvite: 1 << 0x0, // 1
		kickMembers: 1 << 0x1, // 2
		banMembers: 1 << 0x2, // 4
		administrator: 1 << 0x3, // 8
		manageChannels: 1 << 0x4, // 16
		manageGuild: 1 << 0x5, // 32
		addReactions: 1 << 0x6, // 64
		viewAuditLogs: 1 << 0x7, // 128
		voicePrioritySpeaker: 1 << 0x8, // 256
		readMessages: 1 << 10, // 1024
		sendMessages: 1 << 11, // 2048
		sendTTSMessages: 1 << 12, // 4096
		manageMessages: 1 << 13, // 8192
		embedLinks: 1 << 14, // 16384
		attachFiles: 1 << 15, // 32768
		readMessageHistory: 1 << 16, // 65536
		mentionEveryone: 1 << 17, // 131072
		externalEmojis: 1 << 18, // 262144
		voiceConnect: 1 << 20, // 1048576
		voiceSpeak: 1 << 21, // 2097152
		voiceMuteMembers: 1 << 22, // 4194304
		voiceDeafenMembers: 1 << 23, // 8388608
		voiceMoveMembers: 1 << 24, // 16777216
		voiceUseVAD: 1 << 25, // 33554432
		changeNickname: 1 << 26, // 67108864
		manageNicknames: 1 << 27,	// 134217728
		manageRoles: 1 << 28, // 268435456
		manageWebhooks: 1 << 29, // 536870912
		manageEmojis: 1 << 30  // 1073741824
	},
	conversion: {
		CREATE_INSTANT_INVITE: "createInstantInvite",
		KICK_MEMBERS: "kickMembers",
		BAN_MEMBERS: "banMembers",
		ADMINISTRATOR: "administrator",
		MANAGE_CHANNELS: "manageChannels",
		MANAGE_GUILD: "manageGuild",
		ADD_REACTIONS: "addReactions",
		VIEW_AUDIT_LOG: "viewAuditLogs",
		PRIORITY_SPEAKER: "voicePrioritySpeaker",
		READ_MESSAGES: "readMessages",
		SEND_MESSAGES: "sendMessages",
		SEND_TTS_MESSAGES: "sendTTSMessages",
		MANAGE_MESSAGES: "manageMessages",
		EMBED_LINKS: "embedLinks",
		ATTACH_FILES: "attachFiles",
		READ_MESSAGE_HISTORY: "readMessageHistory",
		MENTION_EVERYONE: "mentionEveryone",
		USE_EXTERNAL_EMOJIS: "externalEmojis",
		CONNECT: "voiceConnect",
		SPEAK: "voiceSpeak",
		MUTE_MEMBERS: "voiceMuteMembers",
		DEAFEN_MEMBERS: "voiceDeafenMembers",
		MOVE_MEMBERS: "voiceMoveMembers",
		USE_VAD: "voiceUseVAD",
		CHANGE_NICKNAME: "changeNickname",
		MANAGE_NICKNAMES: "manageNicknames",
		MANAGE_ROLES: "manageRoles",
		MANAGE_WEBHOOKS: "manageWebhooks",
		MANAGE_EMOJIS: "manageEmojis"
	}
};