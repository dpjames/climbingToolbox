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

f = open(OUT_GEOJSON, "w+")
f.write('{"type" : "featureCollection", "features" : [')

firstComma = True
for i in range(len(split)):
    s = split[i]
    try:
        j = json.loads(s)
        if "title" in j:
            if j['title'].contains("Problem"):
                continue
        if not firstComma:
            f.write(",")
        else:
            firstComma = False;
        f.write(s)
    except Exception as e:
        print e
        pass
f.write("]}")
f.close()
