import http from 'k6/http';
import { check, sleep } from 'k6';
import { envConfig } from "./env-config.js";
import { buildHeaders } from "./utils.js";

const ENV = __ENV.ENV || 'qa';
const config = envConfig[ENV];

export const options = {
    scenarios: {
        loadTestingScenario: {
            executor: 'ramping-vus',
            startVUs: 0,
            gracefulRampDown: '30s',
            stages: [
                { duration: '10s', target: 3 },
                { duration: '5s', target: 5 },
                { duration: '10s', target: 10 },
                { duration: '5s', target: 6 },
                { duration: '10s', target: 0 },
            ],
            exec: 'testAPI',
        },
    },
    thresholds: {
        'http_req_duration{name:POST /due-dates}': ['p(95)<2000'],
        'http_req_failed': ['rate<0.01'],
        'checks': ['rate>0.95'],
    },
};

export function setup() {
    const url = `${config.baseUrl}/auth/login/`;
    const payload = JSON.stringify({
        username: config.doctorUsername,
        password: config.doctorPassword,
    });
    const headers = {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'POST /auth/login' },
    };

    const response = http.post(url, payload, headers,);

    check(response, {
        'login succeeded': (res) => res.status === 200,
    });

    const authToken = response.json('auth_token');
    if (!authToken) {
        throw new Error('--[ERROR]--No auth token received, aborting test.');
    }

    return { authToken: authToken }
}

function postDueDates(data) {
    const url = `${config.baseUrl}/due-dates`;
    const payload = JSON.stringify(config.dueDatesPayload);
    const headers = buildHeaders(data.authToken, {}, 'POST /due-dates')

    const response = http.post(url, payload, headers);

    check(response, {
        'POST /due-dates is 200': (r) => r.status === 200,
        'has due_date in response': (r) => r.json('due_date') !== undefined,
    });
}

export function testAPI(data) {
    postDueDates(data)

    sleep(1)
}
