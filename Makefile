SHELL := /usr/bin/env bash

VARIANTS := us-tech web3 taiwan chinese ai
COMPANY ?=

.PHONY: all clean help site validate tailor profiles check-profiles test $(VARIANTS)

all: $(VARIANTS)

$(VARIANTS):
	@./scripts/build.sh "$@" "$(COMPANY)"

validate:
	@test -z "$(COMPANY)" || { echo "Use make tailor COMPANY=$(COMPANY) for one application." >&2; exit 2; }
	@python3 scripts/resume.py build-all
	@./scripts/validate.sh

tailor:
	@python3 scripts/resume.py tailor "$(COMPANY)"

profiles:
	@python3 scripts/resume.py list

check-profiles:
	@python3 scripts/resume.py check

test:
	@python3 -m unittest discover -s tests -v

site: validate
	@./scripts/build-site.sh

clean:
	@rm -rf "$(CURDIR)/build" "$(CURDIR)/dist" "$(CURDIR)/site/assets" "$(CURDIR)/site/index.md" "$(CURDIR)/_site"

help:
	@echo "make all                         Build every resume"
	@echo "make us-tech                     Build one variant"
	@echo "make ai                          Build the AI-company variant"
	@echo "make web3 COMPANY=example        Apply companies/example.tex"
	@echo "make validate                    Build and check five standards plus all ready applications"
	@echo "make profiles                    List application profiles"
	@echo "make tailor COMPANY=wand-fde      Build, check and record one application"
	@echo "make test                        Test workflow and rejection paths"
	@echo "make site                        Validate PDFs and prepare the Markdown site"
	@echo "make clean                       Remove generated files"
