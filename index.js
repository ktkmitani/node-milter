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

module.exports.SMFIF_ADDHDRS = require('./lib/constants').SMFIF.ADDHDRS;
module.exports.SMFIF_CHGHDRS = require('./lib/constants').SMFIF.CHGHDRS;
module.exports.SMFIF_CHGBODY = require('./lib/constants').SMFIF.CHGBODY;
module.exports.SMFIF_ADDRCPT = require('./lib/constants').SMFIF.ADDRCPT;
module.exports.SMFIF_ADDRCPT_PAR = require('./lib/constants').SMFIF.ADDRCPT_PAR;
module.exports.SMFIF_DELRCPT = require('./lib/constants').SMFIF.DELRCPT;
module.exports.SMFIF_QUARANTINE = require('./lib/constants').SMFIF.QUARANTINE;
module.exports.SMFIF_CHGFROM = require('./lib/constants').SMFIF.CHGFROM;
module.exports.SMFIF_SETSYMLIST = require('./lib/constants').SMFIF.SETSYMLIST;

module.exports.SMFIP_NOCONNECT = require('./lib/constants').SMFIP.NOCONNECT;
module.exports.SMFIP_NOHELO = require('./lib/constants').SMFIP.NOHELO;
module.exports.SMFIP_NOMAIL = require('./lib/constants').SMFIP.NOMAIL;
module.exports.SMFIP_NORCPT = require('./lib/constants').SMFIP.NORCPT;
module.exports.SMFIP_NOBODY = require('./lib/constants').SMFIP.NOBODY;
module.exports.SMFIP_NOHDRS = require('./lib/constants').SMFIP.NOHDRS;
module.exports.SMFIP_NOEOH = require('./lib/constants').SMFIP.NOEOH;
module.exports.SMFIP_NOUNKNOWN = require('./lib/constants').SMFIP.NOUNKNOWN;
module.exports.SMFIP_NODATA = require('./lib/constants').SMFIP.NODATA;
module.exports.SMFIP_SKIP = require('./lib/constants').SMFIP.SKIP;
module.exports.SMFIP_RCPT_REJ = require('./lib/constants').SMFIP.RCPT_REJ;
module.exports.SMFIP_NR_CONN = require('./lib/constants').SMFIP.NR_CONN;
module.exports.SMFIP_NR_HELO = require('./lib/constants').SMFIP.NR_HELO;
module.exports.SMFIP_NR_MAIL = require('./lib/constants').SMFIP.NR_MAIL;
module.exports.SMFIP_NR_RCPT = require('./lib/constants').SMFIP.NR_RCPT;
module.exports.SMFIP_NR_DATA = require('./lib/constants').SMFIP.NR_DATA;
module.exports.SMFIP_NR_UNKN = require('./lib/constants').SMFIP.NR_UNKN;
module.exports.SMFIP_NR_EOH = require('./lib/constants').SMFIP.NR_EOH;
module.exports.SMFIP_NR_BODY = require('./lib/constants').SMFIP.NR_BODY;
module.exports.SMFIP_NR_HDR = require('./lib/constants').SMFIP.NR_HDR;
module.exports.SMFIP_HDR_LEADSPC = require('./lib/constants').SMFIP.HDR_LEADSPC;

module.exports.SMFIM_CONNECT = require('./lib/constants').SMFIM.CONNECT;
module.exports.SMFIM_HELO = require('./lib/constants').SMFIM.HELO;
module.exports.SMFIM_ENVFROM = require('./lib/constants').SMFIM.ENVFROM;
module.exports.SMFIM_ENVRCPT = require('./lib/constants').SMFIM.ENVRCPT;
module.exports.SMFIM_DATA = require('./lib/constants').SMFIM.DATA;
module.exports.SMFIM_EOM = require('./lib/constants').SMFIM.EOM;
module.exports.SMFIM_EOH = require('./lib/constants').SMFIM.EOH;
