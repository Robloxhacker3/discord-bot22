const { 
    Client, 
    GatewayIntentBits, 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

const TOKEN = "your-bot-token-here"; // Replace with your bot's actual token

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Register the /linkvertise and /lootlabs commands
    const commands = await client.application.commands;
    await commands.create(
        new SlashCommandBuilder()
            .setName('linkvertise')
            .setDescription('Bypass a Linkvertise URL')
            .addStringOption(option =>
                option.setName('url')
                    .setDescription('The Linkvertise URL to bypass')
                    .setRequired(true)
            )
    );

    await commands.create(
        new SlashCommandBuilder()
            .setName('lootlabs')
            .setDescription('Bypass a Lootlabs URL')
            .addStringOption(option =>
                option.setName('url')
                    .setDescription('The Lootlabs URL to bypass')
                    .setRequired(false)
            )
    );

    console.log("Slash commands registered.");
});

// Handle interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'linkvertise') {
        const link = interaction.options.getString('url');
        if (link.includes("linkvertise.com")) {
            await interaction.deferReply({ ephemeral: true });

            const bypassedLink = await bypassLinkvertise(link);
            if (bypassedLink) {
                await interaction.editReply(`**Bypassed Linkvertise:**\n${bypassedLink}`);
            } else {
                await interaction.editReply('Sorry, there was an error bypassing the Linkvertise link.');
            }
        } else {
            await interaction.reply({
                content: 'The provided URL is not a valid Linkvertise link.',
                ephemeral: true
            });
        }
    }

    if (interaction.commandName === 'lootlabs') {
        const link = interaction.options.getString('url');

        if (link) {
            // Attempt to bypass the provided URL without validation
            await interaction.deferReply({ ephemeral: true });

            const bypassedLink = await bypassLootlabs(link);
            if (bypassedLink) {
                await interaction.editReply(`**Bypassed Lootlabs:**\n${bypassedLink}`);
            } else {
                await interaction.editReply('Sorry, there was an error bypassing the Lootlabs link.');
            }
        } else {
            // If no URL is provided, prompt for interaction with a button
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('provide_link')
                    .setLabel('Provide Link')
                    .setStyle(ButtonStyle.Primary)
            );

            await interaction.reply({
                content: 'Click the button below to provide your Lootlabs link:',
                components: [row],
                ephemeral: true
            });
        }
    }

    // Handle button interaction for Lootlabs
    if (interaction.isButton() && interaction.customId === 'provide_link') {
        await interaction.reply({ content: 'Please check your DMs and send the link there.', ephemeral: true });

        try {
            const dmChannel = await interaction.user.createDM();
            await dmChannel.send("Please provide the Lootlabs link you'd like to bypass:");

            const filter = m => m.author.id === interaction.user.id;
            const dmMessage = await dmChannel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
            const link = dmMessage.first().content;

            const bypassedLink = await bypassLootlabs(link);
            if (bypassedLink) {
                await dmChannel.send(`Bypassing complete! Here's the bypassed link: ${bypassedLink}`);
            } else {
                await dmChannel.send('Sorry, the link could not be bypassed. Please try again later.');
            }
        } catch (error) {
            console.error("Error handling user input:", error);
            await interaction.user.send('You took too long to respond or an error occurred. Please try again later.');
        }
    }
});

// Function to bypass Linkvertise links
async function bypassLinkvertise(url) {
    const apiUrl = `https://usescarletios.vercel.app/api/linkvertise?url=${encodeURIComponent(url)}`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        console.log("Linkvertise API Response:", data);

        if (data.link) {
            return data.link;
        } else {
            console.error('Linkvertise bypass failed:', data);
            return null;
        }
    } catch (error) {
        console.error('Error making Linkvertise bypass request:', error);
        return null;
    }
}

// Function to bypass Lootlabs links
async function bypassLootlabs(url) {
    const apiUrl = `https://ethos.kys.gay/api/free/bypass?url=${encodeURIComponent(url)}`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        console.log("Lootlabs API Response:", data);

        if (data.result) {
            return data.result;
        } else {
            console.error('Lootlabs bypass failed:', data);
            return null;
        }
    } catch (error) {
        console.error('Error making Lootlabs bypass request:', error);
        return null;
    }
}

client.login(TOKEN);
