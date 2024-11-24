#!/bin/bash

ls -lat service/movieApi/src/data/output/

curl -s "http://localhost:25673/api/v1/file/content?requestId=${1:-01JDF4NWX3Q5HJ5C0TK7Y2XQ42}&fileName=${2:-output.mp4}" -o /tmp/output.mp4

