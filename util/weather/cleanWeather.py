import json

def findPrecip(s):
    if "%" in s:
        index = s.index("%")
        numberStr = s[s.index(" ", index - 5, index) : index]
        print numberStr
        return int(numberStr)
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
    newFeats.append(newF);

weather['features'] = newFeats

f = open("weather.geojson", "w+")
f.write(json.dumps(weather))
