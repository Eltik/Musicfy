const Music = require("../objects/Music.js");
const audioQueue = require("../audioQueue.js");

const functions = require("../functions.js");

const config = require("../../config/config.json");

const playdl = require("play-dl");

const Discord = require("discord.js");
const { default: UrlParser } = require("js-video-url-parser/lib/urlParser");
const KEYS = require("../objects/KEYS.js");

module.exports.run = async (interaction) => {
    // Fetch the voice role.
    if (interaction.options.getSubcommand() === "spotify") {
        interaction.reply({ content: "Spotify isn't supported yet!", ephemeral: true });
        // https://www.npmjs.com/package/spdl-core
        // https://www.npmjs.com/package/draw-wave
        // https://www.npmjs.com/package/soundcloud
        // https://www.npmjs.com/package/genius-lyrics-api
        // PLAY-DL HAS SOUNDCLOUD AND SPOTIFY SUPPORT
        if (playdl.is_expired()) {
            await playdl.refreshToken() // This will check if access token has expired or not. If yes, then refresh the token.
        }
        let query = interaction.options.getString("search");
        // If the user isn't connected to a VC.
        if (!interaction.member.voice.channel) {
            const genresEmbed = new Discord.EmbedBuilder()
                .setColor("#fe8181")
                .setDescription("You need to be in a voice channel to play audio!")
                .setTimestamp();
            interaction.reply({ embeds: [genresEmbed], ephemeral: true });
        } else {
            const loadingEmbed = new Discord.EmbedBuilder()
                .setColor("#84d2e1")
                .setDescription("Loading...")
                .setTimestamp();
            await interaction.reply({ embeds: [loadingEmbed], fetchReply: true }).then(async (msg) => {
                await interaction.channel.messages.fetch(msg.id).then(async (message) => {
                    if (!message) {
                        return;
                    }
                    if (!interaction.member.voice.channel) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor("#fe8181")
                            .setDescription("You need to be in a voice channel to play audio!")
                            .setTimestamp();
                        message.edit({ embeds: [errorEmbed] });
                    } else {
                        // SPOTIFY THING
                    }
                }).catch((err) => {
                    console.error(err);
                    functions.sendError(functions.objToString(err), interaction.guild, "Commands");
                });
            }).catch((err) => {
                console.error(err);
                functions.sendError(functions.objToString(err), interaction.guild, "Commands");
            });
        }
    }

    if (interaction.options.getSubcommand() === "soundcloud") {

        let query = interaction.options.getString("search");
        // If the user isn't connected to a VC.
        if (!interaction.member.voice.channel) {
            const genresEmbed = new Discord.EmbedBuilder()
                .setColor("#fe8181")
                .setDescription("You need to be in a voice channel to play audio!")
                .setTimestamp();
            interaction.reply({ embeds: [genresEmbed], ephemeral: true });
        } else {
            const loadingEmbed = new Discord.EmbedBuilder()
                .setColor("#84d2e1")
                .setDescription("Loading...")
                .setTimestamp();
            await interaction.reply({ embeds: [loadingEmbed], fetchReply: true }).then(async (msg) => {
                await interaction.channel.messages.fetch(msg.id).then(async (message) => {
                    if (!message) {
                        return;
                    }
                    if (!interaction.member.voice.channel) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor("#fe8181")
                            .setDescription("You need to be in a voice channel to play audio!")
                            .setTimestamp();
                        message.edit({ embeds: [errorEmbed] });
                    } else {
                        const scdl = require("soundcloud-downloader").default;
                        const urlParser = require("js-video-url-parser");
                        let parsed = urlParser.parse(query);
                        if (!parsed || parsed.provider != "soundcloud") {
                            const scSearch = new (require("soundcloud-search-core"))(config.scClientID);

                            let results = await scSearch.tracks(query, 1).catch((err) => {
                                functions.sendError(functions.objToString(err), interaction.guild, "SoundCloud");
                            });
                            if (results.length === 0) {
                                const errorEmbed = new Discord.EmbedBuilder()
                                    .setColor("#fe8181")
                                    .setDescription("Please provide a valid URL or query!")
                                    .setTimestamp();
                                message.edit({ embeds: [errorEmbed] })
                                return;
                            } else {
                                query = results[0].permalink_url;
                            }
                        }

                        await scdl.getInfo(query, config.scClientID).then((res) => {
                            audioQueue.addQueue(interaction.guild.id, query, "soundcloud");
                            let queue = audioQueue.getQueue(message.guild.id);
                            if (queue.length > 1) {
                                const errorEmbed = new Discord.EmbedBuilder()
                                    .setColor("#84d2e1")
                                    .setTitle("Added to Queue  ⏯️")
                                    .setDescription("`" + res.title + "` has been added to the queue.\n" + query)
                                    .setImage(res.artwork_url)
                                    .setTimestamp();
                                message.edit({ embeds: [errorEmbed] });
                                return;
                            }
                            let audio = new Music(KEYS.SOUNDCLOUD, query, interaction.member.voice.channel, interaction.guild);
                            audio.playAudio();
                            const successEmbed = new Discord.EmbedBuilder()
                                .setColor("#84d2e1")
                                .setTitle("Playing  ▶️")
                                .setDescription("Now playing `" + res.title + "`!\n" + query)
                                .setImage(res.artwork_url)
                                .setTimestamp();
                            message.edit({ embeds: [successEmbed] }); 
                        }).catch((err) => {
                            console.error(err);
                            functions.sendError(functions.objToString(err), interaction.guild, "SoundCloud");
                        });
                    }
                }).catch((err) => {
                    console.error(err);
                    functions.sendError(functions.objToString(err), interaction.guild, "Commands");
                });
            }).catch((err) => {
                console.error(err);
                functions.sendError(functions.objToString(err), interaction.guild, "Commands");
            });
        }
    }

    if (interaction.options.getSubcommand() === "file") {
        if (!interaction.member.voice.channel) {
            const genresEmbed = new Discord.EmbedBuilder()
                .setColor("#fe8181")
                .setDescription("You need to be in a voice channel to play audio!")
                .setTimestamp();
            interaction.reply({ embeds: [genresEmbed], ephemeral: true });
        } else {
            const loadingEmbed = new Discord.EmbedBuilder()
                .setColor("#84d2e1")
                .setDescription("Loading...")
                .setTimestamp();
            await interaction.reply({ embeds: [loadingEmbed], fetchReply: true }).then(async (msg) => {
                await interaction.channel.messages.fetch(msg.id).then(async (message) => {
                    if (!message) {
                        return;
                    }

                    let file = interaction.options.getAttachment("file");

                    if (!interaction.member.voice || !interaction.member.voice.channel) {
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor("#fe8181")
                            .setDescription("You need to be in a voice channel to play audio!")
                            .setTimestamp();
                        message.edit({ embeds: [errorEmbed] });
                        return;
                    }

                    if (file.name.toLowerCase().endsWith(".mp3") || file.name.toLowerCase().endsWith(".m4a") || file.name.toLowerCase().endsWith(".wav")) {

                        audioQueue.addQueue(message.guild.id, [file.url, file.name], "file");
                        let queue = audioQueue.getQueue(message.guild.id);
                        if (queue.length > 1) {
                            const errorEmbed = new Discord.EmbedBuilder()
                                .setColor("#84d2e1")
                                .setTitle("Added to Queue  ⏯️")
                                .setDescription("`" + file.name + "` has been added to the queue.\n" + file.url)
                                .setTimestamp();
                            message.edit({ embeds: [errorEmbed] });
                            return;
                        }
                        let audio = new Music(KEYS.FILE, file, interaction.member.voice.channel, interaction.guild);
                        audio.playAudio();
                        const successEmbed = new Discord.EmbedBuilder()
                            .setColor("#84d2e1")
                            .setTitle("Playing  ▶️")
                            .setDescription("Now playing `" + file.name + "`!\n" + file.url)
                            .setTimestamp();
                        message.edit({ embeds: [successEmbed] });
                    } else {
                        const notSetEmbed = new Discord.EmbedBuilder()
                            .setColor("#fe8181")
                            .setDescription("You need to provide a valid audio file. Valid extensions include `.mp3`, `.m4a`, and `.wav`.")
                            .setTimestamp();
                        message.edit({ embeds: [notSetEmbed] });
                        return;
                    }
                }).catch((err) => {
                    console.error(err);
                });
            }).catch((err) => {
                console.error(err);
            })
        }
        // https://www.npmjs.com/package/spdl-core
        // https://www.npmjs.com/package/draw-wave
        // https://www.npmjs.com/package/soundcloud
        // PLAY-DL HAS SOUNDCLOUD AND SPOTIFY SUPPORT
    }

    if (interaction.options.getSubcommand() === "youtube") {
        let query = interaction.options.getString("search");
        // If the user isn't connected to a VC.
        if (!interaction.member.voice.channel) {
            const genresEmbed = new Discord.EmbedBuilder()
                .setColor("#fe8181")
                .setDescription("You need to be in a voice channel to play audio!")
                .setTimestamp();
            interaction.reply({ embeds: [genresEmbed], ephemeral: true });
        } else {
            const loadingEmbed = new Discord.EmbedBuilder()
                .setColor("#84d2e1")
                .setDescription("Loading...")
                .setTimestamp();
            await interaction.reply({ embeds: [loadingEmbed], fetchReply: true }).then(async (msg) => {
                await interaction.channel.messages.fetch(msg.id).then(async (message) => {
                    if (!message) {
                        return;
                    }

                    if (playdl.yt_validate(query) === "playlist") {
                        const playlist = await playdl.playlist_info(query);
                        let embeds = [];
                        for (let i = 0; i < playlist.videos.length; i++) {
                            query = playlist.videos[i].url;
                            await playdl.search(query, {
                                limit: 1
                            }).then(async (res) => {
                                if (query.startsWith('https') && playdl.yt_validate(query) === 'video') {
                                    query = query;
                                } else {
                                    query = res[0].url;
                                }

                                await playdl.video_info(query).then((res) => {
                                    if (!message) {
                                        return;
                                    }
                                    let name = res.video_details.title;
                                    let tnail = res.video_details.thumbnails[res.video_details.thumbnails.length - 1].url;
                                    if (!interaction.member.voice.channel) {
                                        const genresEmbed = new Discord.EmbedBuilder()
                                            .setColor("#fe8181")
                                            .setDescription("You need to be in a voice channel to play audio!")
                                            .setTimestamp();
                                        message.edit({ embeds: [genresEmbed], ephemeral: true });
                                        return;
                                    }

                                    audioQueue.addQueue(interaction.guild.id, query, "youtube");
                                    let queue = audioQueue.getQueue(interaction.guild.id);
                                    if (queue.length > 1) {
                                        embeds.push("`" + name + "` has been added to the queue.\n" + query);
                                        return;
                                    }
                                    let audio = new Music(KEYS.YOUTUBE, query, interaction.member.voice.channel, interaction.guild);
                                    audio.playAudio();
                                    const successEmbed = new Discord.EmbedBuilder()
                                        .setColor("#84d2e1")
                                        .setTitle("Playing  ▶️")
                                        .setDescription("Now playing `" + name + "`!\n*We're adding the rest of the songs from the playlist...*\n\n" + query)
                                        .setImage(tnail)
                                        .setTimestamp();
                                    interaction.channel.send({ embeds: [successEmbed] });
                                }).catch((err) => {
                                    functions.sendError(functions.objToString(err), interaction.guild, "Play-Dl");
                                    console.error(err);
                                });
                            }).catch((err) => {
                                functions.sendError(functions.objToString(err), interaction.guild, "Play-Dl");
                                console.error(err);
                                message.edit({ content: "No results for that query! ", embeds: [] });
                            });
                        }
                        let text = "";
                        for (let i = 0; i < embeds.length; i++) {
                            text += "\n`" + i + "`. " + embeds[i];
                        }
                        const errorEmbed = new Discord.EmbedBuilder()
                            .setColor("#84d2e1")
                            .setTitle("Added to Queue  ⏯️")
                            .setDescription(text)
                            .setTimestamp();
                        message.edit({ embeds: [errorEmbed] });
                        return;
                    }

                    await playdl.search(query, {
                        limit: 1
                    }).then(async (res) => {
                        if (query.startsWith('https') && playdl.yt_validate(query) === 'video') {
                            query = query;
                        } else {
                            query = res[0].url;
                        }

                        playdl.video_info(query).then((res) => {
                            if (!message) {
                                return;
                            }
                            let name = res.video_details.title;
                            let tnail = res.video_details.thumbnails[res.video_details.thumbnails.length - 1].url;
                            if (!interaction.member.voice.channel) {
                                const genresEmbed = new Discord.EmbedBuilder()
                                    .setColor("#fe8181")
                                    .setDescription("You need to be in a voice channel to play audio!")
                                    .setTimestamp();
                                message.edit({ embeds: [genresEmbed], ephemeral: true });
                                return;
                            }

                            audioQueue.addQueue(interaction.guild.id, query, "youtube");
                            let queue = audioQueue.getQueue(interaction.guild.id);
                            if (queue.length > 1) {
                                const errorEmbed = new Discord.EmbedBuilder()
                                    .setColor("#84d2e1")
                                    .setTitle("Added to Queue  ⏯️")
                                    .setDescription("`" + name + "` has been added to the queue.\n" + query)
                                    .setImage(tnail)
                                    .setTimestamp();
                                message.edit({ embeds: [errorEmbed] });
                                return;
                            }
                            let audio = new Music(KEYS.YOUTUBE, query, interaction.member.voice.channel, interaction.guild);
                            audio.playAudio();
                            const successEmbed = new Discord.EmbedBuilder()
                                .setColor("#84d2e1")
                                .setTitle("Playing  ▶️")
                                .setDescription("Now playing `" + name + "`!\n" + query)
                                .setImage(tnail)
                                .setTimestamp();
                            message.edit({ embeds: [successEmbed] });
                        }).catch((err) => {
                            functions.sendError(functions.objToString(err), interaction.guild, "Play-Dl");
                            console.error(err);
                            const errorEmbed = new Discord.EmbedBuilder()
                                .setColor("#fe8181")
                                .setDescription("An error seemed to occur! Please contact Eltik.")
                                .setTimestamp();
                            message.edit({ embeds: [errorEmbed] });
                        });
                    }).catch((err) => {
                        functions.sendError(functions.objToString(err), interaction.guild, "Play-Dl");
                        console.error(err);
                        message.edit({ content: "No results for that query! ", embeds: [] });
                    });
                }).catch((err) => {
                    functions.sendError(functions.objToString(err), interaction.guild, "General Message");
                    console.error(err);
                });
            }).catch((err) => {
                functions.sendError(functions.objToString(err), interaction.guild, "General Message");
                console.error(err);
            });
        }
    }
};