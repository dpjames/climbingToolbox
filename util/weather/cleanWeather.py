import json
import re

######################################################
# This script formats the weather json to a shapefile#
# friendly form. largely linearizing the arrays to be#
# less than 255 chars each.                          #
######################################################


######################################################
#                FUNCTIONS BEGIN                     #
######################################################
def findPrecip(s):
    s = s.lower()
    if "%" in s:
        index = s.index("%")
        numberStr = s[s.index(" ", index - 4, index) : index]
        return int(numberStr)
    if re.search("(rain|snow|showers) likely", s) is not None:
        return 60
    if re.search("chance .* (rain|snow|showers)", s) is not None:
        return 30
    if re.search("little or no (snow|rain)", s) is not None:
        return 10
    if re.search("(snow|rain)fall", s) is not None:
        return 100
    if re.search("(rain\.|snow\.|rain showers\.|snow showers\.)", s) is not None:
        return 100
    if re.search("(rain|snow)", s) is not None:
        print "unknown: " + s
        return 100
    else:
        return 0

######################################################
#                FUNCTIONS END                       #
######################################################

#input file name
fname = "outfile.geojson"

f = open(fname, "r")
txt = ""
for l in f:
    txt+=l
newFeats = []
weather = json.loads(txt)
del txt
for f in weather['features']:
    newF = f
    newF['geometry'] = f['geometry']['geometries'][0]
    del newF['@context']
    fp = f['properties']
    #for each day in forecast, extract the data to top level property
    for i in range(len(fp['periods'])):
        cp = fp['periods'][i]
        newF['properties']['isDay' + str(i)] = cp['isDaytime']
        newF['properties']['name' + str(i)] = cp['name']
        newF['properties']['sfc' + str(i)] = cp['shortForecast']
        newF['properties']['sTime' + str(i)] = cp['startTime']
        newF['properties']['precip' + str(i)] = findPrecip(cp['detailedForecast'])
        newF['properties']['wd' + str(i)] = cp['windDirection']
        newF['properties']['ws' + str(i)] = cp['windSpeed']
    del f
    del newF['properties']['periods'] # remove unneeded data
    newFeats.append(newF);

weather['features'] = newFeats

f = open("weather.geojson", "w+")
f.write(json.dumps(weather))
