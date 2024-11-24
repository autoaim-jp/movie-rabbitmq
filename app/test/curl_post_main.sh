#!/bin/bash

ls -lat service/movieEngine/src/data/

SCRIPT_DIR_PATH=$(dirname "$0")/

ls ${SCRIPT_DIR_PATH}asset/narration.csv
ls ${SCRIPT_DIR_PATH}asset/dummy_image1.png

NARRATION_TEXT=$(cat ${SCRIPT_DIR_PATH}asset/narration.csv)

curl -X POST \
  -F "title=test_シマリス兄弟とふしぎなショッピングモール。" \
  -F "narrationCsv=${NARRATION_TEXT}" \
  -F "fileList[]=@${SCRIPT_DIR_PATH}asset/dummy_image1.png" \
  -F "fileList[]=@${SCRIPT_DIR_PATH}asset/dummy_image2.png" \
  -F "fileList[]=@${SCRIPT_DIR_PATH}asset/dummy_image3.png" \
  -F "fileList[]=@${SCRIPT_DIR_PATH}asset/dummy_image4.png" \
  http://localhost:25673/api/v1/prompt/register/main

