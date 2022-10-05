const moment = require('moment-timezone')
const request = require('request-promise')

module.exports = class APIClient {
  TESTRAIL_API_URL = 'https://EXAMPLE.testrail.io/index.php?/api/v2'
  REQUEST_LIMIT = 180

  constructor(user, password) {
    this.headers = {
      Authorization: 'Basic ' + Buffer.from(user + ':' + password).toString('base64'),
      'Content-Type': 'application/json',
    }
    this.counter = 0
  }

  async pause() {
    this.counter++
    if (this.counter === this.REQUEST_LIMIT - 1) {
      console.warn('API Rate limit is 180 requests per minute. Waiting for 1 minute to expire...')
      this.counter = 0
      const now = new Date().getTime()
      while (new Date().getTime() < now + 3000) {
        /* do nothing */
      }
    }
  }

  async createTestRun(projectId, caseIds, sectionName) {
    await this.pause()
    const response = await request({
      method: 'POST',
      url: `${this.TESTRAIL_API_URL}/add_run/${projectId}`,
      port: 443,
      headers: this.headers,
      body: JSON.stringify({
        name: `[${moment.tz('Europe/London').format('YYYY-MM-DD hh:mm A')}] ${sectionName}`,
        include_all: false,
        case_ids: caseIds,
      }),
    })

    return JSON.parse(response).id
  }

  async createResultOfTestRun(testRunId, results) {
    await this.pause()
    await request({
      method: 'POST',
      url: `${this.TESTRAIL_API_URL}/add_results_for_cases/${testRunId}`,
      port: 443,
      headers: this.headers,
      body: JSON.stringify({
        results: results,
      }),
    })

    console.info(`[${testRunId}] test run updated`)
  }

  async closeTestRun(testRunId) {
    await this.pause()
    await request({
      method: 'POST',
      url: `${this.TESTRAIL_API_URL}/close_run/${testRunId}`,
      port: 443,
      headers: this.headers,
    })

    console.info(`[${testRunId}] test run closed`)
  }

  async getAllSections(projectId) {
    await this.pause()
    const response = await request({
      method: 'GET',
      url: `${this.TESTRAIL_API_URL}/get_sections/${projectId}`,
      port: 443,
      headers: this.headers,
    })
    return JSON.parse(response)
  }

  async createSection(projectId, parentId, sectionName) {
    await this.pause()
    const response = await request({
      method: 'POST',
      url: `${this.TESTRAIL_API_URL}/add_section/${projectId}`,
      port: 443,
      headers: this.headers,
      body: JSON.stringify({
        parent_id: parentId,
        name: sectionName,
      }),
    })
    console.info(`Section "${sectionName}" created`)
    return JSON.parse(response)
  }

  async createCase(sectionId, title, steps) {
    await this.pause()
    const response = await request({
      method: 'POST',
      url: `${this.TESTRAIL_API_URL}/add_case/${sectionId}`,
      port: 443,
      headers: this.headers,
      body: JSON.stringify({
        title,
        template_id: 4,
        type_id: 1,
        custom_gherkin_field: steps,
      }),
    })
    console.info(`Test case "${title}" created`)
    return JSON.parse(response)
  }

  async deleteSection(sectionId) {
    await this.pause()
    await request({
      method: 'POST',
      url: `${this.TESTRAIL_API_URL}/delete_section/${sectionId}`,
      port: 443,
      headers: this.headers,
    })
    console.info(`Section with ID [${sectionId}] deleted`)
  }

  async deleteTestCase(testCaseId) {
    await this.pause()
    await request({
      method: 'POST',
      url: `${this.TESTRAIL_API_URL}/delete_case/${testCaseId}`,
      port: 443,
      headers: this.headers,
    })
    console.info(`[${testCaseId}] testCase deleted`)
  }
}
