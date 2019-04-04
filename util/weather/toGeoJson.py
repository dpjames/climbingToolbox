import json
        
######################################################
#  This script transforms the downloaded jsons       #
#  into a single geojson object                      #
######################################################

######################################################
#              GLOBALS BEGIN                         #
######################################################
#input file
F_NAME = "outfile"
#output file
OUT_GEOJSON = F_NAME+".geojson"
#entry delimiter
DELIM = "==="
######################################################
#                GLOBALS END                         #
######################################################


f = open(F_NAME, "r");
total = ""
for l in f:
    total+=l
split = total.split(DELIM)
f.close()

#NOTE: opted to manually encode the json and write as we go because this was originally run on a raspberry pi with very little ram.
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
