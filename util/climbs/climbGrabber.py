import requests

OUTFILE = "climbsRaw"


def geturl(url, f):
    try:
        r = requests.get(url=url)
        data = r.text
        f.write(data.encode("utf-8"))
    except Exception as e:
        print e

url = "https://www.mountainproject.com/data/get-routes-for-lat-lon?lat=LAT&lon=LON&key=200129135-1841ec5d8797cd7b98555472618fe8e7"



steps = 90
x1 = 48.851162
x2 = 32.083738
y1 = -125.208169
y2 = -101.928904

xran = abs(x1-x2)
yran = abs(y1-y2)

dx = xran/steps
dy = yran/steps

cx = min(x1,x2)
cy = min(y1,y2)

xstop = max(x1,x2)
ystop = max(y1,y2)

f = open(OUTFILE, "w+")
tcount = 0
while(cx < xstop):
    while(cy < ystop):
        tcount+=1
        thisurl = url.replace("LAT",str(cx)).replace("LON",str(cy))
        print thisurl + " " + str(tcount / (steps * steps)) + " = " + str(tcount) + "/" + str(steps*steps)
        geturl(thisurl, f)
        f.write("===")
        cy+=dy
    cy = min(y1,y2)
    cx+=dx



