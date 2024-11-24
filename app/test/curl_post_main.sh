#!/bin/bash

ls -lat service/movieEngine/src/data/

curl -X POST \
  -F "title=test シマリス兄弟とふしぎなショッピングモール。" \
  -F "narrationCsv=${PWD}/asset/narration.csv" \
  -F "fileList[]=@${PWD}/asset/dummy_image1.png" \
  -F "fileList[]=@${PWD}/asset/dummy_image2.png" \
  -F "fileList[]=@${PWD}/asset/dummy_image3.png" \
  -F "fileList[]=@${PWD}/asset/dummy_image4.png" \
  http://localhost:25673/api/v1/prompt/register/main

