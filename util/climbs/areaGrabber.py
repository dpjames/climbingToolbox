import requests
from bs4 import BeautifulSoup
from threading import Thread

####################################################
#                Globals                           #
####################################################
OUTPATH = "data/"
OUTFILE = "climbAreasRaw"
CA_ROOT = "https://www.mountainproject.com/area/105708959/california"
WA_ROOT = "https://www.mountainproject.com/area/105708966/washington"
OR_ROOT = "https://www.mountainproject.com/area/105708965/oregon"
CO_ROOT = "https://www.mountainproject.com/area/105708956/colorado"
NV_ROOT = "https://www.mountainproject.com/area/105708961/nevada"
UT_ROOT = "https://www.mountainproject.com/area/105708957/utah"
T_ROOT = "https://www.mountainproject.com/area/108471326/olympics-pacific-coast"

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
def getChildrenLinks(url):
    html = geturl(url)
    ob = BeautifulSoup(html, "html.parser")
    navRow = ob.findAll('div', {"class" : "lef-nav-row"})
    urlList = []
    if(len(navRow) != 0):
        for item in navRow:
            urlList.append(item.findChildren("a", recursive=False)[0]['href'])
    return {"children" : urlList, "soup" : ob}
def getChildren(cnode, f):
    print cnode
    package = getChildrenLinks(cnode)
    links = package['children']
    soup = package['soup']
    if(len(links) == 0):
        savePageData(soup, f)
    for newUrl in links:
        getChildren(newUrl, f)
        
def threadStart(root):
    url = root['url']
    prefix = root['prefix']
    f = open(OUTPATH + prefix + OUTFILE, "w+")
    getChildren(url, f)
    print "finished" + url
def linkToRoots(link, prefix):
    links = getChildrenLinks(link)['children']
    roots = []
    for i in range(len(links)):
        clink = links[i]
        roots.append({"url" : clink, "prefix" : prefix + str(i)})
    return roots
####################################################
#                       Main                       #
####################################################
threadList = []
states = [
        {"prefix" : "CO", "url" : CO_ROOT},
        #{"prefix" : "NV", "url" : NV_ROOT},
        {"prefix" : "UT", "url" : UT_ROOT},
]
#roots = linkToRoots("https://www.mountainproject.com/area/106150395/olympic-national-park", prefix)
runningThreads = 0
for state in states:
    prefix = state['prefix']
    url = state['url']
    roots = linkToRoots(url, prefix)
    print "starting " + prefix
    for root in roots:
        if runningThreads > 9:
            threadList.pop(0).join()
            runningThreads-=1
        t = Thread(target=threadStart,args=(root,))
        threadList.append(t)
        t.start()
        runningThreads+=1
    for t in threadList:
        t.join()
        runningThreads-=1
    print "all done with " + prefix
