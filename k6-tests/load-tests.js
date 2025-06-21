import http from 'k6/http';
import { check, sleep } from 'k6';
import { envConfig } from "./env-config.js";
import { buildHeaders, buildStages, buildThresholds } from "./utils.js";

const rampUpSteps = parseInt(__ENV.RAMP_UP_STEPS || '2', 10);
const rampDownSteps = parseInt(__ENV.RAMP_DOWN_STEPS || '2', 10);
const stepDuration = __ENV.STEP_DURATION || '1m';
const holdDuration = __ENV.HOLD_DURATION || '1m';
const maxVUs = parseInt(__ENV.MAX_VUS || '6', 10);

const ENV = __ENV.ENV || 'qa';
const config = envConfig[ENV];

const SELECTED_SCENARIO = __ENV.SCENARIO || 'all';

const getOfficeTag = `GET /offices/${config.officeId}`;
const getClientTag = `GET /client-users/${config.clientId}`;
const getAllImpressionsTag = `GET ALL /impressions`;
const getAllTypesTag = `GET ALL /types`;
const getAllCategoriesTag = `GET ALL /categories`;
const getAllAppliancesTag = `GET ALL /appliances`;
const getRxMappingsTag = `GET /rx-mappings`;
const getAllStickersTag = `GET ALL /stickers`;
const getRxWizardGroupsTag = `GET /rxwizard_groups`;
const postDueDatesTag = 'POST /due-dates';
const postCreateCaseTag = `POST /cases`;
const getCaseTag = `GET /cases/:id`;
const patchCaseTag = `PATCH /cases/:id`;
const deleteCaseTag = `DELETE /cases/:id`;
const getDoctorCasesPageTag = 'GET /doctor/cases';

const allScenarios = {
    createCaseOnDoctorSidePage: {
        executor: 'ramping-vus',
        stages: buildStages(rampUpSteps, rampDownSteps, stepDuration, maxVUs, holdDuration),
        exec: 'loadTestCreateCaseOnDoctorSidePage',
    },
    doctorCasesPage: {
        executor: 'ramping-vus',
        stages: buildStages(rampUpSteps, rampDownSteps, stepDuration, maxVUs, holdDuration),
        exec: 'loadTestDoctorCasesPage',
    }
}
const enabledScenarioNames = SELECTED_SCENARIO === 'all'
    ? Object.keys(allScenarios)
    : SELECTED_SCENARIO.split(',').map(s => s.trim());
const filteredScenarios = Object.fromEntries(
    Object.entries(allScenarios).filter(([name]) => enabledScenarioNames.includes(name))
);

const scenarioTags = {
    createCaseOnDoctorSidePage: [
        getOfficeTag,
        getClientTag,
        getAllImpressionsTag,
        getAllTypesTag,
        getAllCategoriesTag,
        getAllAppliancesTag,
        getRxMappingsTag,
        getAllStickersTag,
        getRxWizardGroupsTag,
        postDueDatesTag,
        postCreateCaseTag,
        getCaseTag,
        patchCaseTag,
        deleteCaseTag,
    ],
    doctorCasesPage: [
        getDoctorCasesPageTag,
    ],
};

export const options = {
    scenarios: filteredScenarios,
    thresholds: buildThresholds(enabledScenarioNames, scenarioTags),
    summaryTrendStats: ['avg', 'min', 'med', 'p(75)', 'p(90)', 'p(95)', 'max'],
};

export function setup() {
    const url = `${config.baseUrl}/api/v1/auth/login/`;
    const payload = JSON.stringify({
        username: config.doctorUsername,
        password: config.doctorPassword,
    });
    const headers = {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'POST /auth/login' },
    };

    const response = http.post(url, payload, headers);

    check(response, {
        'login succeeded': (res) => res.status === 200,
    });

    const authToken = response.json('auth_token');
    if (!authToken) {
        throw new Error('--[ERROR]--No auth token received, aborting test.');
    }

    return { authToken: authToken }
}

function postDueDates(authToken) {
    const url = `${config.baseUrl}/api/v1/due-dates`;
    const payload = JSON.stringify(config.dueDatesPayload);
    const headers = buildHeaders(authToken, {}, postDueDatesTag);

    const response = http.post(url, payload, headers);

    check(response, {
        [`${postDueDatesTag} is 200`]: (r) => r.status === 200,
        [`${postDueDatesTag} has due_date in response`]: (r) => r.json('due_date') !== undefined,
    });

    return response.json('due_date');
}

function postCreateCase(authToken, due_date) {
    const url = `${config.baseUrl}/api/v1/cases`;
    const payload = JSON.stringify({
        ...config.createCasePayload,
        due_date: due_date,
    });
    const headers = buildHeaders(authToken, {}, postCreateCaseTag);

    const response = http.post(url, payload, headers);

    check(response, {
        [`${postCreateCaseTag} is 201`]: (r) => r.status === 201,
        [`${postCreateCaseTag} has id in response`]: (r) => r.json('id') !== undefined,
    });

    return response.json('id');
}

function getCase(authToken, caseId) {
    const url = `${config.baseUrl}/api/v1/cases/${caseId}`;
    const headers = buildHeaders(authToken, {}, getCaseTag);

    const response = http.get(url, headers);

    check(response, {
        [`${getCaseTag} is 200`]: (r) => r.status === 200,
        [`${getCaseTag} has id in response`]: (r) => r.json('id') !== undefined,
        [`${getCaseTag} id is equal ${caseId}`]: (r) => r.json('id') === caseId,
    });

    return response.json('id');
}

