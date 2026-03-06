/**
 * This example uses the Distribution build of Calcite Components.
 * Refer to the documentation if switching to the Custom Elements build:
 * https://developers.arcgis.com/calcite-design-system/get-started/#choose-a-build
 **/
import { defineCustomElements } from "@esri/calcite-components/dist/loader";

// Load calcite components
defineCustomElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/5.0/assets",
});

const navigationEl = document.getElementById("nav");
const sheetEl = document.getElementById("sheet");
const panelEl = document.getElementById("sheet-panel");

navigationEl.addEventListener("calciteNavigationActionSelect", () =>
  handleSheetOpen(),
);

panelEl.addEventListener("calcitePanelClose", () => handlePanelClose());

function handleSheetOpen() {
  sheetEl.open = true;
  panelEl.closed = false;
}

function handlePanelClose() {
  sheetEl.open = false;
}
