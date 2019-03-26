import requests
from bs4 import BeautifulSoup
from threading import Thread

####################################################
#                Globals                           #
####################################################
OUTFILE = "climbAreasRaw"
CA_ROOT = "https://www.mountainproject.com/area/105708959/california"
WA_ROOT = "https://www.mountainproject.com/area/105708966/washington"
OR_ROOT = "https://www.mountainproject.com/area/105708965/oregon"

####################################################
#               helper functions                   #
####################################################

def geturl(url):
    html = ""
    try:
        r = requests.get(url=url)
        html = r.text
    except Exception as e:
        print e
    return html
def savePageData(ob, f):
    f.write(ob.prettify().encode("utf-8"))

def getChildren(cnode, f):
    print cnode
    html = geturl(cnode)
    ob = BeautifulSoup(html, "html.parser")
    navRow = ob.findAll('div', {"class" : "lef-nav-row"})
    if(len(navRow) == 0):
        savePageData(ob, f)
    for item in navRow:
        newUrl = item.findChildren("a", recursive=False)[0]['href']
        getChildren(newUrl, f)
        
def threadStart(root):
    url = root['url']
    prefix = root['prefix']
    f = open(prefix + OUTFILE, "w+")
    getChildren(url, f)
####################################################
#                       Main                       #
####################################################

roots = [
        {"prefix" : "CA", "url" : CA_ROOT},
        {"prefix" : "WA", "url" : WA_ROOT},
        {"prefix" : "OR", "url" : OR_ROOT}
]

for root in roots:
    t = Thread(target=threadStart,args=(root,))
    t.start()


