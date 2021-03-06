'use strict';

//#region local dependencies
const axios = require('axios');

const HtmlEntitiesParser = require('html-entities').AllHtmlEntities;
const htmlEntitiesParser = new HtmlEntitiesParser();

const { CustomRichEmbed } = require('../../libs/CustomRichEmbed.js');
const { sendConfirmationMessage } = require('../../libs/messages.js');
const { DisBotCommand,
        DisBotCommander } = require('../../libs/DisBotCommander.js');
//#endregion local dependencies

module.exports = new DisBotCommand({
    name: 'WOULDYOU',
    category: `${DisBotCommander.categories.FUN}`,
    description: 'Would you accept that ___ however ___?',
    aliases: ['wouldyou', 'willyou'],
    access_level: DisBotCommand.access_levels.GLOBAL_USER,
    async executor(Discord, client, message, opts={}) {
        const api_response = await axios.post(`https://api2.willyoupressthebutton.com/api/v2/dilemma/`);
        const response_data = api_response.data;

        console.log({response_data});

        const dilemma_id = response_data.dilemma.id;
        const dilemma_situation = htmlEntitiesParser.decode(response_data.dilemma.txt1);
        const dilemma_catch = htmlEntitiesParser.decode(response_data.dilemma.txt2);
        const dilemma_yay_count = response_data.dilemma.yes;
        const dilemma_nay_count = response_data.dilemma.no;
        // const dilemma_confirmed = response_data.dilemma.confirmed; // has unknown usage

        const dilemma_yay_nay_total = dilemma_yay_count + dilemma_nay_count;
        const dilemma_yay_percent = Math.round(dilemma_yay_count / dilemma_yay_nay_total * 100);
        const dilemma_nay_percent = Math.round(dilemma_nay_count / dilemma_yay_nay_total * 100);

        const embed = new CustomRichEmbed({
            title: `Would you? (#${dilemma_id})`,
            description: `**Would you accept that:**\n${dilemma_situation}\n**However:**\n${dilemma_catch}?`,
        }, message);

        function showResults() {
            message.channel.send(new CustomRichEmbed({
                title: `Would you? (#${dilemma_id})`,
                description: `**Would you accept that:**\n${dilemma_situation}\n**However:**\n${dilemma_catch}?`,
                fields: [
                    {
                        name: '\u200b',
                        value: '\u200b',
                    }, {
                        name: 'Dilemma Situation Score',
                        value: `${dilemma_yay_count} (${dilemma_yay_percent}%) people said yay!`,
                    }, {
                        name: 'Dilemma Catch Score',
                        value: `${dilemma_nay_count} (${dilemma_nay_percent}%) people said nay!`,
                    },
                ],
            }, message));
        }

        sendConfirmationMessage(message.author.id, message.channel.id, true, embed, showResults, showResults);
    },
});
