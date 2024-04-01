const providers = require("./bootstrap/providers");

module.exports = function setupServices() {
  for(let i = 0; i < providers.length; i++) {
    const Provider = providers[i];
    const provider = new Provider();
      
    provider.register();
  }
};
