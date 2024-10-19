const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

function list(req, res) {
  res.json({ data: orders });
}

function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }

  next({
    status: 404,
    message: `Order id not found: ${req.params.orderId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}
function onlyKillPending(req, res, next) {
  const foundOrder = res.locals.order;
  if (foundOrder.status !== "pending")
    next({
      status: 400,
      message: `This order must be pending: ${req.params.orderId}`,
    });
  else return next();
}

function destroy(req, res) {
  const orderId = req.params.orderId;

  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

function update(req, res) {
  const foundOrder = res.locals.order;
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  // Update the paste
  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.dishes = dishes;

  res.json({ data: foundOrder });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const newOrder = {
    deliverTo,
    mobileNumber,
    dishes,
    id: nextId(),
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function createValidation(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  if (!deliverTo) {
    next(failReqObj("deliverTo"));
  }

  if (!mobileNumber) {
    next(failReqObj("mobileNumber"));
  }

  if (!dishes) {
    next(failReqObj("dishes"));
  }

  if (dishes.length <= 0) {
    next(failReqObj("at least one dish"));
  }

  if (!Array.isArray(dishes)) {
    next(failReqObj("dishes be an array"));
  }

  for (var i = 0; i < dishes.length; i++) {
    if (
      !dishes[i].quantity ||
      !dishes[i].quantity > 0 ||
      !Number.isInteger(dishes[i].quantity)
    ) {
      next(
        failReqObj(
          "dish must have an type quantity greater than zero at index: " + i
        )
      );
    }
  }

  return next();
}

function matchOrderId(req, res, next) {
  const { orderId } = req.params;
  const { data: { name, description, price, image_url, id } = {} } = req.body;
  if (id !== orderId) {
    if (!id) return next();
    next({
      status: 400,
      message: `Order id does not match: ${id}`,
    });
  } else return next();
}
function failReqObj(requiredText) {
  return {
    status: 400,
    message: `This order must have ${requiredText}`,
  };
}

function checkStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (!status) {
    next(failReqObj(" a status thats not missing"));
  }

  if (
    status !== ("pending" || "preparing" || "out-for-delivery" || "delivered")
  ) {
    next(failReqObj(" a status thats not invalid"));
  }

  return next();
}

// TODO: Implement the /orders handlers needed to make the tests pass
module.exports = {
  read: [orderExists, read],
  list,
  delete: [orderExists, onlyKillPending, destroy],
  create: [createValidation, create],
  update: [checkStatus, orderExists, matchOrderId, createValidation, update],
};
