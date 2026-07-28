SHELL := /usr/bin/env bash

VARIANTS := us-tech web3 taiwan
COMPANY ?=

.PHONY: all clean help validate $(VARIANTS)

all: $(VARIANTS)

$(VARIANTS):
	@./scripts/build.sh "$@" "$(COMPANY)"

validate: all
	@./scripts/validate.sh

clean:
	@rm -rf "$(CURDIR)/build" "$(CURDIR)/dist"

help:
	@echo "make all                         Build every resume"
	@echo "make us-tech                     Build one variant"
	@echo "make web3 COMPANY=example        Apply companies/example.tex"
	@echo "make validate                    Build and enforce PDF checks"
	@echo "make clean                       Remove generated files"
