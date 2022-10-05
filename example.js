require('dotenv').config()
const { synchronize } = require('./src/service.js')
const report = require('./cucumber_report.json')

const config = {
  user: process.env.TESTRAIL_EXAMPLE_USER,
  password: process.env.TESTRAIL_EXAMPLE_PASS,
  projectId: 15,
  mainSectionId: 4723,
  mainSectionName: 'EXAMPLE',
  featuresPath: './features/',
}

synchronize(config, report)
