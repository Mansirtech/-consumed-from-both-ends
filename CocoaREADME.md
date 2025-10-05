# Project 1: Cocoa Farming and Deforestation in Cross River National Park

## Investigative Focus
To analyze the extent to which protected forests in Cross River National Park have been converted for cocoa cultivation and other farming activities over the past two decades (2000-2023).

## Methodology
The analysis was conducted using a multi-step approach within the Google Earth Engine platform.

1. **Area Definition:** The official boundary of the Cross River National Park was sourced from the World Database on Protected Areas (WDPA).
2. **Land Cover Classification:** A time-series of cloud-free annual composite images was generated from the Landsat 5, 7, and 8 archives. Using a baseline forest mask from the year 2000, the landscape in subsequent years (2005, 2010, 2015, 2023) was classified into three categories: "Dense Forest," "Degraded Forest/Farmland," and "Bare/Cleared Land." 
3. **Data Export:** The script generates individual image files for each analysis year, suitable for creating a GIF or for analysis in GIS software. The color-coded images are clipped to the park boundary with a transparent background.

## Scripts

* `analysis_and_export.js`: This single script performs the full land cover classification and creates the export tasks for each year's map.

## Data Sources

* **Satellite Imagery:** Landsat 5, 7, & 8 Surface Reflectance (USGS)
* **Protected Area Boundary:** World Database on Protected Areas (WDPA)
