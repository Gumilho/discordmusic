import { ButtonInteraction, CacheType } from "discord.js";
import { Player } from '../Player';

export async function execute(interaction: ButtonInteraction<CacheType>) {
	const player = Player.getInstance()
	player.repeat()
	await interaction.update(player.makeMessage())
}