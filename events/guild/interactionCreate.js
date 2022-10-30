const functions = require("../../handlers/functions.js");
const Discord = require("discord.js");

module.exports = async (client, interaction) => {

    // Commands
    if (interaction.isCommand()) {
        // If the user is rate limited...
        let isRateLimited = functions.isRateLimit(interaction.member.id);
        if (isRateLimited) {
            const errorEmbed = new Discord.EmbedBuilder()
                .setColor("#fe8181")
                .setDescription("You can only send commands every 2 seconds.")
                .setTimestamp();
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            // Return to stop the command.
            return;
        } else {
            // Rate limit the user if they currently aren;t rate limited.
            functions.rateLimit(interaction.member.id);
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                command.run(interaction);
                let text;
                if (interaction.options._hoistedOptions.length === 0 && !interaction.options._subcommand) {
                    text = `${interaction.member.user.tag} used /${interaction.commandName}.`.dim;
                }
                if (interaction.options._subcommand != null) {
                    if (interaction.options._hoistedOptions.length > 0) {
                        let hoistedOptions = "";
                        for (let i = 0; i < interaction.options._hoistedOptions.length; i++) {
                            let option = interaction.options._hoistedOptions[i];
                            let name = option.name;
                            let value = option.value;
                            hoistedOptions += " " + value + "[" + name + "]";
                        }
                        text = `${interaction.member.user.tag} used /${interaction.commandName} ${interaction.options._subcommand}${hoistedOptions}.`.dim;
                    } else {
                        text = `${interaction.member.user.tag} used /${interaction.commandName} ${interaction.options._subcommand}.`.dim;
                    }
                }
                if (interaction.options._hoistedOptions.length > 0) {
                    let hoistedOptions = "";
                    for (let i = 0; i < interaction.options._hoistedOptions.length; i++) {
                        let option = interaction.options._hoistedOptions[i];
                        let name = option.name;
                        let value = option.value;
                        hoistedOptions += " " + value + "[" + name + "]";
                    }
                    text = `${interaction.member.user.tag} used /${interaction.commandName}${hoistedOptions}.`.dim;
                }
                console.log(text)
            } catch (error) {
                functions.sendError(functions.objToString(error), interaction.guild, "Executing Command");
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
};