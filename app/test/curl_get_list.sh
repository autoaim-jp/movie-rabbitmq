#!/bin/bash

ls -lat service/movieApi/src/data/output/

echo "===================="

curl -s "http://localhost:25673/api/v1/file/list" | jq .

echo "===================="

curl -s "http://localhost:25673/api/v1/file/list?requestId=${1:-01JDF4NWX3Q5HJ5C0TK7Y2XQ42}" | jq .

echo "===================="

