.PHONY: install content dev check build

install:
	pnpm install

content:
	pnpm build:content

dev:
	pnpm --filter web dev

check:
	pnpm --filter web check

build:
	pnpm --filter web build
