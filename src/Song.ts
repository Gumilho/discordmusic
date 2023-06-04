import { createAudioResource } from "@discordjs/voice"
import { EmbedBuilder } from "discord.js"
import ytdl from "ytdl-core"

export class Song {
    static PFP_ICON = 'https://cdn.discordapp.com/avatars/236471638697181184/1891c37356862fb8540a6863459a2b4d.png?size=4096'

    constructor(
        private url: string,
        public title: string,
        private thumbnailUrl: string,
        private authorIconUrl = Song.PFP_ICON,
    ) {}

    public makeEmbed() {
        return new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(this.title)
            .setImage(this.thumbnailUrl)
            .setAuthor({ iconURL: this.authorIconUrl, name: 'youtube' })
            .setURL(this.url)
    }

    public createResource() {
        const stream = ytdl(this.url, { filter: 'audioonly' })
        return createAudioResource(stream)
    }

}