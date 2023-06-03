import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, Events, GatewayIntentBits, Interaction } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

type Command = (interaction: Interaction) => Promise<void>
	

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, Command>;
    }
}

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath) as { execute: Command };
    client.commands.set(file.slice(0, -3), command.execute);
}


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
    
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		await command(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.TOKEN);
