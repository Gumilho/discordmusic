import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { joinVoiceChannel } from '@discordjs/voice';
import { Player } from '../Player';

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	if (!interaction.inCachedGuild()) return
	const voiceChannel = interaction.member.voice.channel;
	if (!voiceChannel) {
		await interaction.reply('Você precisa estar num canal de voz para isso');
		return;
	}
	await interaction.deferReply({ ephemeral: true })
	try {
		const player = Player.getInstance()
		const query = interaction.options.getString('query')
		if (!query) return
		const connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guildId,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		})
		await interaction.editReply({ content: 'Procurando por ' + query })
		const url = await player.search(query)
		player.subscribe(connection)
		player.add(url)
		player.play()
		await interaction.editReply({ content: 'Adicionado!' })
	} catch (error) {
		console.error(error);
		await interaction.editReply({ content: 'Ocorreu um erro' });
	}
}