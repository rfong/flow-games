#!/bin/bash

for f in `find . -name *.sass`; do
	sass --watch $f:${f%.sass}.css &
done

cd ..  # To simulate gh-pages relative url
# py 3.5
python -m http.server 8080 &
cd -
