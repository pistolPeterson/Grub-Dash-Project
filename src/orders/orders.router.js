const router = require("express").Router();
const orderController = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
// TODO: Implement the /orders routes needed to make the tests pass
router
  .route("/:orderId")
  .get(orderController.read)
  .delete(orderController.delete)
  .put(orderController.update)
  .all(methodNotAllowed);
router
  .route("/")
  .get(orderController.list)
  .post(orderController.create)
  .all(methodNotAllowed);

module.exports = router;
