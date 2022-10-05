const gherkinParser = require('gherkin-parse')
const path = require('path')
const fs = require('fs')
const statusId = require('./const.js').status

const getStatusId = steps => {
  const statuses = steps.map(({ result }) => result.status)
  if (statuses.every(status => status === 'passed')) {
    return statusId.PASSED
  } else {
    return statusId.FAILED
  }
}

const getStepResults = steps =>
  steps.map(({ keyword, name, result }) => ({
    content: `${keyword} ${name}`,
    status_id: statusId[result.status],
    actual: result.error_message || '',
  }))

exports.getCaseResultsFromReport = (report, cases) =>
  report.reduce((results, { name: featureName, elements }) => {
    elements.forEach(({ name, steps }) => {
      const scenario = cases.find(testCase => testCase.title === `[${featureName}]: ${name}`)
      if (scenario) {
        results.push({
          case_id: scenario.id,
          status_id: getStatusId(steps),
          custom_step_results: getStepResults(steps),
        })
      }
    })
    return results
  }, [])

exports.getFeaturesFromDir = directory => {
  let featureFiles = fs.readdirSync(directory).filter(file => file.includes('.feature'))
  return featureFiles.reduce((features, file) => {
    let json = gherkinParser.convertFeatureFileToJSON(path.join(directory, file))
    let background = ''
    let backgroundJson = json.feature.children.find(item => item.type === 'Background')

    if (backgroundJson) {
      backgroundJson.steps.forEach(
        backgroundStep => (background = background + `${backgroundStep.keyword} ${backgroundStep.text}\n`),
      )
      json.feature.children = json.feature.children.filter(item => item.type !== 'Background')
    }

    let fileText = gherkinParser.convertJSONToFeatureFile(json)
    let scenarios = fileText.replace(/@\S+/gm, '').match(/(Scenario(.|[\r\n])*?(?=Scenario))|Scenario(.|[\r\n])*/gm)
    features.push({
      name: json.feature.name,
      scenarios: json.feature.children.map((scenario, index) => {
        let scenarioName = `[${json.feature.name}]: ${scenario.name}`
        return {
          section: json.feature.name,
          scenarioName: scenarioName,
          scenarioText: background + scenarios[index],
        }
      }),
    })
    return features
  }, [])
}
