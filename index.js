const token = "DISCORD BOT TOKEN";

const {Client, GatewayIntentBits, Partials, EmbedBuilder, AttachmentBuilder} = require("discord.js");
const { Downloader } = require("@tobyg74/tiktok-api-dl")

// noinspection JSUnresolvedReference
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (message) => {
    const content = message.content;
    
    if (message.author.bot) {
        return;
    }

    for (const word of content.split(" ")) {
        analyseWord(message, word);
    }
});

function analyseWord(message, word) {
    const regex = /tiktok\.com/;
    const result = regex.test(word);

    if (result) {
        message.suppressEmbeds(true);
       
        console.log(word);

        Downloader(word, {
          version: "v2"
        }).then((result) => {
            sendResult(result.result, message, word);
        }).catch(result => console.log(result));
    }
}

async function sendResult(result, message, link) {
    try {
        const attachments = [];

        console.log(result);

        if (result.type === "video") {
            attachments.push(new AttachmentBuilder(
                result.video, {name: Date.now() + ".mp4"}
            ));
        } else if (result.type === "image") {
            let i = 1;

            for (const img of (result.images || [])) {
                if (i > 10) {
                    break;
                }

                attachments.push(new AttachmentBuilder(
                    img, {name: Date.now() + ".jpeg"}
                ));

                i++;
            }
        } else {
            return;
        }

        try {
            const m = await message.reply({
                files: attachments,
                content: "[@" + result.author.nickname + "  | Click](" + link + ")"
            });

            m.suppressEmbeds(true);
        } catch (e) {
            console.log(e);
        } 
    } catch (e) {
        console.log(e);
    }
}

client.login(token);