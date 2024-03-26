/* eslint-env node, mocha */

const { runTest } = require("./_test-util");

describe("Basic test", function() {
  it("should return true", function() {
    runTest(function({ expect }) {
      expect(true).to.equal(true);
    });
  });
});
