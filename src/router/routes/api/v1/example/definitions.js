const ExampleController = require("../../../../../controllers/example-controller");


module.exports = {
  create: {
    method     : "POST",
    path       : "/",
    parameters : [],
    middleware : [],
    controller : ExampleController.create,
    description: "Create a new item"
  },
  get: {
    method     : "GET",
    path       : "/items",
    parameters : [":itemId"],
    middleware : [],
    controller : ExampleController.get,
    description: "Fetch details of a single item"
  },
  list: {
    method     : "GET",
    path       : "/",
    parameters : [],
    middleware : [],
    controller : ExampleController.list,
    description: "Fetch list of items"
  },
  update: {
    method     : "PUT",
    path       : "/items",
    parameters : [":itemId"],
    middleware : [],
    controller : ExampleController.update,
    description: "Update item details"
  },
  delete: {
    method     : "DELETE",
    path       : "/items",
    parameters : [":itemId"],
    middleware : [],
    controller : ExampleController.delete,
    description: "Delete item from the data store"
  }
};
