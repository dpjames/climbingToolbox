import json
        
F_NAME = "outfile"
OUT_GEOJSON = F_NAME+".geojson"
DELIM = "==="
f = open(F_NAME, "r");
total = ""
for l in f:
    total+=l
split = total.split(DELIM)
f.close()


#geojson = dict()
#geojson['type'] = 'FeatureCollection'
#geojson['features'] = []
##for s in split:
##    try:
##        j = json.loads(s)
##        geo = dict()
##        geo['geometry'] = j['geometry']['geometries'][1]
##        geo['type'] = 'Feature'
##        geojson['features'].append(geo)
##        print len(geojson['features'])
##    except Exception as e:
##        print e
##        pass
#for s in split:
#    try:
#        j = json.loads(s)
#        if "title" in j:
#            if j['title'].contains("Problem"):
#                continue
#        geojson['features'].append(j)
#        print len(geojson['features'])
#    except Exception as e:
#        print e
#        pass
##geojson = fixBounds(geojson)
#f = open(OUT_GEOJSON, "w+")
#f.write(json.dumps(geojson))
#f.close()
f = open(OUT_GEOJSON, "w+")
f.write('{"type" : "featureCollection", "features" : [')
for i in range(len(split)):
    s = split[i]
    try:
        j = json.loads(s)
        if "title" in j:
            if j['title'].contains("Problem"):
                continue
        #geojson['features'].append(j)
        f.write(s)
        if i < len(split) - 2:
            f.write(",")
        #print len(geojson['features'])
    except Exception as e:
        print e
        pass
f.write("]}")
f.close()
