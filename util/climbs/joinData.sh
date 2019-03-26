#!/bin/sh
MASTER_DATA='../totalRawClimbData'
echo $MASTER_DATA
rm $MASTER_DATA
touch $MASTER_DATA
cd data
for cfile in *
do
   cat $cfile >> $MASTER_DATA 
done
