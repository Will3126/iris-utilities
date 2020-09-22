'use strict';

const { client } = require('../../libs/bot.js');

//---------------------------------------------------------------------------------------------------------------//

module.exports = {
    event_name: 'error',
    async callback(error) {
        if (client.$.restarting_bot) return;

        console.error(`----------------------------------------------------------------------------------------------------------------`);
        console.trace(`client#error:`, error);
        console.error(`----------------------------------------------------------------------------------------------------------------`);
    }
};