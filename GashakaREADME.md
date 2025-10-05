# Project 2: Timber Logging and Habitat Loss in Gashaka-Gumti National Park

## Investigative Focus
To map and quantify deforestation driven by a reported timber logging boom in and around the Gashaka-Gumti National Park (2005-2023), and to estimate the resulting impact on the habitat of the critically endangered Nigeria-Cameroon chimpanzee.

## Methodology
This investigation focused on a detailed land cover classification to understand the dynamics of logging and its secondary impacts.

1.  **Area Definition:** The official boundary of the Gashaka-Gumti National Park was sourced from the WDPA.
2.  **Dry Season Compositing:** To ensure high-quality, cloud-free data, all annual analyses were conducted on composite images created from Landsat data sourced exclusively from the regional dry season (November - March). All Landsat data was scientifically corrected to surface reflectance values before analysis.
3.  **Land Cover Classification:** The landscape was classified into three distinct categories: "Dense Forest," "Sparse Vegetation/Farmland," and "Bare/Cleared Land." This classification was performed for the years 2010, 2015, 2020, and 2023.
4.  **Quantitative Analysis:** The total area in square kilometers for each land cover class was calculated for each analysis year and exported as a CSV file to quantify the trends.
5.  **Wildlife Impact Assessment:** The loss of "Dense Forest" habitat was correlated with scientific estimates of the population density of the Nigeria-Cameroon chimpanzee to model the loss of the park's carrying capacity.
6.  **Field Site Integration:** GPS coordinates from field reports were added as a map layer for context.

## Scripts
* `analysis_and_export.js`: This script performs the interactive land cover analysis, displays all layers on the map, and creates the export task for the final statistics CSV file.

## Data
* `GGNP_LandCover_Statistics_2023.csv`: Contains four columns: `year`, `forest_sqkm`, `sparse_veg_farmland_sqkm`, and `bare_cleared_land_sqkm`.

## Data Sources
* **Satellite Imagery:** Landsat 5, 7, & 8 Surface Reflectance (USGS)
* **Protected Area Boundary:** World Database on Protected Areas (WDPA)
* **Chimpanzee Density Estimates:** Regional Action Plan for the Conservation of the Nigeria-Cameroon Chimpanzee (IUCN)
