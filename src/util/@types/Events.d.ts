import Eris from "eris";
interface Ready { (); }
interface Disconnect { (); }

interface CallCreate { (call: Eris.Call); }
interface CallRing { (call: Eris.Call); }
interface CallDelete { (call: Eris.Call); }

interface CallUpdate { (call: Eris.Call, oldCall: Eris.OldCall); }

interface ChannelCreate { (channel: Eris.AnyChannel); }
interface ChannelDelete { (channel: Eris.AnyChannel); }

interface ChannelPinUpdate { (channel: Eris.TextableChannel, timestamp: number, oldTimestamp: number); }

interface ChannelRecipientAdd { (channel: Eris.GroupChannel, user: Eris.User); }
interface ChannelRecipientRemove { (channel: Eris.GroupChannel, user: Eris.User); }

interface ChannelUpdate { (channel: Eris.AnyGuildChannel, oldChannel: Eris.OldGuildChannel); }

interface FriendSuggestionCreate { (user: Eris.User, reasons: Eris.FriendSuggestionReasons); }

interface FriendSuggestionDelete { (user: Eris.User); }

interface GuildAvailable { (guild: Eris.Guild, user: Eris.User); }
interface GuildBanAdd { (guild: Eris.Guild, user: Eris.User); }
interface GuildBanRemove { (guild: Eris.Guild, user: Eris.User); }

interface GuildDelete { (guild: Eris.Guild); }
interface GuildUnavailable { (guild: Eris.Guild); }
interface GuildCreate { (guild: Eris.Guild); }

interface GuildEmojisUpdate { (guild: Eris.Guild, emojis: Eris.Emoji[], oldEmojis: Eris.Emoji[]); }

interface GuildMemberAdd { (guild: Eris.Guild, member: Eris.Member); }

interface GuildMemberChunk { (guild: Eris.Guild, members: Eris.Member[]); }

interface GuildMemberRemove { (guild: Eris.Guild, member: Eris.Member | Eris.MemberPartial); }

interface GuildMemberUpdate { (guild: Eris.Guild, member: Eris.Member, oldMember: { roles: string[]; nick?: string; }); }

interface GuildRoleCreate { (guild: Eris.Guild, role: Eris.Role); }
interface GuildRoleDelete { (guild: Eris.Guild, role: Eris.Role); }

interface GuildRoleUpdate { (guild: Eris.Guild, role: Eris.Role, oldRole: Eris.OldRole); }

interface GuildUpdate { (guild: Eris.Guild, oldGuild: Eris.OldGuild); }

interface Hello { (trace: string[], id: number); }

interface InviteCreate { (guild: Eris.Guild, invite: Eris.GuildInvite); }
interface InviteDelete { (guild: Eris.Guild, invite: Eris.GuildInvite); }

interface MessageCreate { (message: Eris.Message); }

interface MessageDelete { (message: Eris.PossiblyUncachedMessage); }
interface MessageReactionRemoveAll { (message: Eris.PossiblyUncachedMessage); }

interface MessageReactionRemoveEmoji { (message: Eris.PossiblyUncachedMessage, emoji: Eris.PartialEmoji); }

interface MessageDeleteBulk { (messages: Eris.PossiblyUncachedMessage[]); }

interface MessageReactionAdd { (message: Eris.PossiblyUncachedMessage, emoji: Eris.Emoji, userID: string); }
interface MessageReactionRemove { (message: Eris.PossiblyUncachedMessage, emoji: Eris.Emoji, userID: string); }

interface MessageUpdate { (message: Eris.Message, oldMessage?: Eris.OldMessage); }

interface PresenceUpdate { (other: Eris.Member | Eris.Relationship, oldPresence?: Eris.Presence); }

interface RawREST { (request: Eris.RawRESTRequest); }

interface RawWS { (packet: Eris.RawPacket, id: number); }
interface Unknown { (packet: Eris.RawPacket, id: number); }

interface RelationshipAdd { (relationship: Eris.Relationship); }
interface RelationshipRemove { (relationship: Eris.Relationship); }

interface RelationshipUpdate { (relationship: Eris.Relationship, oldRelationship: { type: number; }); }

interface TypingStart { (channel: Eris.TextableChannel, user: Eris.User); }

interface UnavailableGuildCreate { (guild: Eris.UnavailableGuild); }

interface UserUpdate { (user: Eris.User, oldUser: { username: string; discriminator: string; avatar?: string; }); }

interface VoiceChannelJoin { (member: Eris.Member, newChannel: Eris.VoiceChannel); }

interface VoiceChannelLeave { (member: Eris.Member, oldChannel: Eris.VoiceChannel); }

interface VoiceChannelSwitch { (member: Eris.Member, newChannel: Eris.VoiceChannel, oldChannel: Eris.VoiceChannel); }

