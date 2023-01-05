#!/bin/bash

cd $(dirname "$0")
cd ..

rm -rf .tmp

COMMIT="85ac400ae26bcec937a79d1aaf1dab07dbe67d60"

git clone https://github.com/jeff-hykin/better-cpp-syntax .tmp/better-cpp-syntax

cd .tmp/better-cpp-syntax

git checkout $COMMIT

cd ../../

cp -r .tmp/better-cpp-syntax/language_examples .tmp/cases

cd .tmp/cases

rm *.yaml
rm *.md
rm *.cc
for filename in *.cpp; do mv $filename better-cpp-syntax-${filename%.*}.cpp; done;
mv ' #587.cpp' better-cpp-syntax-#587.cpp

cd ../../

cp -a .tmp/cases/. test/cases/