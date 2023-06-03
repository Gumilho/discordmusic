import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { Player } from '../Player';

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	await interaction.deferReply({ ephemeral: true })
    const player = Player.getInstance()
    const query = interaction.options.getString('query')
    if (!query) return
    await interaction.editReply({ content: 'Procurando por ' + query })
    const url = await player.search(query)
    player.addToQueue(url)
    await interaction.editReply({ content: 'Adicionado!' })
}