import { AudioPlayer, AudioPlayerStatus, VoiceConnection, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputApplicationCommandData, ChatInputCommandInteraction, Embed, EmbedBuilder, Interaction, InteractionEditReplyOptions, Message, MessagePayload } from "discord.js";
import ytdl from "ytdl-core";
import ytsr from "ytsr";
import { Song } from "./Song";

export class Player {
    private songs: Song[] = []
    private loopMode: boolean = false
    private shuffleMode: boolean = false
    private player: AudioPlayer;
    private currentSong?: Song;
    private message?: Message

    private static instance: Player;
    private constructor() { 
        this.player = createAudioPlayer()
        this.player.on('error', error => console.error('Error:', error.message));
    }
    public static getInstance(): Player {
        if (!Player.instance) Player.instance = new Player();
        return Player.instance;
    }

    // Slash commands
    private async preCommand(interaction: ChatInputCommandInteraction) {

        if (!this.message) await interaction.deferReply()
        else await interaction.deferReply({ ephemeral: true })
        
        const query = interaction.options.getString('query', true)
        return await this.search(query)
    }

    private async postCommand(interaction: ChatInputCommandInteraction) {

        if (!this.message) {
            this.player.addListener(AudioPlayerStatus.Idle, () => this.next())
            this.message = await interaction.editReply(this.makeMessage())
        } else {
            await interaction.editReply({ content: 'Concluído!' })
            await this.message.edit(this.makeMessage())
        }
    }
    
    public async addToQueue(interaction: ChatInputCommandInteraction) {
        const song = await this.preCommand(interaction)

        this.songs.push(song)
        this.currentSong ||= song

        this.postCommand(interaction)
    }

    public async playNext(interaction: ChatInputCommandInteraction) {
        const song = await this.preCommand(interaction)

        this.currentSong ||= (this.songs.push(song), song);
        const index = this.songs.indexOf(this.currentSong)
        if (index == -1) throw new Error('Something occured')
        this.songs.splice(index + 1, 0, song)

        this.postCommand(interaction)

    }

    public async playSong(interaction: ChatInputCommandInteraction) {
        const song = await this.preCommand(interaction)

        this.songs = [song]
        this.currentSong = song
        this.play()

        this.postCommand(interaction)
    }

    public stop() { 
        this.songs = []
        this.loopMode = false
        this.shuffleMode = false
        this.currentSong = undefined
        this.message?.delete()
        this.message = undefined
        this.player.removeListener(AudioPlayerStatus.Idle, () => this.next())
        this.player.stop()
    }

    // END Slash commands


    // Button commands
    public previous() {
        if (!this.currentSong) return 
        const index = this.songs.indexOf(this.currentSong)
        if (index == -1) throw new Error('Something occured')
        if (index <= 0) {
            if (!this.loopMode) return
            this.currentSong = this.songs[this.songs.length - 1]
        } else {
            this.currentSong = this.songs[index - 1]
        }
        this.play()
        this.message?.edit(this.makeMessage())
    }


    public next() {
        if (!this.currentSong) return
        const index = this.songs.indexOf(this.currentSong)
        if (index == -1) throw new Error('Something occured')
        if (index == this.songs.length - 1) {
            if (!this.loopMode) return
            this.currentSong = this.songs[0]
        } else {
            this.currentSong = this.songs[index + 1]
        }
        this.play()
        this.message?.edit(this.makeMessage())
    }

    public playPause() {
        if (!this.currentSong) return
        if (this.player.state.status === AudioPlayerStatus.Playing) this.player.pause()
        else if (!this.player.unpause()) this.play()
    }

    public repeat() {
        this.loopMode = !this.loopMode
    }

    public shuffle() {
        this.shuffleMode = !this.shuffleMode
    }

    // END Buttons


    public subscribe(connection: VoiceConnection) {
        connection.subscribe(this.player)
    }
    
    private play() {
        if (!this.currentSong) return
        this.player.play(this.currentSong.createResource())
    }

    public async search(query: string) {
        let result = query
		if (!ytdl.validateURL(query)) {
			const filters = await ytsr.getFilters(query)
			const filter = filters.get('Type')?.get('Video')
            const url = filter?.url
			const searchResults = await ytsr(url!);
            const item = searchResults.items[0] as { url: string }
			result = item.url
		}
        
        const metadata = await ytdl.getBasicInfo(result)
        
        return new Song(
            metadata.videoDetails.video_url,
            metadata.videoDetails.title,
            metadata.videoDetails.thumbnails.find(thumbnail => thumbnail.width === 1920)?.url!,
        )
    }

    public makeMessage(): string | MessagePayload | InteractionEditReplyOptions  {
        if (!this.currentSong) throw new Error('No Song')

        const embed = this.currentSong?.makeEmbed()
		
        const shuffle = new ButtonBuilder()
            .setCustomId('shuffle')
            .setLabel('🔀')
            .setStyle(ButtonStyle.Secondary)
        const previous = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('⏮️')
            .setStyle(ButtonStyle.Primary)
        const playpause = new ButtonBuilder()
            .setCustomId('playpause')
            .setLabel('▶️')
            .setStyle(ButtonStyle.Primary)
        const next = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('⏭️')
            .setStyle(ButtonStyle.Primary)
        const repeat = new ButtonBuilder()
            .setCustomId('repeat')
            .setLabel('🔁')
            .setStyle(ButtonStyle.Secondary)
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(shuffle, previous, playpause, next, repeat)

        return {
            content: this.songs.map(song => song.title).join(' | '),
            embeds: [embed],
            components: [row],
        }
    }
    public getLoop() {
        return "Loop " + this.loopMode ? "on" : "off"
    }
}
