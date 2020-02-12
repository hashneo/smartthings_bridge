'use strict';

const SwaggerExpress = require('swagger-express-mw');
const SwaggerUi = require('swagger-tools/middleware/swagger-ui');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const nconf = require('nconf');

const uuid = require('uuid');

const consul = require('consul')( {
    host: process.env.CONSUL || '127.0.0.1',
    promisify: true
});

let moduleName = 'st-bridge';
global.moduleName = moduleName;

app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser());

let appConfig = {
    appRoot: __dirname, // required config
    swaggerSecurityHandlers: {
        Oauth: (req, authOrSecDef, scopesOrApiKey, cb) => {
            if (scopesOrApiKey === 'open') {
                cb();
            }else {
                cb();
            }
        }
    }
};

nconf.file({ file: './config.json' });

global.config = nconf;
global.config.save();

SwaggerExpress.create(appConfig, function (err, swaggerExpress) {
    if (err) {
        throw err;
    }

    app.use(SwaggerUi(swaggerExpress.runner.swagger));
    // install middleware
    swaggerExpress.register(app);

    let port = process.env.LPORT || undefined;
    let server = app.listen(port, () => {

        let host = process.env.HOST || process.env.SERVICE_NAME || require('ip').address();
        let port = server.address().port;

        if (swaggerExpress.runner.swagger.paths['/health']) {
            console.log(`you can get /health on port ${port}`);
        }
        global.modules = {};
        global.modules['adcp'] = require('./adcp.js')(global.config.get('adcp'));
    });

});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    process.exit(1);
});

module.exports = app;