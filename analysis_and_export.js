
// =====================================================================================
// === Final Script with 2023 Data & Dry Season Filtering ===
// =====================================================================================

// --- 1. DEFINE STUDY AREA AND PARAMETERS ---
var parkName = 'Gashaka-Gumti';
var baselineYear = 2005;
var analysisYears = [2010, 2015, 2020, 2023]; 

var denseForestThreshold = 0.6;
var sparseVegThreshold = 0.3;

// --- 2. SETUP AND DATA PREPARATION ---
var parkBoundary = ee.FeatureCollection('WCMC/WDPA/current/polygons')
    .filter(ee.Filter.stringContains('NAME', parkName)).first().geometry();
Map.centerObject(parkBoundary, 9);
Map.addLayer(parkBoundary, {color: 'black'}, 'Gashaka-Gumti NP Boundary');

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
var baselineVegetationMask = baselineNDVI.gte(sparseVegThreshold); 

// --- 3. CORE ANALYSIS FUNCTION ---
var yearlyAnalysis = function(year) {
  var yearNumber = ee.Number(year);
  var startDate = ee.Date.fromYMD(yearNumber.subtract(1), 11, 1);
  var endDate = ee.Date.fromYMD(yearNumber, 3, 31);
  var yearComposite = mergedCollection.filterDate(startDate, endDate).median().clip(parkBoundary);
  var yearNDVI = addNDVI(yearComposite).select('ndvi');
  var isForest = yearNDVI.gte(denseForestThreshold);
  var isSparseVegOrFarm = yearNDVI.gte(sparseVegThreshold).and(yearNDVI.lt(denseForestThreshold));
  var isBare = yearNDVI.lt(sparseVegThreshold);
  var classifiedImage = ee.Image(0).where(isForest, 1).where(isSparseVegOrFarm, 2).where(isBare, 3);
  var areaImage = ee.Image.pixelArea().divide(1e6).addBands(classifiedImage.rename('classification'));
  var areas = areaImage.reduceRegion({
    reducer: ee.Reducer.sum().group({ groupField: 1, groupName: 'class' }),
    geometry: parkBoundary,
    scale: 90,
    maxPixels: 1e12
  });
  var classAreas = ee.List(areas.get('groups'));
  var areasDict = ee.Dictionary(classAreas.iterate(function(classData, resultsDict) {
    var classDict = ee.Dictionary(classData);
    var classId = ee.Number(classDict.get('class')).format('%d');
    return ee.Dictionary(resultsDict).set(classId, classDict.get('sum'));
  }, ee.Dictionary({})));
  return ee.Feature(null, {
    'year': year,
    'forest_sqkm': areasDict.get('1', 0),
    'sparse_veg_farmland_sqkm': areasDict.get('2', 0),
    'bare_cleared_land_sqkm': areasDict.get('3', 0)
  }).set('classified_image', classifiedImage);
};

// --- 4. EXECUTE ANALYSIS, DISPLAY, AND EXPORT ---
var resultsCollection = ee.FeatureCollection(ee.List(analysisYears).map(yearlyAnalysis));
var palette = ['#006400', '#FFD700', '#DEB887'];
resultsCollection.aggregate_array('year').evaluate(function(yearsList) {
  if (!yearsList) { print("Error: Could not retrieve years for display."); return; }
  yearsList.forEach(function(year, index) {
    var feature = resultsCollection.filter(ee.Filter.eq('year', year)).first();
    var image = ee.Image(feature.get('classified_image'));
    Map.addLayer(image.clip(parkBoundary), {min: 1, max: 3, palette: palette}, 'Land Cover ' + year, true);
  });
});

print('Calculated Land Cover Area (in sq. km):', resultsCollection);
Export.table.toDrive({
  collection: resultsCollection,
  description: 'GGNP_LandCover_Statistics_2023',
  folder: 'GGNP_Analysis',
  fileNamePrefix: 'GGNP_LandCover_Statistics_2023',
  selectors: ['year', 'forest_sqkm', 'sparse_veg_farmland_sqkm', 'bare_cleared_land_sqkm']
});

var fieldSites = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point(12.0734, 8.1354), {label: 'Site 1: Logs Visible'}),
  ee.Feature(ee.Geometry.Point(11.9392, 7.9645), {label: 'Site 2: Chopped Trees'}),
  ee.Feature(ee.Geometry.Point(11.9398, 7.9634), {label: 'Site 3: On Hill'}),
  ee.Feature(ee.Geometry.Point(11.9560, 7.9658), {label: 'Site 4: Near Settlement'})
]);
Map.addLayer(fieldSites, {color: 'blue'}, 'Field Site Locations');
