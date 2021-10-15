"use strict";
const { parse, serialize } = require("../utils/json");
var escape = require("escape-html");
const escapeHTML = require("escape-html");

const jsonDbPath = __dirname + "/../data/pizzas.json";

// Default pizza menu
const defaultPizzas = [
  {
    id: 1,
    title: "4 fromages",
    content: "Gruyère, Sérac, Appenzel, Gorgonzola, Tomates",
  },
  {
    id: 2,
    title: "Vegan",
    content: "Tomates, Courgettes, Oignons, Aubergines, Poivrons",
  },
  {
    id: 3,
    title: "Vegetarian",
    content: "Mozarella, Tomates, Oignons, Poivrons, Champignons, Olives",
  },
  {
    id: 4,
    title: "Alpage",
    content: "Gruyère, Mozarella, Lardons, Tomates",
  },
  {
    id: 5,
    title: "Diable",
    content: "Tomates, Mozarella, Chorizo piquant, Jalapenos",
  },
];

class Pizzas {
  constructor(dbPath = jsonDbPath, defaultItems = defaultPizzas) {
    this.jsonDbPath = dbPath;
    this.defaultPizzas = defaultItems;
  }

  getNextId() {
    const pizzas = parse(this.jsonDbPath, this.defaultPizzas);
    let nextId;
    if (pizzas.length === 0) nextId = 1;
    else nextId = pizzas[pizzas.length - 1].id + 1;

    return nextId;
  }

  /**
   * Returns all pizzas
   * @param {Object} configuration - if configuration.order exists and its value is :
   *  - "title" : order by title : ascending (case insensitive)
   *  - "-title" : order by title : descending (case insensitive)
   * @returns {Array} Array of pizzas
   */
  getAll(configuration) {
    const pizzas = parse(this.jsonDbPath, this.defaultPizzas);
    // order the array if needed
    if (pizzas.length >= 2 && configuration && configuration.order) {
      switch (configuration.order) {
        case "title":
          pizzas.sort((el1, el2) =>
            el1.title.toLowerCase().localeCompare(el2.title.toLowerCase())
          );
          break;

        case "-title":
          pizzas.sort((el1, el2) =>
            el2.title.toLowerCase().localeCompare(el1.title.toLowerCase())
          );
          break;
      }
    }

    return pizzas;
  }

  /**
   * Returns the pizza identified by id
   * @param {number} id - id of the pizza to find
   * @returns {object} the pizza found or undefined if the id does not lead to a pizza
   */
  getOne(id) {
    const pizzas = parse(this.jsonDbPath, this.defaultPizzas);
    const foundIndex = pizzas.findIndex((pizza) => pizza.id == id);
    if (foundIndex < 0) return;

    return pizzas[foundIndex];
  }

  /**
   * Add a pizza in the DB and returns the added pizza (containing a new id)
   * @param {object} body - it contains all required data to create a pizza
   * @returns {object} the pizza that was created (with id)
   */

  addOne(body) {
    const pizzas = parse(this.jsonDbPath, this.defaultPizzas);

    // add new pizza to the menu : escape the title & content in order to protect agains XSS attacks
    const newPizza = {
      id: this.getNextId(),
      title: escape(body.title),
      content: escape(body.content),
    };
    pizzas.push(newPizza);
    serialize(this.jsonDbPath, pizzas);
    return newPizza;
  }

  /**
   * Delete a pizza in the DB and return the deleted pizza
   * @param {number} id - id of the pizza to be deleted
   * @returns {object} the pizza that was deleted or undefined if the delete operation failed
   */
  deleteOne(id) {
    const pizzas = parse(this.jsonDbPath, this.defaultPizzas);
    const foundIndex = pizzas.findIndex((pizza) => pizza.id == id);
    if (foundIndex < 0) return;
    const itemRemoved = pizzas.splice(foundIndex, 1);
    serialize(this.jsonDbPath, pizzas);

    return itemRemoved[0];
  }

  /**
   * Update a pizza in the DB and return the updated pizza
   * @param {number} id - id of the pizza to be updated
   * @param {object} body - it contains all the data to be updated
   * @returns {object} the updated pizza or undefined if the update operation failed
   */
  updateOne(id, body) {
    const pizzas = parse(this.jsonDbPath, this.defaultPizzas);
    const foundIndex = pizzas.findIndex((pizza) => pizza.id == id);
    if (foundIndex < 0) return;
    // create a new object based on the existing pizza
    // Escape all dangerous potential new chars
    const updatedPizza = { ...pizzas[foundIndex] };
    for (const key in body) {
      if (Object.hasOwnProperty.call(body, key)) {
        const element = body[key];
        updatedPizza[key] = escape(element);
      }
    }

    // replace the pizza found at index : (or use splice)
    pizzas[foundIndex] = updatedPizza;

    serialize(this.jsonDbPath, pizzas);
    return updatedPizza;
  }
}

module.exports = { Pizzas };
