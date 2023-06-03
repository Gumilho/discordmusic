const { SlashCommandBuilder } = require('discord.js');

module.exports = new SlashCommandBuilder()
    .setName('toggle')
    .setDescription('Ativa/desativa o loop')