interface VoiceStateUpdate { (member: Eris.Member, oldState: Eris.OldVoiceState); }

interface Warn { (message: string, id: number); }
interface Debug { (message: string, id: number); }

interface ShardDisconnect { (err: Error, id: number); }
interface Error { (err: Error, id: number); }
interface ShardPreReady { (err: Error, id: number); }
interface Connect { (err: Error, id: number); }

interface ShardReady { (id: number); }
interface ShardResume { (id: number); }


type WrapThis<F extends (...args: any[]) => any, C extends Eris.Client = Eris.Client> = (this: C, ...args: Parameters<F>) => ReturnType<F>;

declare global {

	interface ErisEventMap<C extends Eris.Client = Eris.Client> {
		ready: WrapThis<Ready, C>;
		disconnect: WrapThis<Disconnect, C>;
		callCreate: WrapThis<CallCreate, C>;
		callRing: WrapThis<CallRing, C>;
		callDelete: WrapThis<CallDelete, C>;
		callUpdate: WrapThis<CallUpdate, C>;
		channelCreate: WrapThis<ChannelCreate, C>;
		channelDelete: WrapThis<ChannelDelete, C>;
		channelPinUpdate: WrapThis<ChannelPinUpdate, C>;
		channelRecipientAdd: WrapThis<ChannelRecipientAdd, C>;
		channelRecipientRemove: WrapThis<ChannelRecipientRemove, C>;
		friendSuggestionCreate: WrapThis<FriendSuggestionCreate, C>;
		friendSuggestionDelete: WrapThis<FriendSuggestionDelete, C>;
		guildAvailable: WrapThis<GuildAvailable, C>;
		guildBanAdd: WrapThis<GuildBanAdd, C>;
		guildBanRemove: WrapThis<GuildBanRemove, C>;
		guildDelete: WrapThis<GuildDelete, C>;
		guildUnavailable: WrapThis<GuildUnavailable, C>;
		guildCreate: WrapThis<GuildCreate, C>;
		guildEmojisUpdate: WrapThis<GuildEmojisUpdate, C>;
		guildMemberAdd: WrapThis<GuildMemberAdd, C>;
		guildMemberChunk: WrapThis<GuildMemberChunk, C>;
		guildMemberRemove: WrapThis<GuildMemberRemove, C>;
		guildMemberUpdate: WrapThis<GuildMemberUpdate, C>;
		guildRoleCreate: WrapThis<GuildRoleCreate, C>;
		guildRoleDelete: WrapThis<GuildRoleDelete, C>;
		guildUpdate: WrapThis<GuildUpdate, C>;
		hello: WrapThis<Hello, C>;
		inviteCreate: WrapThis<InviteCreate, C>;
		inviteDelete: WrapThis<InviteDelete, C>;
		messageCreate: WrapThis<MessageCreate, C>;
		messageDelete: WrapThis<MessageDelete, C>;
		messageReactionRemoveAll: WrapThis<MessageReactionRemoveAll, C>;
		messageReactionRemoveEmoji: WrapThis<MessageReactionRemoveEmoji, C>;
		messageDeleteBulk: WrapThis<MessageDeleteBulk, C>;
		messageReactionAdd: WrapThis<MessageReactionAdd, C>;
		messageReactionRemove: WrapThis<MessageReactionRemove, C>;
		messageUpdate: WrapThis<MessageUpdate, C>;
		presenceUpdate: WrapThis<PresenceUpdate, C>;
		rawREST: WrapThis<RawREST, C>;
		rawWS: WrapThis<RawWS, C>;
		unknown: WrapThis<Unknown, C>;
		relationshipAdd: WrapThis<RelationshipAdd, C>;
		relationshipRemove: WrapThis<RelationshipRemove, C>;
		relatioshipUpdate: WrapThis<RelationshipUpdate, C>;
		typingStart: WrapThis<TypingStart, C>;
		unavailableGuildCreate: WrapThis<UnavailableGuildCreate, C>;
		userUpdate: WrapThis<UserUpdate, C>;
		voiceChannelJoin: WrapThis<VoiceChannelJoin, C>;
		voiceChannelLeave: WrapThis<VoiceChannelLeave, C>;
		voiceChannelSwitch: WrapThis<VoiceChannelSwitch, C>;
		voiceStateUpdate: WrapThis<VoiceStateUpdate, C>;
		warn: WrapThis<Warn, C>;
		debug: WrapThis<Debug, C>;
		shardDisconnect: WrapThis<ShardDisconnect, C>;
		error: WrapThis<Error, C>;
		shardPreReady: WrapThis<ShardPreReady, C>;
		connect: WrapThis<Connect, C>;
		shardReady: WrapThis<ShardReady, C>;
		shardResume: WrapThis<ShardResume, C>;
	}
}
