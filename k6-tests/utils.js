export function buildHeaders(authToken, queryParams = {}, tagName = '', includeParams = true) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`,
    };

    const result = {
        headers,
        tags: {
            name: tagName
        }
    };

    if (includeParams) {
        result.params = queryParams;
    }

    return result;
}

export function buildStages(rampUpSteps, rampDownSteps, stepDuration, maxVUs, holdDuration) {
    const stages = [];

    const upStep = Math.floor(maxVUs / rampUpSteps);

    for (let i = 1; i <= rampUpSteps; i++) {
        const target = i * upStep;
        stages.push({ duration: stepDuration, target });
    }

    stages.push({ duration: holdDuration, target: maxVUs });

    for (let i = rampDownSteps - 1; i >= 0; i--) {
        const target = i * upStep;
        stages.push({ duration: stepDuration, target });
    }

    return stages;
}

export function buildThresholds(enabledScenarioNames, scenarioTags) {
    const tagSet = new Set();

    for (const scenario of enabledScenarioNames) {
        (scenarioTags[scenario] || []).forEach(tag => tagSet.add(tag));
    }

    const thresholds = {};
    for (const tag of tagSet) {
        thresholds[`http_req_duration{name:${tag}}`] = []; // Можно указать ['p(95)<500'] и т.д.
    }

    return thresholds;
}
