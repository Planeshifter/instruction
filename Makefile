
#############
# VARIABLES #

# BROWSERIFY  #

BROWSERIFY ?= ./node_modules/.bin/browserify
BABELIFY ?= ./node_modules/babelify
UGLIFY ?= ./node_modules/.bin/uglifyjs

# Set the node.js environment to test:
NODE_ENV ?= test

# Kernel name:
KERNEL ?= $(shell uname -s)

ifeq ($(KERNEL), Darwin)
	OPEN ?= open
else
	OPEN ?= xdg-open
endif


# NOTES #

NOTES ?= 'TODO|FIXME|WARNING|HACK|NOTE'


# MOCHA #

MOCHA ?= ./node_modules/.bin/mocha
_MOCHA ?= ./node_modules/.bin/_mocha
MOCHA_REPORTER ?= spec


# ISTANBUL #

ISTANBUL ?= ./node_modules/.bin/istanbul
ISTANBUL_OUT ?= ./reports/coverage
ISTANBUL_REPORT ?= lcov
ISTANBUL_LCOV_INFO_PATH ?= $(ISTANBUL_OUT)/lcov.info
ISTANBUL_HTML_REPORT_PATH ?= $(ISTANBUL_OUT)/lcov-report/index.html


# JSHINT #

JSHINT ?= ./node_modules/.bin/jshint
JSHINT_REPORTER ?= ./node_modules/jshint-stylish


# Build folder #
BUILDDIR ?= build


# FILES #

# Source files:
SOURCES ?= lib/*.js

# Test files:
TESTS ?= test/*.js




###########
# TARGETS #


# Deploy #

.PHONY: deploy

deploy: build
	rm $(BUILDDIR) -rf
	mkdir $(BUILDDIR)
	cp -r img/ $(BUILDDIR)/img
	cp -r css/ $(BUILDDIR)/css
	cp -r vendor/ $(BUILDDIR)/vendor
	cp -r bower_components/ $(BUILDDIR)/bower_components
	cp index.html $(BUILDDIR)/index.html
	cp codebox.html $(BUILDDIR)/codebox.html
	cp CNAME $(BUILDDIR)/CNAME
	cp bundle.min.js $(BUILDDIR)/bundle.min.js
	cp computeBundle.min.js $(BUILDDIR)/computeBundle.min.js
	cd $(BUILDDIR) && \
	sed -i 's/bundle.js/bundle.min.js/g'  index.html && \
	git init . && \
	git add . && \
	git commit -m "deploy page"; \
	git push "https://github.com/Planeshifter/instruction.git" master:gh-pages --force && \
	rm -rf .git
	rm -rf build

# Build process #

.PHONY: build

build:
	$(BROWSERIFY) js/script.js --exclude jquery -t $(BABELIFY) --outfile bundle.js
	$(BROWSERIFY) js/compute.js --outfile computeBundle.js
	$(UGLIFY) bundle.js --compress --output bundle.min.js
	$(UGLIFY) computeBundle.js --compress --output computeBundle.min.js

# NOTES #

.PHONY: notes

notes:
	grep -Ern $(NOTES) $(SOURCES) $(TESTS)



# UNIT TESTS #

.PHONY: test test-mocha

test: test-mocha

test-mocha: node_modules
	NODE_ENV=$(NODE_ENV) \
	NODE_PATH=$(NODE_PATH_TEST) \
	$(MOCHA) \
		--reporter $(MOCHA_REPORTER) \
		$(TESTS)



# CODE COVERAGE #

.PHONY: test-cov test-istanbul-mocha

test-cov: test-istanbul-mocha

test-istanbul-mocha: node_modules
	NODE_ENV=$(NODE_ENV) \
	NODE_PATH=$(NODE_PATH_TEST) \
	$(ISTANBUL) cover \
		--dir $(ISTANBUL_OUT) \
		--report $(ISTANBUL_REPORT) \
	$(_MOCHA) -- \
		--reporter $(MOCHA_REPORTER) \
		$(TESTS)



# COVERAGE REPORT #

.PHONY: view-cov view-istanbul-report

view-cov: view-istanbul-report

view-istanbul-report:
	$(OPEN) $(ISTANBUL_HTML_REPORT_PATH)


# LINT #

.PHONY: lint lint-jshint

lint: lint-jshint

lint-jshint: node_modules
	$(JSHINT) \
		--reporter $(JSHINT_REPORTER) \
		./


# NODE #

# Install node_modules:
.PHONY: install

install:
	npm install

# Clean node:
.PHONY: clean-node

clean-node:
	rm -rf node_modules



# CLEAN #
.PHONY: clean

clean:
	rm -rf build
