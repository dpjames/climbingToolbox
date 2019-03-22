import requests 

API_KEY = "yYjoyZGFKWGkgEja1VXvcwM09BwVxQBr"
FORECAST_BASE_URL = "http://dataservice.accuweather.com/forecasts/v1/daily/15day/WHERE?apikey=" + API_KEY
LOCATION_KEY_BASE_URL = "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?q=LAT,LON&apikey="+API_KEY

URL_BASE="https://api.weather.gov/points/LAT,LON"
STEPS = 90

x1 = 48.851162
x2 = 32.083738
y1 = -125.208169
y2 = -101.928904
#y2 = -113.788805
loclist = []

def buildEntry(lat,lon,code):
    return str(lat) + "," + str(lon) + ":" + str(code)

def getDelta(s,e):
    r = e - s
    return r/(STEPS)

latStart = min(x1,x2)
latEnd = max(x1,x2)
lonStart = min(y1,y2)
lonEnd = max(y1,y2)
clat = latStart
clon = lonStart
clonDelta = getDelta(lonStart, lonEnd)
clatDelta = getDelta(latStart, latEnd)
outfile = open("outfile", "w+")
while clat <= latEnd:
    clon = lonStart
    print "new row, " + str((latEnd -clat) / (latEnd - latStart))
    while clon <= lonEnd:
        print "new col, " + str((lonEnd -clon) / (lonEnd - lonStart))
        try:
            LURL = URL_BASE.replace("LAT", str(clat)).replace("LON",str(clon))
            r = requests.get(url=LURL)
            data = r.json()
            f_url = data['properties']['forecast']
            if(f_url is None):
                outfile.write(buildEntry(clat,clon,"NO_DATA"))
            else:
                r = requests.get(url=f_url)
                outfile.write(r.text)
            outfile.write("\n===\n")
        except Exception as e:
            print e
        clon+=clonDelta
    clat+=clatDelta
outfile.close()
