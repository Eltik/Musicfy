// When registering a new slash command, open a PowerShell window locally (on computer not Ptero panel)
// and do node deploy-commands.js.
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config/config.json');

const commands = [
	new SlashCommandBuilder().setName('queue').setDescription('Gets the current queue.'),
	new SlashCommandBuilder().setName('play').setDescription('Plays the music provided')
		.addSubcommand(
			subcommand => subcommand.setName("youtube").setDescription("Plays a YouTube video")
				.addStringOption(option => option.setName('search').setDescription('Link to a video or search by name.').setRequired(true))
		)
		.addSubcommand(
			subcommand => subcommand.setName("file").setDescription("Plays audio from a file. Valid types are .mp3, .wav, and .m4a.")
				.addAttachmentOption(option => option.setName('file').setDescription('The file to play.').setRequired(true))
		)
		.addSubcommand(
			subcommand => subcommand.setName("spotify").setDescription("Plays a Spotify track")
				.addStringOption(option => option.setName('search').setDescription('Spotify search query').setRequired(true))
		)
		.addSubcommand(
			subcommand => subcommand.setName("soundcloud").setDescription("Plays from SoundCloud.")
				.addStringOption(option => option.setName('search').setDescription('Link to a SoundCloud track or search by name.').setRequired(true))
	),
	new SlashCommandBuilder().setName('pause').setDescription('Pauses the music.'),
	new SlashCommandBuilder().setName('resume').setDescription('Resumes the music.'),
	new SlashCommandBuilder().setName('clear').setDescription('Clears the queue.'),
	new SlashCommandBuilder().setName('skip').setDescription('Skips a track.').addIntegerOption(option => option.setName('index').setDescription('The index to remove (optional).')),
	new SlashCommandBuilder().setName('nowplaying').setDescription('Gets the current song playing.'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
