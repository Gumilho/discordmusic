import { ChatInputCommandInteraction } from 'discord.js';
import { Player } from '../Player';

export async function execute(interaction: ChatInputCommandInteraction) {
	const player = Player.getInstance()
	player.toggle()
	await interaction.reply({ content: player.getLoop(), ephemeral: true });
}
