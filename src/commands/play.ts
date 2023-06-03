import { CacheType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { joinVoiceChannel } from '@discordjs/voice';
import { Player } from '../Player';

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	if (!interaction.inCachedGuild()) return
	const voiceChannel = interaction.member.voice.channel;
	if (!voiceChannel) {
		await interaction.reply('Você precisa estar num canal de voz para isso');
		return;
	}
	const connection = joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: voiceChannel.guildId,
		adapterCreator: voiceChannel.guild.voiceAdapterCreator,
	})
	await interaction.deferReply()
	const player = Player.getInstance()
	const query = interaction.options.getString('query')
	if (!query) return
	
		
	await interaction.editReply({ content: 'Procurando por ' + query })
	player.subscribe(connection)
	player.playSong(query)
	await interaction.editReply({ content: 'Adicionado!' })
}