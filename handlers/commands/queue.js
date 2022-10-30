const audioQueue = require("../audioQueue.js");
const functions = require("../functions.js");

const config = require("../../config/config.json");

const playdl = require("play-dl");

const Discord = require("discord.js");

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
            for (let i = 0; i < queue.length; i++) {
                if (text.length < 3000) {
                    let title;
                    let url;
                    let icon;
                    if (queue[i][1] === "youtube") {
                        let info = await playdl.video_info(queue[i][0]).catch((err) => {
                            functions.sendError(functions.objToString(err), interaction.guild, "PlayDL Error");
                            console.error(err);
                            return {
                                video_details: {
                                    title: "Can't get Title"
                                },
                            };
                        });
                        title = info.video_details.title;
                        url = queue[i][0];
                        icon = "▶️";
                    }
                    if (queue[i][1] === "soundcloud") {
                        const scdl = require("soundcloud-downloader").default;
                        let info = await scdl.getInfo(queue[i][0], config.scClientID);
                        title = info.title;
                        url = queue[i][0];
                        icon = "🔊";
                    }
                    if (queue[i][1] === "file") {
                        title = queue[i][0][1];
                        url = queue[i][0][0];
                        icon = "📂";
                    }
                    if (i === 0) {
                        text = "`1.`" + icon + " `" + title + "`\n" + url;
                    } else {
                        let queueNum = i + 1;
                        text = text + "\n\n`" + queueNum + ".`" + icon + " `" + title + "`\n" + url;
                    }
                }
            }
            if (text.length >= 2000) {
                text = text + "...";
            }
            if (!text || text.length === 0) {
                text = "`No music in queue.`";
            }
            const successEmbed = new Discord.EmbedBuilder()
                .setColor("#84d2e1")
                .setTitle("Music Queue  🎵")
                .setDescription(text)
                .setTimestamp();
            message.edit({ embeds: [successEmbed] });
        }).catch((err) => {
            functions.sendError(functions.objToString(err), interaction.guild, "General Message");
            console.error(err);
        });
    }).catch((err) => {
        functions.sendError(functions.objToString(err), interaction.guild, "General Message");
        console.error(err);
    });
};