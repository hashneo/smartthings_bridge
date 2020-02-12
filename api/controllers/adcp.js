'use strict';

module.exports.getPowerStatus = (req, res) => {
    global.modules.adcp.power_status()
        .then( (devices) => {
            res.json( { data: devices, result : 'ok'  } );
        })
        .catch( (err) => {
            res.status(500).json( { code: err.code || 0, message: err.message } );
        });
};
