include setting/version.conf
SHELL=/bin/bash
PHONY=default run rebuild help 

.PHONY: $(PHONY)

default: run

run: docker-compose-up
rebuild: docker-compose-down docker-compose-build

help:
	@echo "Usage: make run"
	@echo "Usage: make help"

docker-compose-up:
	docker compose -p ${DOCKER_PROJECT_NAME} up

docker-compose-down:
	docker compose -p ${DOCKER_PROJECT_NAME} down --volumes

docker-compose-build:
	docker compose -p ${DOCKER_PROJECT_NAME} build



