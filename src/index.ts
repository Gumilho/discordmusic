import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, Events, GatewayIntentBits, Interaction } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

type Command = (interaction: Interaction) => Promise<void>
type Button = (interaction: Interaction) => Promise<void>
	

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, Command>;
		buttons: Collection<string, Button>
    }
}

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js')).forEach(file => {
	const filePath = path.join(commandsPath, file);
	import(filePath).then((command: { execute: Command }) => {
		client.commands.set(file.slice(0, -3), command.execute);
	})
});

client.buttons = new Collection();

const buttonsPath = path.join(__dirname, 'buttons');
fs.readdirSync(buttonsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js')).forEach(file => {
	const filePath = path.join(buttonsPath, file);
	import(filePath).then((command: { execute: Button }) => {
		client.buttons.set(file.slice(0, -3), command.execute);
	})
});

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
    
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
	} else if (interaction.isButton()) {
		const button = interaction.client.buttons.get(interaction.customId);
		if (!button) {
			console.error(`No command matching ${interaction.customId} was found.`);
			return;
		}
		try {
			await button(interaction)
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	} else if (interaction.isStringSelectMenu()) {
		console.log('select')
	}
});

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.TOKEN);
