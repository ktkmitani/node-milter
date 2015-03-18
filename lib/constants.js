module.exports.SMFI_VERSION = 0x01000002;

module.exports.MI_SUCCESS = 0;
module.exports.MI_FAILURE = -1;

module.exports.SMFIS = {
	CONTINUE: 0,
	REJECT: 1,
	DISCARD: 2,
	ACCEPT: 3,
	TEMPFAIL: 4,
	NOREPLY: 7,
	SKIP: 8,
	ALL_OPTS: 10
};

module.exports.SMFIF = {
	NONE:			0x00000000,	/* no flags */
	ADDHDRS:		0x00000001,	/* filter may add headers */
	CHGBODY:		0x00000002,	/* filter may replace body */
	MODBODY:		0x00000002,	/* backwards compatible */
	ADDRCPT:		0x00000004,	/* filter may add recipients */
	DELRCPT:		0x00000008,	/* filter may delete recipients */
	CHGHDRS:		0x00000010,	/* filter may change/delete headers */
	QUARANTINE:		0x00000020,	/* filter may quarantine envelope */

	/* filter may change "from" (envelope sender) */
	CHGFROM:		0x00000040,
	ADDRCPT_PAR:	0x00000080,	/* add recipients incl. args */

	/* filter can send set of symbols (macros) that it wants */
	SETSYMLIST:		0x00000100
};
