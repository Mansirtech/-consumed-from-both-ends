### Groundwater Analysis Methodology

To understand the water dynamics hidden beneath the arid landscape, our investigation analyzed data from NASA's Gravity Recovery and Climate Experiment (GRACE) mission. Operating from 2003 to 2017, these satellites measured minute shifts in Earth's gravity field to track changes in deep underground water storage.

The data revealed a counterintuitive trend: across much of the Sahel, from Zinder in Niger to northern Borno and the Diffa region, groundwater levels showed a notable increase. However, this regional recovery had a stark exception. In the Yusufari region of Yobe State, the data showed a flat line—a dead pulse indicating that this specific area was uniquely disconnected from the groundwater recharge observed elsewhere over the same period.

```javascript
// Example GRACE Analysis Code 

// Load GRACE mass change data
var graceCollection = ee.ImageCollection('NASA/GRACE/MASS_CHANGES')
  .select('mass'); // select the mass band representing groundwater storage changes

// Define date range for analysis
var startDate = ee.Date('2002-01-01');
var endDate = ee.Date('2017-12-31');

// Filter the collection by date
var graceFiltered = graceCollection.filterDate(startDate, endDate);

// Calculate the mean mass change over the period
var meanGRACE = graceFiltered.mean();

// Define visualization parameters
var visParams = {
  min: -20,  // adjust these values based on the dataset's range
  max: 20,
  palette: ['blue', 'white', 'red']
};

// Center the map and add the layer
Map.centerObject(meanGRACE, 2);
Map.addLayer(meanGRACE, visParams, 'Mean GRACE Mass Change');

// Optionally, export the resulting image to Google Drive
Export.image.toDrive({
  image: meanGRACE,
  description: 'GRACE_Mean_Mass_Change',
  scale: 50000,
  region: meanGRACE.geometry(),
  maxPixels: 1e9
});
```
