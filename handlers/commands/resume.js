const Music = require("../objects/Music.js");
const audioQueue = require("../audioQueue.js");
const functions = require("../functions.js");

const Discord = require("discord.js");

module.exports.run = async (interaction) => {
    let queue = audioQueue.getQueue(interaction.guild.id);
    if (queue.length === 0 || !queue) {
        const errorEmbed = new Discord.EmbedBuilder()
            .setColor("#fe8181")
            .setDescription("There's no current queue.")
            .setTimestamp();
        interaction.reply({ embeds: [errorEmbed] });
        return;
    }

    let audio = new Music(null, null, null, interaction.guild);
    let canPause = audio.unpauseAudio(interaction.guild.id);
    if (!audio.getPlayer(interaction.guild.id)) {
        audio.fix(interaction.member.voice.channel, interaction.guild.id);
    }
    if (canPause) {
        const successEmbed = new Discord.EmbedBuilder()
            .setColor("#84d2e1")
            .setTitle("Resumed  ▶️")
            .setDescription("All audio has resumed!")
            .setTimestamp();
        interaction.reply({ embeds: [successEmbed] });
    } else {
        const successEmbed = new Discord.EmbedBuilder()
            .setColor("#fe8181")
            .setDescription("Could not resume the audio! Please let <@429659644634333195> know (`Eltik#0001`).")
            .setTimestamp();
        interaction.reply({ embeds: [successEmbed] });
        functions.sendError("Error resuming audio for `" + interaction.guild.id + "` sent from `" + interaction.member.id + "`.", interaction.guild, "Audio");
    }
};