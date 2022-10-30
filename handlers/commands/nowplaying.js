const audioQueue = require("../audioQueue.js");
const Music = require("../objects/Music.js");
const functions = require("../functions.js");

const config = require("../../config/config.json");

const playdl = require("play-dl");

const Discord = require("discord.js");

const fs = require("fs");

const mm = (...args) => import('music-metadata').then(({default: mm}) => mm(...args))
const util = require("util");

module.exports.run = async (interaction) => {
    const loadingEmbed = new Discord.EmbedBuilder()
        .setColor("#84d2e1")
        .setDescription("Loading...")
        .setTimestamp();
    await interaction.reply({ embeds: [loadingEmbed], fetchReply: true }).then(async (msg) => {
        await interaction.channel.messages.fetch(msg.id).then(async (message) => {
            if (!message) {
                return;
            }
            let queue = audioQueue.getQueue(interaction.guild.id);

            let text = "";
            let title;
            if (queue.length > 0) {
                let audio = new Music(null, null, null, interaction.guild);
                let player = audio.getPlayer(interaction.guild.id);
                let url;
                let icon;
                let description;
                if (queue[0][1] === "youtube") {
                    let info = await playdl.video_info(queue[0][0]);

                    let durSec = info.video_details.durationInSec;
                    let playback = player._state.playbackDuration / 1000;
                    let percent = playback / durSec * 10;

                    let blackSquare = "◾";
                    let redSquare = "🟥";
                    let progressBar = "";
                    for (let i = 0; i < 10; i++) {
                        if (i === Math.round(percent)) {
                            progressBar += redSquare;
                        } else {
                            progressBar += blackSquare;
                        }
                    }

                    let playbackMin = Math.floor(playback / 60);
                    let playbackSec = Math.round(playback % 60);
                    if (playbackMin < 9 && playbackMin != 0) {
                        playbackMin = "0" + playbackMin;
                    }
                    if (playbackSec < 9 && playbackSec != 0) {
                        playbackSec = "0" + playbackSec;
                    }

                    let remainingTime = durSec - playback;
                    let remMin = Math.floor(remainingTime / 60);
                    let remSec = Math.round(remainingTime % 60);
                    if (remMin < 9 && remMin != 0) {
                        remMin = "0" + remMin;
                    }
                    if (remSec < 9 && remSec != 0) {
                        remSec = "0" + remSec;
                    }

                    let timeLeft = "`[" + playbackMin + ":" + playbackSec + "]`";
                    let totalTime = "`[" + info.video_details.durationRaw + "]`";
                    let totalRemaining = "`[" + remMin + ":" + remSec + "]`";

                    title = info.video_details.title;
                    url = queue[0][0];
                    icon = "▶️";
                    description = "Uploaded by `" + info.video_details.channel.name + "`\n\nTotal Duration: " + totalTime + "\nUploaded at `" + info.video_details.uploadedAt + "`\n\n" + timeLeft + " " + progressBar + " " + totalRemaining;

                    text = icon + " " + description + "\n\n" + url;

                    if (text.length >= 2000) {
                        text = text + "...";
                    }
                    if (!text || text.length === 0) {
                        text = "`No music in queue.`";
                    }

                    const successEmbed = new Discord.EmbedBuilder()
                        .setColor("#84d2e1")
                        .setTitle(title)
                        .setDescription(text)
                        .setTimestamp();
                    message.edit({ embeds: [successEmbed] });
                }
                if (queue[0][1] === "soundcloud") {
                    // https://www.npmjs.com/package/soundcloud-waveform-parser maybe add?
                    const scdl = require("soundcloud-downloader").default;
                    let info = await scdl.getInfo(queue[0][0], config.scClientID);

                    let durSec = info.duration / 1000;
                    let duration = durSec;
                    let playback = player._state.playbackDuration / 1000;
                    let percent = playback / durSec * 10;

                    let blackSquare = "◾";
                    let redSquare = "🟥";
                    let progressBar = "";
                    for (let i = 0; i < 10; i++) {
                        if (i === Math.round(percent)) {
                            progressBar += redSquare;
                        } else {
                            progressBar += blackSquare;
                        }
                    }

                    let playbackMin = Math.floor(playback / 60);
                    let playbackSec = Math.round(playback % 60);
                    if (playbackMin < 9 && playbackMin != 0) {
                        playbackMin = "0" + playbackMin;
                    }
                    if (playbackSec < 9 && playbackSec != 0) {
                        playbackSec = "0" + playbackSec;
                    }

                    let remainingTime = durSec - playback;
                    let remMin = Math.floor(remainingTime / 60);
                    let remSec = Math.round(remainingTime % 60);
                    if (remMin < 9 && remMin != 0) {
                        remMin = "0" + remMin;
                    }
                    if (remSec < 9 && remSec != 0) {
                        remSec = "0" + remSec;
                    }

                    let totalMin = Math.floor(duration / 60);
                    let totalSec = Math.round(duration % 60);
                    if (totalMin < 9 && totalMin != 0) {
                        totalMin = "0" + totalMin;
                    }
                    if (totalSec < 9 && totalSec != 0) {
                        totalSec = "0" + totalSec;
                    }

                    let totalTime = "`[" + totalMin + ":" + totalSec + "]`";
                    let timeLeft = "`[" + playbackMin + ":" + playbackSec + "]`";
                    let totalRemaining = "`[" + remMin + ":" + remSec + "]`";

                    title = info.title;
                    url = queue[0][0];
                    icon = "🔊";
                    description = "Uploaded by `" + info.user.username + "`\n\nTotal Duration: " + totalTime + "\nLikes: `" + info.likes_count + "`\n\n" + timeLeft + " " + progressBar + " " + totalRemaining;

                    text = icon + " " + description + "\n\n" + url;

                    if (text.length >= 2000) {
                        text = text + "...";
                    }
                    if (!text || text.length === 0) {
                        text = "`No music in queue.`";
                    }

                    const successEmbed = new Discord.EmbedBuilder()
                        .setColor("#84d2e1")
                        .setTitle(title)
                        .setDescription(text)
                        .setTimestamp();
                    message.edit({ embeds: [successEmbed] });
                }
                if (queue[0][1] === "file") {
                    title = queue[0][0][1];
                    url = queue[0][0][0];
                    icon = "📂";

                    if (!player) {
                        const successEmbed = new Discord.EmbedBuilder()
                            .setColor("#84d2e1")
                            .setTitle("Nothing playing yet!")
                            .setDescription("It usually takes a few seconds for the player to load since we have to download the file and stream it. Please be patient!")
                            .setTimestamp();
                        message.edit({ embeds: [successEmbed] });
                        return;
                    }

                    const buffer = fs.readFileSync(`./handlers/voice/music/${title}`);

                    try {
                        let meta = await mm.parseBuffer(buffer, buffer.mime, { duration: true });
                        let metadata = meta;
                        // lighthouse is 34 seconds
                        let duration = metadata.format.duration;
                        let durSec = duration;
                        duration = durSec;

                        let playback = player._state.playbackDuration / 1000;
                        let percent = playback / durSec * 10;

                        let blackSquare = "◾";
                        let redSquare = "🟥";
                        let progressBar = "";
                        for (let i = 0; i < 10; i++) {
                            if (i === Math.round(percent)) {
                                progressBar += redSquare;
                            } else {
                                progressBar += blackSquare;
                            }
                        }

                        let playbackMin = Math.floor(playback / 60);
                        let playbackSec = Math.round(playback % 60);
                        if (playbackMin < 9 && playbackMin != 0) {
                            playbackMin = "0" + playbackMin;
                        }
                        if (playbackSec < 9 && playbackSec != 0) {
                            playbackSec = "0" + playbackSec;
                        }

                        let remainingTime = durSec - playback;
                        let remMin = Math.floor(remainingTime / 60);
                        let remSec = Math.round(remainingTime % 60);
                        if (remMin < 9 && remMin != 0) {
                            remMin = "0" + remMin;
                        }
                        if (remSec < 9 && remSec != 0) {
                            remSec = "0" + remSec;
                        }

                        let timeLeft = "`[" + playbackMin + ":" + playbackSec + "]`";

                        let totalMin = Math.floor(duration / 60);
                        let totalSec = Math.round(duration % 60);
                        if (totalMin < 9 && totalMin != 0) {
                            totalMin = "0" + totalMin;
                        }
                        if (totalSec < 9 && totalSec != 0) {
                            totalSec = "0" + totalSec;
                        }

                        let totalTime = "`[" + totalMin + ":" + totalSec + "]`";
                        let totalRemaining = "`[" + remMin + ":" + remSec + "]`";

                        // CREDIT TO BLURB FOR HELP WITH THE MATH
                        description = "File upload.\nTotal Duration: " + totalTime + "\n" + timeLeft + " " + progressBar + " " + totalRemaining;

                        text = icon + " " + description + "\n\n" + url;

                        if (text.length >= 2000) {
                            text = text + "...";
                        }
                        if (!text || text.length === 0) {
                            text = "`No music in queue.`";
                        }

                        const successEmbed = new Discord.EmbedBuilder()
                            .setColor("#84d2e1")
                            .setTitle(title)
                            .setDescription(text)
                            .setTimestamp();
                        message.edit({ embeds: [successEmbed] });
                    } catch (err) {
                        console.error(err);
                    }
                }
            } else {
                title = "Nothing Playing";
                const successEmbed = new Discord.EmbedBuilder()
                    .setColor("#84d2e1")
                    .setTitle(title)
                    .setDescription("Nothing in queue.")
                    .setTimestamp();
                message.edit({ embeds: [successEmbed] });
            }
        }).catch((err) => {
            functions.sendError(functions.objToString(err), interaction.guild, "General Message");
            console.error(err);
        });
    }).catch((err) => {
        functions.sendError(functions.objToString(err), interaction.guild, "General Message");
        console.error(err);
    });
};