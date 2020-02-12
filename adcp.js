'use strict';

function ADCP(config) {

    if (!(this instanceof ADCP)) {
        return new ADCP(config);
    }

    let Telnet = require('telnet-client');
    let connection = new Telnet();

// these parameters are just examples and most probably won't work for your use-case.
    let params = {
        host: config.server,
        port: config.port,
        shellPrompt: 'NOKEY', // or negotiationMandatory: false
        debug: true,
        ors: '\r\n',
        execTimeout: 2000
        //timeout: 1500,
        // removeEcho: 4
    };

    connection.on('ready', function (prompt) {
    });

    connection.on('timeout', function () {
        console.log('socket timeout!');
        //connection.end()
    });

    connection.on('close', function () {
        console.log('connection closed')
    });

    connection.connect(params);

    function exec(cmd){
        return new Promise( (fulfill, reject) => {
            connection.send(`${cmd}`, function (err, response) {

                if (err)
                    return reject(err);

                response = response.replace('\r\n', '');

                fulfill(JSON.parse(response));
            })
        });
    }

    this.power_status = () => {
        return exec(`power_status ?`);
    };

    return this;
}

module.exports = ADCP;