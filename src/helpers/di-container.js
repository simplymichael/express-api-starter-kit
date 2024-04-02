const diContainer = require("../di-container");

module.exports = {
  makeObjectADIContainer,
};


function makeObjectADIContainer(obj) {
  if(!("resolve" in obj)) {
    obj.resolve = diContainer.resolve.bind(diContainer);
  }
}
