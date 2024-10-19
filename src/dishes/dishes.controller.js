const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }

    next({ status: 400, message: `Must include a ${propertyName}` });
  };
}

function checkPrice(req, res, next) {
  const {
    data: { price },
  } = req.body;

  if (typeof price !== "number")
    next({ status: 400, message: `must be a real price` });

  if (price <= 0) next({ status: 400, message: `must have a real price` });
  else return next();
}

function create(req, res) {
  const {
    data: { name, description, price, image_url },
  } = req.body;

  const newDish = {
    id: nextId(),
    name: name,

    description: description,
    image_url: image_url,
    price: price,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function list(req, res) {
  res.json({ data: dishes });
}

function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }

  next({
    status: 404,
    message: `Dish id not found: ${req.params.dishId}`,
  });
}

function update(req, res) {
  const foundDish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;

  // Update the paste
  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;

  res.json({ data: foundDish });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function matchDishId(req, res, next) {
  const { dishId } = req.params;
  const { data: { name, description, price, image_url, id } = {} } = req.body;
  if (id !== dishId) {
    if (!id) return next();
    next({
      status: 400,
      message: `Dish id does not match: ${id}`,
    });
  } else return next();
}

// TODO: Implement the /dishes handlers needed to make the tests pass
module.exports = {
  update: [
    dishExists,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    matchDishId,
    checkPrice,
    update,
  ],
  read: [dishExists, read],
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    checkPrice,
    create,
  ],
  list,
};
