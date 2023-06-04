import { CacheType, StringSelectMenuInteraction } from "discord.js";
import { Player } from "./Player";

export async function stringSelect(interaction: StringSelectMenuInteraction<CacheType>) {
	const player = Player.getInstance()
	player.select(interaction.values[0])
	await interaction.update(player.makeMessage())
}