import json
import re

def findPrecip(s):
    s = s.lower()
    if "%" in s:
        index = s.index("%")
        numberStr = s[s.index(" ", index - 4, index) : index]
        return int(numberStr)
    if re.search("(rain\.|snow\.)", s) is not None:
        return 100
    if re.search("(rain|snow|showers) likely", s) is not None:
        return 75
    if re.search("chance of (rain|snow|showers)", s) is not None:
        return 30
    if re.search("(rain|snow)", s) is not None:
        print "unknown: " + s
        return 0
    else:
        return 0

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
    for i in range(len(fp['periods'])):
        cp = fp['periods'][i]
        newF['properties']['isDay' + str(i)] = cp['isDaytime']
        newF['properties']['name' + str(i)] = cp['name']
        newF['properties']['sfc' + str(i)] = cp['shortForecast']
        newF['properties']['sTime' + str(i)] = cp['startTime']
        newF['properties']['precip' + str(i)] = findPrecip(cp['detailedForecast'])
    del f
    del newF['properties']['periods']
    newFeats.append(newF);

weather['features'] = newFeats

f = open("weather.geojson", "w+")
f.write(json.dumps(weather))
