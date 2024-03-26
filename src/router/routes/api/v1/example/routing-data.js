const ExampleController = require("../../../../../controllers/example-controller");


module.exports = {
  listItems: {
    method     : "GET",
    path       : "/",
    parameters : [],
    middleware : [],
    controller : ExampleController.list,
    description: "Fetch list of items"
  },
  getItemData: {
    method     : "GET",
    path       : "/items",
    parameters : [":itemId"],
    middleware : [],
    controller : ExampleController.getItem,
    description: "Fetch details of a single item"
  },
  searchItems: {
    method     : "GET",
    path       : "/search",
    parameters : [],
    middleware : [],
    controller : ExampleController.search,
    description: "Search for items by name, location, etc"
  },
  updateItem: {
    method     : "PUT",
    path       : "/items",
    parameters : [":itemId"],
    middleware : [],
    controller : ExampleController.update,
    description: "Update item details"
  },
  deleteItem: {
    method     : "DELETE",
    path       : "/items",
    parameters : [":itemId"],
    middleware : [],
    controller : ExampleController.delete,
    description: "Delete item from the data store"
  }
};
