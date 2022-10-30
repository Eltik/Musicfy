module.exports = client => {
    client.user.setActivity('Anime', { type: "WATCHING" });
    // When the client loads...
    console.log(`Logged in as ${client.user.tag}!`.rainbow);
};