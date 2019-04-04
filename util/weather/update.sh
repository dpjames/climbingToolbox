#!/bin/bash
#clean the dir
rm weather.geojson outfile outfile.geojson
# grab weather
python wscrub.py
# format to large geojson
python toGeoJson.py
# normalize the data, and prep for shapefile format
python cleanWeather.py
#backup yesterdays data
F_NAME=$(date +%Y%m%d_%H%M%S)
mkdir ../../gis/weather/$F_NAME
mv ../../gis/weather/*.* ../../gis/weather/$F_NAME
#generate the new shapefile.
ogr2ogr -f "ESRI Shapefile" -a_srs EPSG:4326 ../../gis/weather/weather.shp weather.geojson
