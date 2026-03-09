/**
 * This example uses the Distribution build of Calcite Components.
 * Refer to the documentation if switching to the Custom Elements build:
 * https://developers.arcgis.com/calcite-design-system/get-started/#choose-a-build
 **/
import { defineCustomElements } from "@esri/calcite-components/dist/loader";

import { queryFeatures } from "@esri/arcgis-rest-feature-service";

// Load calcite components
defineCustomElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/5.0/assets",
});

const container = document.querySelector(".card-container");

const featureServiceUrl =
  "https://www.portlandmaps.com/od/rest/services/COP_OpenData_ImportantPlaces/MapServer/188";

// Wait until page content has loaded: https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
document.addEventListener("DOMContentLoaded", async (event) => {
  // Query, process, and display our layer data with a promise chain - will it work?
  // const features = queryFeatures({
  //   url: featureServiceUrl,
  //   where: "Status = 'Active'",
  //   returnGeometry: false,
  // })
  //   .then((data) => {
  //     return normalizeFeatureData(data);
  //   })
  //   .then((data) => {
  //     console.log("Data inside queryFeatures promise chain", data);
  //     container.replaceChildren("");
  //     data.forEach((feature) => {
  //       displayCard(feature);
  //     });
  //     return data;
  //   });

  // Query, process, and display our layer data with async/await
  // ArcGIS REST JS: https://developers.arcgis.com/arcgis-rest-js/api-reference/arcgis-rest-feature-service/queryFeatures/
  // JS Maps SDK: https://developers.arcgis.com/javascript/latest/references/core/layers/FeatureLayer/#queryFeatures
  const featureSet = await queryFeatures({
    url: featureServiceUrl,
    where: "Status = 'Active'",
    returnGeometry: false,
  });

  const features = normalizeFeatureData(featureSet);

  features.forEach((feature) => {
    displayCard(feature);
  });

  document.addEventListener("calciteChipGroupSelect", (event) => {
    container.replaceChildren("");

    console.log(`Data inside ${event.type} event listener`, features);

    /* Map the selected elements from event.target to an array of the element values */
    const productFilter = event.target.selectedItems.map(
      (selected) => selected.value,
    );

    /* Use forEach instead of map to iterate over the features this time */
    features.forEach((feature) => {
      const isMatch =
        feature.products.filter((product) =>
          productFilter.includes(product.replace(" ", "_")),
        ).length === productFilter.length;
      if (isMatch) {
        displayCard(feature);
      }
    });
  });
});

function displayCard(site) {
  if (!container) {
    return;
  }
  const { farm, address, description, website, email, products } = site;
  const card = `<article class="farm">
  <header>
    <h6>${farm}</h6>
    <p>${address}</p>
  </header>
  <ul class="products">${getChips(products)}</ul>
  <p class="description">${description}</p>
  <footer>
    <a href=${website} target="_blank" label="Visit ${farm} website"><calcite-icon icon="web" scale="m" /></a>
    <a href="mailto:${email}" label="Contact ${farm}"><calcite-icon icon="envelope" scale="m" /></a>
  </footer>
</article>
`;
  const cardElement = document.createRange().createContextualFragment(card);
  container.appendChild(cardElement);
}

export function getChips(products) {
  const chips = products.map((product) => {
    const content = CATEGORY_MAP[product].emoji;
    return content ? `<li>${content}</li>` : "";
  });
  return chips.join("");
}

export function categorizeProducts(productString) {
  const categories = Object.keys(CATEGORY_MAP);
  // Trim any leading or trailing white space and lowercase strings before splitting into an array
  const remapped = productString
    .trim()
    .toLowerCase()
    .split(", ")
    .map((product) => {
      if (categories.includes(product)) {
        return product;
      }
      // Iterate through categories and their products to find the correct category
      for (const category in CATEGORY_MAP) {
        if (CATEGORY_MAP[category].products.includes(product)) {
          return category;
        }
      }
    });
  // Return the grouped products but first filter out any undefined or duplicate values
  return remapped.filter(
    (category, index) => category && remapped.indexOf(category) === index,
  );
}

export const CATEGORY_MAP = {
  vegetables: {
    products: ["winter vegetables", "vegggies", "organic vegetables"],
    emoji: "🥕",
  },
  fruit: { products: ["tree fruit"], emoji: "🍉" },
  berries: { products: [], emoji: "🫐" },
  mushrooms: { products: [], emoji: "🍄" },
  eggs: { products: [], emoji: "🥚" },
  dairy: { products: ["raw milk", "milk"], emoji: "🥛" },
  meat: { products: [], emoji: "🥩" },
  fish: {
    products: ["fish (tuna)", "fish (salmon)", "wild sockeye salmon"],
    emoji: "🐟",
  },
  honey: { products: [], emoji: "🐝" },
  herbs: { products: [], emoji: "🪴" },
  flowers: { products: [], emoji: "🌻" },
  plant_starts: { products: ["plant starts", "plants"], emoji: "🌱" },
  bread: { products: [], emoji: "🍞" },
  chicken: { products: [], emoji: "🐓" },
  pork: { products: [], emoji: "🐖" },
};

// Maps feature service attributes to simpler data object and converts products to array
export function normalizeFeatureData(layer) {
  return layer.features.map((feature) => {
    return {
      farm: feature.attributes["Farm_Name"],
      description: feature.attributes["FarmDescript"],
      address: feature.attributes["Location"],
      products: categorizeProducts(feature.attributes["Main_Products"]),
      website: feature.attributes["Website"],
      email: feature.attributes["email"],
    };
  });
}
