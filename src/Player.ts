import { AudioPlayer, AudioPlayerStatus, VoiceConnection, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import ytdl from "ytdl-core";
import ytsr from "ytsr";

export class Player {
    private songs: string[] = []
    private loopMode: boolean = true
    private index: number = 0
    private player: AudioPlayer;
    private currentSong?: string;

    private static instance: Player;
    private constructor() { 
        this.player = createAudioPlayer()
        this.player.on('error', error => console.error('Error:', error.message));
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

    public async addToQueue(query: string) {
		const url = await this.search(query)
        this.songs.push(url)
        if (!this.currentSong) {
            this.currentSong = url
        }
    }

    public async playNext(query: string) {
		const url = await this.search(query)
        if (!this.currentSong) {
            this.songs.push(url)
            this.currentSong = url
        }
        const index = this.songs.indexOf(this.currentSong)
        if (index == -1) throw new Error('Something occured')
        this.songs.splice(index + 1, 0, url)
    }

    public async playSong(query: string) {
		const url = await this.search(query)
        this.songs = [url]
        this.currentSong = url
        this.play()
    }

    private play() {
        if (!this.currentSong) return
        const stream = ytdl(this.currentSong, { filter: 'audioonly' })
        const resource = createAudioResource(stream)
        this.player.play(resource)
    }

    public previous() {
        if (!this.currentSong) return
        if (this.player.state.status === AudioPlayerStatus.Buffering) return
        if (this.player.state.status === AudioPlayerStatus.Idle) {
            
            const index = this.songs.indexOf(this.currentSong)
            if (index == -1) throw new Error('Something occured')
            if (index > 0) {
                this.currentSong = this.songs[index - 1]
                this.play()
            }
        } else {
            const isPlaying = this.player.state.status === AudioPlayerStatus.Playing
            if (this.player.state.playbackDuration / 1000 > 5)
            this.player.removeListener(AudioPlayerStatus.Idle, this.playNext)
            this.player.stop()
            if (isPlaying) this.play()
            this.player.addListener(AudioPlayerStatus.Idle, this.playNext)
        }
    }

    public next() {
        if (!this.currentSong) return
        const index = this.songs.indexOf(this.currentSong)
        if (index == -1) throw new Error('Something occured')
        if (index == this.songs.length - 1) return
        this.player.stop()
    }

    public playPause() {
        if (!this.currentSong) return
        if (this.player.state.status === AudioPlayerStatus.Playing) this.player.pause()
        else this.player.unpause()
    }

    public stop() {
        if (!this.currentSong) return
        this.songs = [this.currentSong]
        this.player.removeListener(AudioPlayerStatus.Idle, this.playNext)
        this.player.stop()
        this.player.addListener(AudioPlayerStatus.Idle, this.playNext)
    }

    // public add(url: string) {
	// 	this.songs.push(url)
    // }
    // public play() {
    //     if (this.songs.length === 0) {
    //         this.player.on(AudioPlayerStatus.Idle, this.playNext)
    //     }
	// 	if (this.player.state.status === AudioPlayerStatus.Idle) {
	// 		const stream = ytdl(this.songs[0], { filter: 'audioonly' })
	// 		const resource = createAudioResource(stream)
	// 		this.player.play(resource)
	// 	}
    // }
    // public playNext() {
    //     if (this.songs.length > 0) {
    //         const currentTrack = this.songs.shift()
    //         if (this.loopMode) this.songs.push(currentTrack!)
    //         if (this.songs.length > 0) this.play()
    //     }
    // }
    
    // public stop() {
    //     this.player.removeListener(AudioPlayerStatus.Idle, this.playNext);
    //     this.player.stop()
    // }

    // public skip() {
    //     this.player.stop()
    // }

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