function updateCase(authToken, caseId) {
    const url = `${config.baseUrl}/api/v1/cases/${caseId}`;
    const payload = JSON.stringify({
        orders: config.createCasePayload.orders,
        patient_first_name: 'John_0',
        patient_last_name: 'Doe_0',
        type: 4,
        file_send_via: 1
    });
    const headers = buildHeaders(authToken, {}, patchCaseTag);

    const response = http.patch(url, payload, headers);

    check(response, {
        [`${patchCaseTag} is 200`]: (r) => r.status === 200,
        [`${patchCaseTag} has id in response`]: (r) => r.json('id') !== undefined,
        [`${patchCaseTag} id is equal ${caseId}`]: (r) => r.json('id') === caseId,
    });

    return response.json('id');
}

function deleteCase(authToken, caseId) {
    const url = `${config.baseUrl}/api/v1/cases/${caseId}`;
    const headers = buildHeaders(authToken, {}, deleteCaseTag, false);

    const response = http.del(url, null, headers);

    check(response, {
        [`${deleteCaseTag} is 204`]: (r) => r.status === 204,
    });
}

export function loadTestCreateCaseOnDoctorSidePage(data) {
    let requests = [
        ['GET', `${config.baseUrl}/api/v1/offices/${config.officeId}`, null, buildHeaders(data.authToken, {}, getOfficeTag)],
        ['GET', `${config.baseUrl}/api/v1/client-users/${config.clientId}`, null, buildHeaders(data.authToken, {}, getClientTag)],
        ['GET', `${config.baseUrl}/api/v1/impressions/`, null, buildHeaders(data.authToken, { get_all: true }, getAllImpressionsTag)],
        ['GET', `${config.baseUrl}/api/v1/types/`, null, buildHeaders(data.authToken, { get_all: true }, getAllTypesTag)],
        ['GET', `${config.baseUrl}/api/v1/categories/`, null, buildHeaders(data.authToken, { get_all: true }, getAllCategoriesTag)],
        ['GET', `${config.baseUrl}/api/v1/appliances/`, null, buildHeaders(data.authToken, { get_all: true }, getAllAppliancesTag)],
        ['GET', `${config.baseUrl}/api/v1/rx-mappings/`, null, buildHeaders(data.authToken, {}, getRxMappingsTag)],
        ['GET', `${config.baseUrl}/api/v1/stickers/`, null, buildHeaders(data.authToken, { get_all: true }, getAllStickersTag)],
        ['GET',
            `${config.baseUrl}/api/v1/impression/${config.impression}` +
            `/type/${config.type}` +
            `/jawtype/${config.jawtype}` +
            `/category/${config.category}` +
            `/appliance/${config.appliance}` +
            `/rxwizard-groups`,
            null,
            buildHeaders(data.authToken, { is_test_office: true }, getRxWizardGroupsTag)
        ],
    ];

    const response = http.batch(requests);

    check(response[0], {
        [`${getOfficeTag} is 200`]: (r) => r.status === 200,
        [`${getOfficeTag} has id in response`]: (r) => r.json('id') !== undefined,
        [`${getOfficeTag} id is equal ${config.officeId}`]: (r) => r.json('id') === config.officeId,
    });

    check(response[1], {
        [`${getClientTag} is 200`]: (r) => r.status === 200,
        [`${getClientTag} has id in response`]: (r) => r.json('id') !== undefined,
        [`${getClientTag} id is equal ${config.clientId}`]: (r) => r.json('id') === config.clientId,
    });

    check(response[2], {
        [`${getAllImpressionsTag} is 200`]: (r) => r.status === 200,
        [`${getAllImpressionsTag} has results array`]: (r) => Array.isArray(r.json('results')),
    });

    check(response[3], {
        [`${getAllTypesTag} is 200`]: (r) => r.status === 200,
        [`${getAllTypesTag} has results array`]: (r) => Array.isArray(r.json('results')),
    });

    check(response[4], {
        [`${getAllCategoriesTag} is 200`]: (r) => r.status === 200,
        [`${getAllCategoriesTag} has results array`]: (r) => Array.isArray(r.json('results')),
    });

    check(response[5], {
        [`${getAllAppliancesTag} is 200`]: (r) => r.status === 200,
        [`${getAllAppliancesTag} has results array`]: (r) => Array.isArray(r.json('results')),
    });

    check(response[6], {
        [`${getRxMappingsTag} is 200`]: (r) => r.status === 200,
        [`${getRxMappingsTag} has published`]: (r) => r.json('published') !== undefined,
        [`${getRxMappingsTag} has testing`]: (r) => r.json('testing') !== undefined,
    });

    check(response[7], {
        [`${getAllStickersTag} is 200`]: (r) => r.status === 200,
        [`${getAllStickersTag} has results array`]: (r) => Array.isArray(r.json('results')),
    });

    check(response[8], {
        [`${getRxWizardGroupsTag} is 200`]: (r) => r.status === 200,
        [`${getRxWizardGroupsTag} has results array`]: (r) => Array.isArray(r.json('results')),
    });

    const dueDate = postDueDates(data.authToken);

    let caseId = postCreateCase(data.authToken, dueDate);

    sleep(1);

    caseId = getCase(data.authToken, caseId);
    caseId = updateCase(data.authToken, caseId);

    sleep(1);

    deleteCase(data.authToken, caseId);

    sleep(1);
}

export function loadTestDoctorCasesPage(data) {
    const url = `${config.baseUrl}/doctor/cases`;
    const headers = buildHeaders(data.authToken, {}, getDoctorCasesPageTag);

    const response = http.get(url, headers);

    check(response, {
        [`${getDoctorCasesPageTag} is 200`]: (r) => r.status === 200,
    });

    sleep(1);
}
