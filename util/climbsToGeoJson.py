import json


F_NAME = "climbsRaw"
O_NAME = F_NAME + ".geojson"
DELIM = "==="

f = open(F_NAME)

climbsStr = ""
for l in f:
    climbsStr += l
climbsArr = climbsStr.split(DELIM)


geojson = dict()
geojson['type'] = 'FeatureCollection'
geojson['features'] = []

o = open(O_NAME, "w+")

for jstr in climbsArr:
    try:
        j = json.loads(jstr)
        for climbData in j['routes']:
            feature = dict()
            feature['type'] = "feature"
            geo = dict()
            geo['type'] = "point"
            geo['coordinates'] = [climbData['longitude'], climbData['latitude']]
            geo['properties'] = climbData
            feature['geometry'] = geo
            geojson['features'].append(feature) 
    except:
        print jstr

o.write(json.dumps(geojson))
o.close()
  
