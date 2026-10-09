import { ApiError } from "./client";
import { OUR_DISHES, isBeef, toMenuItem } from "../data/menu";

/* The menu combines our own dishes with dishes from the DummyJSON API */

const RECIPES_URL = "https://dummyjson.com/recipes";

// Small helper for the external menu API
async function fetchJson(url) {
  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new ApiError("Could not load the menu. Please check your internet connection.", 0);
  }

  if (!response.ok) {
    const notFound = response.status === 404 || response.status === 400;
    throw new ApiError(
      notFound ? "Sorry, we couldn't find this dish." : "Could not load the menu.",
      response.status
    );
  }

  return response.json();
}

// The full menu: our dishes first, then the API dishes (without beef)
export async function fetchMenu() {
  const data = await fetchJson(`${RECIPES_URL}?limit=0`);
  const apiDishes = data.recipes.filter((recipe) => !isBeef(recipe)).map(toMenuItem);
  return [...OUR_DISHES, ...apiDishes];
}

// One dish: check our own dishes first, then ask the API
export async function fetchDish(id) {
  const ourDish = OUR_DISHES.find((dish) => dish.id === Number(id));
  if (ourDish) return ourDish;

  const recipe = await fetchJson(`${RECIPES_URL}/${id}`);

  if (isBeef(recipe)) {
    throw new ApiError("Sorry, we couldn't find this dish.", 404);
  }

  return toMenuItem(recipe);
}