# testrail-integration

Pushing a results of cucumber tests to TestRail

## How to use

In your project add new dependency:

    "@andim0n/testrail-integration": "git@github.com/andim0n/testrail-integration.git"

## Create/update tests and add results in TestRail

Add file synchronize.js:

    require('dotenv').config()
    const report = require('../cucumber_report.json')
    const { synchronize } = require('@andim0n/testrail-integration')

    const config = {
        user: process.env.TESTRAIL_EXAMPLE_USER,
        password: process.env.TESTRAIL_EXAMPLE_PASS,
        projectId: 15,
        mainSectionId: 4723,
        mainSectionName: 'EXAMPLE',
        featuresPath: './features/',
    }

    synchronize(config, report)

- user, password - TestRail user credentials (use the .env file)
- projectId - project id in TestRail
- mainSectionId - id of the section for new sections and test cases
- mainSectionName - name of the new section
- featuresPath - path to the feature files
- report - cucumber_report.json file with results of the test run

Run this file to synchronize feature files from your repo with TestRail test cases and add results of test run

## Publish new version of package

In package.json change version:

    "name": "@andim0n/testrail-integration",
    "version": "1.0.0",  <= this one
    "description": "",
    "main": "index.js",
    "scripts": { "test": "echo \"Error: no test specified\" && exit 1" }

And run:

    npm publish
