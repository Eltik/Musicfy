const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require("@discordjs/voice");
const playdl = require('play-dl');
const KEYS = require("./KEYS");
const scdl = require("soundcloud-downloader").default;

let variables = require("../variables.js");
let audioQueue = require("../audioQueue.js");
const config = require("../../config/config.json");
const functions = require("../functions.js");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const nodeStream = require("stream");
const fs = require("fs");
const util = require("util");
const { join } = require("path");

module.exports = class Music {
    constructor(key, data, channel, guild) {
        this.key = key;
        this.data = data;
        this.channel = channel;
        this.guild = guild;
    }

    getKey() {
        return this.key;
    }

    getMusicData() {
        return this.data;
    }

    pauseAudio() {
        let player = this.getPlayer(this.guild.id);
        if (!player) {
            return false;
        } else {
            return player.pause() ? true : false;
        }
    }

    unpauseAudio() {
        let player = this.getPlayer(this.guild.id);
        if (!player) {
            return false;
        } else {
            return player.unpause() ? true : false;
        }
    }

    stopAudio(guildId) {
        // Get the connection.
        const connection = getVoiceConnection(this.guild.id);
        if (!connection) {
            return false;
        } else {
            // Clear the queue.
            audioQueue.clearQueue(this.guild.id);
            let player = this.getPlayer(this.guild.id);
            if (player != undefined) {
                // Stop the audio.
                player.stop();
            }
            // Destroy the connection (because there's no need to play anything anymore).
            connection.destroy();
            // Remove the player from the guild.
            this.removePlayer(guildId);
            return true;
        }
    }

    getPlayer() {
        // The array contains AudioPlayer objects.
        for (let i = 0; i < variables.players.length; i++) {
            if (variables.players[i][1] === this.guild.id) {
                return variables.players[i][0];
            }
        }
        return null;
    }

    removePlayer() {
        for (let i = 0; i < variables.players.length; i++) {
            if (variables.players[i][1] === this.guild.id) {
                variables.players.splice(i, 1);
            }
        }
    }

    async playAudio() {
        let stream;
        let resource;

        if (this.key === KEYS.YOUTUBE) {
            stream = await playdl.stream(this.data);
            resource = createAudioResource(stream.stream, {
                inputType: stream.type
            });
        } else if (this.key === KEYS.SOUNDCLOUD) {
            stream = await scdl.download(this.data, config.scClientID).catch(console.error);
            stream = { "stream": stream };
            resource = createAudioResource(stream.stream, {
                inputType: stream.type
            });
        } else if (this.key === KEYS.FILE) {
            const streamPipeline = util.promisify(nodeStream.pipeline);
            const response = await fetch(this.data.url ?? this.data.link);
            await streamPipeline(response.body, fs.createWriteStream(`./handlers/voice/${this.data.name}`));
            stream = { "stream": this.data.url };
            resource = createAudioResource(join(__dirname, "./music/" + stream.name));
        }
        const player = createAudioPlayer();
        variables.players.push([player, this.guild.id]);

        let connection = await joinVoiceChannel({
            channelId: this.channel.id,
            guildId: this.guild.id,
            adapterCreator: this.guild.voiceAdapterCreator
        });

        connection.subscribe(player);

        if (!stream) {
            console.log("Error! No stream.".red);
            functions.sendError("No stream found!", this.guild, "Audio");
        }

        player.play(resource);

        player.on('error', async error => {
            console.error(`Error: ${error.message} with resource`.red);
            console.error(error);
        });
    
        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            this.stopAudio(this.guild.id);
            connection.destroy();
            audioQueue.clearQueue(this.guild.id);
            return;
        });

        player.on(AudioPlayerStatus.Idle, async () => {
            // Remove the current playing audio.
            audioQueue.removeQueue(this.guild.id);
            // Get the queue for the guild.
            let queue = audioQueue.getQueue(this.guild.id);
            // Remove the player for the guild.
            this.removePlayer(this.guild.id);
            if (queue.length === 0 || !queue) {
                // If the queue is empty, return and destroy the connection.
                connection.destroy();
                return;
            } else {
                let newQueue = audioQueue.getQueue(this.guild.id);
                if (newQueue[1] === "file") {
                    fs.unlink(join(__dirname, "./music/" + stream.name), (err) => {
                        if (err) {
                            return;
                        }
                        console.log("Deleted ".red + stream.name + ".".red);
                    });
                }
                this.playNext(this.channel, this.guild, newQueue[1]);
            }
        });
    }

    async playNext(type) {
        // Array:
        // [guildId, link, type]
        // For getting the queue, it is [link, type].
        // Link for YouTube is the YouTube URL, but for files it is [url, name]. So for files the array is [guildId, [url, name], type]
        
        // All this does is just reiterate the playAudio function.
        if (type === "file") {
            let file = audioQueue.getQueue(this.guild.id)[0][0];
            let audio = new Music(KEYS.FILE, file, this.channel, this.guild);
            audio.playAudio();
        } else if (type === "soundcloud") {
            let queue = audioQueue.getQueue(this.guild.id);
            let audio = new Music(KEYS.SOUNDCLOUD, queue[0][0], this.channel, this.guild);
            audio.playAudio();
        } else {
            let queue = audioQueue.getQueue(this.guild.id);
            let audio = new Music(KEYS.YOUTUBE, queue[0][0], this.channel, this.guild);
            audio.playAudio();
        }
    }
};