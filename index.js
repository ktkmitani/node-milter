module.exports.createMilter = require('./lib/milter').createMilter;

module.exports.SMFI_VERSION = require('./lib/constants').SMFI_VERSION;

module.exports.MI_SUCCESS = require('./lib/constants').MI_SUCCESS;
module.exports.MI_FAILURE = require('./lib/constants').MI_FAILURE;

module.exports.SMFIS_CONTINUE = require('./lib/constants').SMFIS.CONTINUE;
module.exports.SMFIS_REJECT = require('./lib/constants').SMFIS.REJECT;
module.exports.SMFIS_DISCARD = require('./lib/constants').SMFIS.DISCARD;
module.exports.SMFIS_ACCEPT = require('./lib/constants').SMFIS.ACCEPT;
module.exports.SMFIS_TEMPFAIL = require('./lib/constants').SMFIS.TEMPFAIL;
module.exports.SMFIS_ALL_OPTS = require('./lib/constants').SMFIS.ALL_OPTS;
