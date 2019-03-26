import json

f = open("climbs.geojson", "r")
gj = ""
for line in f:
    gj+=line
j = json.loads(gj)
knownParis = []
newFeatures = []
for geo in j['features']:
    if(geo['geometry'] is None):
        continue
    pair = str(geo['geometry']['coordinates'][0]) +"," + str(geo['geometry']['coordinates'][1])
    if pair in knownParis:
        continue;
    else:
        knownParis.append(pair)
        newFeatures.append(geo)
    
print str(len(newFeatures)) + " vs " + str(len(j['features']))
j['features'] = newFeatures

f = open("cleanclimbs.geojson", "w+")
f.write(json.dumps(j))
