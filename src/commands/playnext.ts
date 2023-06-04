import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { joinVoiceChannel } from '@discordjs/voice';
import { Player } from '../Player';

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	if (!interaction.inCachedGuild()) return
	const voiceChannel = interaction.member.voice.channel;
	if (!voiceChannel) {
		await interaction.reply({ content: 'Você precisa estar num canal de voz para isso', ephemeral: true });
		return;
	}
	const connection = joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: voiceChannel.guildId,
		adapterCreator: voiceChannel.guild.voiceAdapterCreator,
	})
	const player = Player.getInstance()
	player.subscribe(connection)
	
	await player.playNext(interaction)
}