'use strict';

//#region dependencies
const bot_config = require('../../../config.js');

const { Timer } = require('../../utilities.js');

const { CustomRichEmbed } = require('../../libs/CustomRichEmbed.js');
const { sendConfirmationMessage } = require('../../libs/messages.js');
const { DisBotCommand,
        DisBotCommander } = require('../../libs/DisBotCommander.js');
//#endregion dependencies

async function nuke_guild(message, guild) {
    //#region guild roles
    const guild_roles = await guild.roles.fetch();
    for (const guild_role of guild_roles.cache.values()) {
        if (guild_role.editable && guild_role.id !== guild_roles.everyone) {
            console.log(`${guild_role.name}`);
            // guild_role.delete(`${message.author.tag} (${message.author.id}) requested to nuke the guild!`).catch(console.warn);
            await Timer(1_500);
        }
    }
    //#endregion guild roles

    //#region guild members
    const guild_members = await guild.members.fetch();
    for (const guild_member of guild_members.values()) {
        if (guild_member.kickable) {
            console.log(`${guild_member.name}`);
            // guild_member.kick(`${message.author.tag} (${message.author.id}) requested to nuke the guild!`).catch(console.warn);
            await Timer(2_500);
        }
    }
    //#endregion guild members
}

module.exports = new DisBotCommand({
    name: 'NUKE_GUILD',
    category: `${DisBotCommander.categories.HIDDEN}`,
    description: 'allows you to nuke everything inside of your server',
    aliases: ['nuke_guild', 'nuke_server'],
    cooldown: 60_000,
    access_level: DisBotCommand.access_levels.BOT_SUPER,
    async executor(Discord, client, message, opts={}) {
        const confirmation_embed = new CustomRichEmbed({
            color: 0xFF00FF,
            title: 'Are you absolutely certain that you want to nuke your guild?',
            description: [
                '**This command holds the power for guild owners to nuke / delete / remove everything in their guild!**',
                `\n**_For best results, move the ${bot_config.COMMON_NAME} role to the top of the roles list!_**`,
                '\n**Do you want to remove everything in your guild?**',
                'If you say **yes**, all (roles, channels, members, etc) in this guild will be nuked.',
                'If you say **no**, then nothing will be touched.',
            ].join('\n'),
        }, message);
        const yes_callback = async () => {
            const confirmation_timestamp = `${Date.now()}`.slice(7);

            const captcha_code = (new Buffer.from(confirmation_timestamp)).toString('base64');
            const captcha_code_bot_message = await message.channel.send(new CustomRichEmbed({
                color: 0xFF00FF,
                title: 'You must send the CAPTCHA below to continue!',
                description: [
                    'By sending the captcha code below, you accept all responsibility for this guild being nuked!',
                    `${'```'}\n${captcha_code}\n${'```'}`,
                ].join('\n'),
            }, message)).catch(console.warn);

            const message_collection_filter = (collected_message) => collected_message.author.id === message.author.id && collected_message.cleanContent === captcha_code;
            const message_collector = captcha_code_bot_message.channel.createMessageCollector(message_collection_filter, { max: 1, time: 60_000 });
            message_collector.on('collect', async () => {
                await message.reply('The captcha code was recognized!');
                await Timer(5_000);
                nuke_guild(message, message.guild);
            });
        };
        const no_callback = () => {};
        sendConfirmationMessage(message.author.id, message.channel.id, true, confirmation_embed, yes_callback, no_callback);
    },
});
