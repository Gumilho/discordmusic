const { SlashCommandBuilder } = require('discord.js');

module.exports = new SlashCommandBuilder()
   .setName('play')
   .setDescription('Toca a musica')
   .addStringOption(option => option.setName('query')
       .setRequired(true)
       .setDescription('Nome da musica ou link do youtube')
   )