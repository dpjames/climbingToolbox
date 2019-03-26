#!/bin/sh
$MASTER_DATA="../totalRawClimbData"
cd data
for cfile in *
do
   cat $cfile >> $MASTER_DATA 
done
