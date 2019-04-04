/* eslint-disable no-octal */
module.exports = {
	constant: {
		CREATE_INSTANT_INVITE: 1 << 00, // 1
		KICK_MEMBERS:          1 << 01, // 2
		BAN_MEMBERS:           1 << 02, // 4
		ADMINISTRATOR:         1 << 03, // 8
		MANAGE_CHANNELS:       1 << 04, // 16
		MANAGE_GUILD:          1 << 05, // 32
		ADD_REACTIONS:         1 << 06, // 64
		VIEW_AUDIT_LOG:        1 << 07, // 128
		PRIORITY_SPEAKER:      1 << 08, // 256
		READ_MESSAGES:         1 << 10, // 1024
		SEND_MESSAGES:         1 << 11, // 2048
		SEND_TTS_MESSAGES:     1 << 12, // 4096
		MANAGE_MESSAGES:       1 << 13, // 8192
		EMBED_LINKS:           1 << 14, // 16384
		ATTACH_FILES:          1 << 15, // 32768
		READ_MESSAGE_HISTORY:  1 << 16, // 65536
		MENTION_EVERYONE:      1 << 17, // 131072
		USE_EXTERNAL_EMOJIS:   1 << 18, // 262144
		CONNECT:               1 << 20, // 1048576
		SPEAK:                 1 << 21, // 2097152
		MUTE_MEMBERS:          1 << 22, // 4194304
		DEAFEN_MEMBERS:        1 << 23, // 8388608
		MOVE_MEMBERS:          1 << 24, // 16777216
		USE_VAD:               1 << 25, // 33554432
		CHANGE_NICKNAME:       1 << 26, // 67108864
		MANAGE_NICKNAMES:      1 << 27,	// 134217728
		MANAGE_ROLES:          1 << 28, // 268435456
		MANAGE_WEBHOOKS:       1 << 29, // 536870912
		MANAGE_EMOJIS:         1 << 30  // 1073741824
	},
	conversion: {
		CREATE_INSTANT_INVITE: "createInstantInvite",
		KICK_MEMBERS:          "kickMembers",
		BAN_MEMBERS:           "banMembers",
		ADMINISTRATOR:         "administrator",
		MANAGE_CHANNELS:       "manageChannels",
		MANAGE_GUILD:          "manageGuild",
		ADD_REACTIONS:         "addRections",
		VIEW_AUDIT_LOG:        "viewAuditLogs",
		PRIORITY_SPEAKER:      "voicePrioritySpeaker",
		READ_MESSAGES:         "readMessages",
		SEND_MESSAGES:         "sendMessages",
		SEND_TTS_MESSAGES:     "sendTTSMessages",
		MANAGE_MESSAGES:       "manageMessages",
		EMBED_LINKS:           "embedLinks",
		ATTACH_FILES:          "attachFiles",
		READ_MESSAGE_HISTORY:  "readMessageHistory",
		MENTION_EVERYONE:      "mentionEveryone",
		USE_EXTERNAL_EMOJIS:   "externalEmojis",
		CONNECT:               "voiceConnect",
		SPEAK:                 "voiceSpeak",
		MUTE_MEMBERS:          "voiceMuteMembers",
		DEAFEN_MEMBERS:        "voiceDeafenMembers",
		MOVE_MEMBERS:          "voiceMoveMembers",
		USE_VAD:               "voiceUseVAD",
		CHANGE_NICKNAME:       "changeNickname",
		MANAGE_NICKNAMES:      "manageNicknames",
		MANAGE_ROLES:          "manageRoles",
		MANAGE_WEBHOOKS:       "manageWebhooks",
		MANAGE_EMOJIS:         "manageEmojis"
	}
};