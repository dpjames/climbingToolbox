#!/bin/sh
#joins all the data in data folder to a large single file to be processed.
MASTER_DATA='totalRawClimbData'
echo $MASTER_DATA
rm $MASTER_DATA
touch $MASTER_DATA
cd data
for cfile in *
do
   cat $cfile >> ../$MASTER_DATA 
done
