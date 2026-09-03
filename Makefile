SHELL := /usr/bin/env bash

VARIANTS := us-tech web3 taiwan chinese ai
COMPANY ?=

.PHONY: all clean help site validate $(VARIANTS)

all: $(VARIANTS)

$(VARIANTS):
	@./scripts/build.sh "$@" "$(COMPANY)"

validate: all
	@./scripts/validate.sh

site: validate
	@./scripts/build-site.sh

clean:
	@rm -rf "$(CURDIR)/build" "$(CURDIR)/dist" "$(CURDIR)/site/assets" "$(CURDIR)/site/index.md" "$(CURDIR)/_site"

help:
	@echo "make all                         Build every resume"
	@echo "make us-tech                     Build one variant"
	@echo "make ai                          Build the AI-company variant"
	@echo "make web3 COMPANY=example        Apply companies/example.tex"
	@echo "make validate                    Build and enforce PDF checks"
	@echo "make site                        Validate PDFs and prepare the Markdown site"
	@echo "make clean                       Remove generated files"
