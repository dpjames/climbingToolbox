import json

def fixBounds(geojson):
    L_VAL = 1000
    epsilon = .03
    geos = geojson['features']
    sc = geos[0]['geometry']['geometries'][0]['coordinates']
    occ = geos[1]['geometry']['geometries'][0]['coordinates']
    minX = L_VAL
    minY = L_VAL

    for geo in geos:
        cc = geo['geometry']['geometries'][0]['coordinates']
        print cc[1]
        thisX = abs(sc[0] - cc[0])
        thisY = abs(sc[1] - cc[1])
        if(thisX < minX and thisX > epsilon):
            minX = thisX
        if(thisY < minY and thisY > epsilon):
            minY = thisY
    print "====="
    print str(minX) + ","+str(minY)
    print "====="

    deltaX = minX / 2
    deltaY = minY / 2
    for geo in geos:
        cc = geo['geometry']['geometries'][0]['coordinates']
        geo['geometry']['geometries'][1]['coordinates'] = [
            [
                cc[0]-deltaX,cc[1]+deltaY
            ],
            [
                cc[0]-deltaX,cc[1]-deltaY
            ],
            [
                cc[0]+deltaX,cc[1]-deltaY
            ],
            [
                cc[0]+deltaX,cc[1]+deltaY
            ],
            [
                cc[0]-deltaX,cc[1]+deltaY
            ],
        ]
    return geojson
          
        
F_NAME = "outfile"
OUT_GEOJSON = F_NAME+".geojson"
DELIM = "==="
f = open(F_NAME, "r");
total = ""
for l in f:
    total+=l
split = total.split(DELIM)
f.close()


geojson = dict()
geojson['type'] = 'FeatureCollection'
geojson['features'] = []
#for s in split:
#    try:
#        j = json.loads(s)
#        geo = dict()
#        geo['geometry'] = j['geometry']['geometries'][1]
#        geo['type'] = 'Feature'
#        geojson['features'].append(geo)
#        print len(geojson['features'])
#    except Exception as e:
#        print e
#        pass
for s in split:
    try:
        j = json.loads(s)
        if "title" in j:
            if j['title'].contains("Problem"):
                continue
        geojson['features'].append(j)
        print len(geojson['features'])
    except Exception as e:
        print e
        pass
#geojson = fixBounds(geojson)
f = open(OUT_GEOJSON, "w+")
f.write(json.dumps(geojson))
f.close()
