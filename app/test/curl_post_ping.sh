#!/bin/bash

ls -lat service/movieEngine/src/data/

echo "hello test by curl" > /tmp/sample_movie_rabbitmq.txt
curl -X POST \
  -F "rightTopText=right-top" \
  -F "leftTopText=left-top" \
  -F "rightBottomText=right-bottom" \
  -F "file=@/tmp/sample_movie_rabbitmq.txt" \
  http://localhost:25673/api/v1/prompt/register/ping

echo "sleep 5 to wait movieEngine saving file"
sleep 5

ls -lat service/movieEngine/src/data/

