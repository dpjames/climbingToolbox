import json
from bs4 import BeautifulSoup





####################################################
#                  GLOBALS                         #
####################################################
BASE_F_NAME = "climbAreasRaw"
OUTPUT_FILE = BASE_F_NAME + ".geojson"
PREFIXES = ["OR","WA"]

####################################################
#                   Functions                      #
####################################################
def findUrl(soup):
    url = ""
    meta = soup.find_all("meta")
    for m in meta:
        try:
            if m['property'] == 'og:url':
                url = m['content']
                break
        except:
            pass
    return url
def findLocation(soup):
    cells = soup.select(".description-details")[0].select("td")
    thisOne = False
    for cell in cells:
        if thisOne:
            locText = cell.encode_contents().split("<")[0].strip().split(",")
            latTxt = locText[0]
            lonTxt = locText[1]
            loc = dict()
            loc['lat'] = float(latTxt)
            loc['lon'] = float(lonTxt)
            return loc
        if "GPS" in cell.encode_contents():
            thisOne = True
    return None
def findName(soup):
    name = soup.select("#single-area-picker-name")
    return name[0].encode_contents()
def toFeature(name, url, location):
    feature = dict()
    feature['type'] = "Feature"
    geo = dict()
    geo["type"] = "Point"
    geo['coordinates'] = [location['lon'],location['lat']]
    props = dict()
    props['name'] = name
    props['url'] = url
    feature['geometry'] = geo
    feature['properties'] = props
    return feature

def addFeatures(htmlList, geoJson):
    for html in htmlList:
        if(len(html) == 0):
            continue
        soup = BeautifulSoup(html, "html.parser")
        url = findUrl(soup)
        location = findLocation(soup)
        name = findName(soup)
        feature = toFeature(name, url, location)
        geoJson['features'].append(feature)
        
####################################################
#                    Main                          #
####################################################

geoJson = dict()
geoJson['type'] = "featureCollection"
geoJson['features'] = []
for prefix in PREFIXES:
    print "Doing " + prefix
    f = open(prefix + BASE_F_NAME)
    fullText = f.read()
    htmlArray = fullText.split("<!DOCTYPE html>")
    addFeatures(htmlArray, geoJson)
print "writing json"
of = open(OUTPUT_FILE, "w+")
of.write(json.dumps(geoJson).encode("utf-8"))
of.close()

