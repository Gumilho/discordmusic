import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { Player } from '../Player';

export async function execute(interaction: ChatInputCommandInteraction<CacheType>) {
	const player = Player.getInstance()
	player.next()
	await interaction.reply({ content: 'Musica parada' })
}