var expect = require('chai').expect;
var Context = require('../lib/context').Context;

describe('Context', function() {
	it('construnctor', function() {
		var ctx1 = new Context({});
		expect(ctx1).to.be.an.instanceof(Context);

		var ctx2 = Context({});
		expect(ctx2).to.be.an.instanceof(Context);
	});
});
