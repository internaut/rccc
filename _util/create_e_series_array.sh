#!/bin/bash

OUT="new Array("
while read IN; do
	OUT="$OUT`echo $IN | sed 's/[ ][ ]*/,/g'`,"
done

echo "${OUT%?})"

exit 0
