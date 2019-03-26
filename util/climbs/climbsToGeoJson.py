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
knownIds = []
for jstr in climbsArr:
    try:
        j = json.loads(jstr)
        for climbData in j['routes']:
            if(climbData['id'] in knownIds):
                continue;
            else:
                knownIds.append(climbData['id'])
            feature = dict()
            feature['type'] = "feature"
            geo = dict()
            geo['type'] = "point"
            geo['coordinates'] = [climbData['longitude'], climbData['latitude']]
            props = dict()
            props['name'] = climbData['name']
            props['url'] = climbData['url']
            props['location'] = json.dumps(climbData['location'])
            feature['properties'] = props
            feature['geometry'] = geo
            geojson['features'].append(feature) 
    except Exception as e:
        print jstr
        print e

o.write(json.dumps(geojson))
o.close()
  
