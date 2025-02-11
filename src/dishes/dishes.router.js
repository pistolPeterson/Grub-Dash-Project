const router = require("express").Router();
const dishController = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
// TODO: Implement the /dishes routes needed to make the tests pass

router
  .route("/:dishId")
  .get(dishController.read)
  .put(dishController.update)
  .all(methodNotAllowed);

router
  .route("/")
  .post(dishController.create)
  .get(dishController.list)
  .all(methodNotAllowed);
module.exports = router;
