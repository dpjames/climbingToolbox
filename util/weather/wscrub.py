
######################################################
#      this script downloads the weather data        #
#      from api.weather.gov and writes it to outfile #
######################################################
import requests 
URL_BASE="https://api.weather.gov/points/LAT,LON"
######################################################
#              GLOBALS BEGIN                         #
######################################################

#The next 4 lines describe a lat/lon bounding box
x1 = 48.851162
x2 = 32.083738
y1 = -125.208169
y2 = -101.928904

#steps splits the above bounding box into a grid  with dimensions STEPS x STEPS
STEPS = 90

# string to seperate weather entries. very important.
DELIM = "\n===\n"
######################################################
#                GLOBALS END                         #
######################################################


######################################################
#                FUNCTIONS BEGIN                     #
######################################################

############################################
# builds a no data entry                   #
# can probably be removed                  #
############################################
def buildEntry(lat,lon,code):
    return str(lat) + "," + str(lon) + ":" + str(code)
############################################
#  determines the lat/lon delta to use    #
#  based on the start value and end value #
############################################
def getDelta(s,e):
    r = e - s
    return r/(STEPS)

######################################################
#                FUNCTIONS END                       #
######################################################



######################################################
#                  SCRIPT BEGIN                      #
#                                                    #
# the algorithm steps through a defined bounding box #
# by a calculated delta. for each point on the       #
# corrosponding grid, the weather is grabbed from    #
# api.weather.gov. if the request is empty or fails, #
# then NO_DATA is output to the outfile.             #
# The delimiter "\n===\n" is important for this      #
# pipeline                                           #
######################################################
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
            outfile.write(DELIM)
        except Exception as e:
            print e
        clon+=clonDelta
    clat+=clatDelta
outfile.close()
