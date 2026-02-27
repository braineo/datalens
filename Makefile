.PHONY: build format lint clean release

build:
	bun run build

format:
	bun run format

lint:
	bun run lint

clean:
	rm -rf dist
	rm -f datalens-release.zip

release: build
	rm -f datalens-release.zip
	cd dist && zip -r ../datalens-release.zip . && cd ..

all: format lint build release
