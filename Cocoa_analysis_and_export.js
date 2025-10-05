
// =====================================================================================
// === Cross River Land Cover Analysis - For GIF Frames ===
// =====================================================================================

// --- 1. DEFINE STUDY AREA AND PARAMETERS ---
var parkName = 'Cross River';
var baselineYear = 2000;
var analysisYears = [2005, 2010, 2015, 2023];

var denseForestThreshold = 0.6;
var sparseVegThreshold = 0.3;

// --- 2. SETUP AND DATA PREPARATION ---
var parkBoundary = ee.FeatureCollection('WCMC/WDPA/current/polygons')
    .filter(ee.Filter.stringContains('NAME', parkName)).first().geometry();
Map.centerObject(parkBoundary, 9);
Map.addLayer(parkBoundary, {color: '000000'}, 'Cross River NP Boundary');

function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var qaBand = image.select('QA_PIXEL');
  return image.addBands(opticalBands, null, true).addBands(qaBand);
}
var cloudMask = function(image) { return image.updateMask(image.select('QA_PIXEL').bitwiseAnd(2).neq(0)); };

var l5_raw = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2');
var l7_raw = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2');
var l8_raw = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2');
var mergedCollection_scaled = ee.ImageCollection(l5_raw.merge(l7_raw).merge(l8_raw)).map(applyScaleFactors);
var oldBands = ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7', 'QA_PIXEL'];
var newBands = ['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'QA_PIXEL'];
var mergedCollection_renamed = mergedCollection_scaled.select(oldBands, newBands);
var mergedCollection = mergedCollection_renamed.filterBounds(parkBoundary).map(cloudMask);
var addNDVI = function(image) { return image.addBands(image.normalizedDifference(['nir', 'red']).rename('ndvi')); };

var baselineComposite = mergedCollection.filterDate(baselineYear+'-01-01', baselineYear+'-12-31').median().clip(parkBoundary);
var baselineNDVI = addNDVI(baselineComposite).select('ndvi');
var baselineForestMask = baselineNDVI.gte(denseForestThreshold);

// --- 3. CREATE AND EXPORT AN IMAGE FRAME FOR EACH YEAR ---
var palette = ['1A5276', 'F39C12', 'C70039'];

analysisYears.forEach(function(year) {
  var yearNumber = ee.Number(year);
  var startDate = ee.Date.fromYMD(yearNumber.subtract(1), 11, 1);
  var endDate = ee.Date.fromYMD(yearNumber, 3, 31);
  var yearComposite = mergedCollection.filterDate(startDate, endDate).median();
  var yearNDVI = addNDVI(yearComposite).select('ndvi');

  var stableForest = baselineForestMask.and(yearNDVI.gte(denseForestThreshold));
  var degradedOrFarm = baselineForestMask.and(yearNDVI.gte(sparseVegThreshold)).and(yearNDVI.lt(denseForestThreshold));
  var clearedLand = baselineForestMask.and(yearNDVI.lt(sparseVegThreshold));

  var classifiedImage = ee.Image(0)
      .where(stableForest, 1).where(degradedOrFarm, 2).where(clearedLand, 3)
      .updateMask(baselineForestMask);
      
  var finalImage = classifiedImage.visualize({min: 1, max: 3, palette: palette}).clip(parkBoundary);
  Map.addLayer(finalImage, {}, 'Classified Land Cover - ' + year, true);

  Export.image.toDrive({
    image: finalImage,
    description: 'CrossRiver_Frame_' + year,
    folder: 'CrossRiver_Frames',
    fileNamePrefix: 'CrossRiver_Frame_' + year,
    region: parkBoundary,
    scale: 90,
    maxPixels: 1e12
  });
});

print('Export tasks created');
