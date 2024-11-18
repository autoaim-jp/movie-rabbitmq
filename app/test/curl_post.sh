#!/bin/bash

ls -lat service/movieEngine/src/data/

echo "hello test by curl" > /tmp/sample_movie_rabbitmq.txt
curl -X POST -F "file=@/tmp/sample_movie_rabbitmq.txt" http://localhost:25673/api/v1/prompt/register

echo "sleep 5 to wait movieEngine saving file"
sleep 5

ls -lat service/movieEngine/src/data/

