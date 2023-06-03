import { AudioPlayer, AudioPlayerStatus, VoiceConnection, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import ytdl from "ytdl-core";
import ytsr from "ytsr";

export class Player {
    private songs: string[] = []
    private loopMode: boolean = true
    private index: number = 0
    private player: AudioPlayer;

    private static instance: Player;
    private constructor() { 
        this.player = createAudioPlayer()
        this.player.on('error', error => console.error('Error:', error.message));
        this.player.on(AudioPlayerStatus.Idle, () => {
            this.playNext()
        })
    }
    public static getInstance(): Player {
        if (!Player.instance) {
            Player.instance = new Player();
        }

        return Player.instance;
    }

    public toggle() {
        this.loopMode = !this.loopMode
    }

    public add(url: string) {
		this.songs.push(url)
    }
    public play() {
		if (this.player.state.status === AudioPlayerStatus.Idle) {
			const stream = ytdl(this.songs[0], { filter: 'audioonly' })
			const resource = createAudioResource(stream)
			this.player.play(resource)
		}
    }
    public playNext() {
        if (this.songs.length > 0) {
            const currentTrack = this.songs.shift()
            if (this.loopMode) this.songs.push(currentTrack!)
            if (this.songs.length > 0) this.play()
        }
    }

    public subscribe(connection: VoiceConnection) {
        connection.subscribe(this.player)
    }

    public async search(query: string) {

		if (!ytdl.validateURL(query)) {
			const filters = await ytsr.getFilters(query)
			const filter = filters.get('Type')?.get('Video')
            const url = filter?.url
			const searchResults = await ytsr(url!);
            const item = searchResults.items[0] as { url: string }
			return item.url
		}
        return query
    }
    public getLoop() {
        return "Loop " + this.loopMode ? "on" : "off"
    }
}
