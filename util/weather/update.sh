#!/bin/bash
#clean the dir
rm weather.geojson outfile outfile.geojson
python wscrub.py
python toGeoJson.py
python cleanWeather.py
F_NAME=$(date +%Y%m%d_%H%M%S)
mkdir ../gis/weather/$F_NAME
mv ../gis/weather/*.* ../gis/weather/$F_NAME
ogr2ogr -f "ESRI Shapefile" -a_srs EPSG:4326 ../gis/weather/weather.shp weather.geojson
