include setting/version.conf
SHELL=/bin/bash
PHONY=default init run rebuild help 

.PHONY: $(PHONY)

default: run

init: init-submodule init-module init-dir
run: docker-compose-up
rebuild: docker-compose-down docker-compose-build

help:
	@echo "Usage: make init"
	@echo "Usage: make run"
	@echo "Usage: make help"

init-submodule:
	git config -f .gitmodules submodule.xmodule-movie-core.branch master
	git submodule update --remote --init --recursive

init-module:
	sudo rm -rf ./service/movieEngine/src/lib/xmodule-movie-core/
	mkdir -p ./service/movieEngine/src/lib/ && cp -r ./xmodule-movie-core/ ./service/movieEngine/src/lib/
	rm -rf ./service/movieEngine/src/lib/xmodule-movie-core/data/generated/

init-dir:
	mkdir -p ./service/movieEngine/src/data/

docker-compose-up:
	docker compose -p ${DOCKER_PROJECT_NAME} up

docker-compose-down:
	docker compose -p ${DOCKER_PROJECT_NAME} down --volumes

docker-compose-build:
	docker compose -p ${DOCKER_PROJECT_NAME} build



