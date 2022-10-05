const APIClient = require('./api/client.js')

const { getFeaturesFromDir, getCaseResultsFromReport } = require('./parser.js')

exports.synchronize = async ({ user, password, mainSectionId, projectId, mainSectionName, featuresPath }, report) => {
  const apiClient = new APIClient(user, password)

  const { sections: existSections } = await apiClient.getAllSections(projectId)
  const rootSection = existSections.find(({ name, parent_id }) => name == mainSectionName && parent_id == mainSectionId)
  if (rootSection) await apiClient.deleteSection(rootSection.id)

  const newSection = await apiClient.createSection(projectId, mainSectionId, mainSectionName)
  const features = getFeaturesFromDir(featuresPath)
  const sections = features.map(f => f.name)
  const scenarios = features.flatMap(f => f.scenarios)

  await Promise.all(sections.map(sectionName => apiClient.createSection(projectId, newSection.id, sectionName)))

  const { sections: allSections } = await apiClient.getAllSections(projectId)
  const cases = await Promise.all(
    scenarios.map(({ section, scenarioName, scenarioText }) => {
      const sectionForCase = allSections.find(({ name }) => name === section)
      if (sectionForCase) {
        return apiClient.createCase(sectionForCase.id, scenarioName, scenarioText)
      }
    }),
  )

  const caseResults = getCaseResultsFromReport(report, cases)

  const caseIds = caseResults.map(({ case_id: caseId }) => caseId)
  const testRunId = await apiClient.createTestRun(projectId, caseIds, mainSectionName)
  await apiClient.createResultOfTestRun(testRunId, caseResults)
  await apiClient.closeTestRun(testRunId)
}
