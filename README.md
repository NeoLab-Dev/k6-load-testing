# k6 Load Testing with Docker, InfluxDB, and Grafana

This project provides a complete setup for running load tests against your CRM using [k6](https://k6.io/) with metrics
storage in [InfluxDB](https://www.influxdata.com/) and visualization via [Grafana](https://grafana.com/).

---

## Stack Overview

- **k6** — load testing tool with JavaScript-based scripting
- **InfluxDB** — time-series database for metrics
- **Grafana** — dashboards to visualize test results
- **Docker Compose** — for container orchestration

---

## Test Scenarios

### `createCaseOnDoctorSidePage`
Simulates a doctor opening the "Create Case" page:
- Performs multiple `GET` requests to fetch form data:
    - Office, client
    - Impressions, types, categories, appliances, stickers
    - Rx mappings and Rx wizard groups
- Does **not** create the case — this only simulates **initial form load**.

### `doctorCasesPage`
Simulates a doctor viewing the list of their cases:
- Single `GET` request to `/doctor/cases`
- Useful for measuring page load under user concurrency


## Quick Start (Locally)

### 1. Clone the project

```bash
git clone https://github.com/NeoLab-Dev/k6-load-testing.git
cd k6-load-testing
```

### 2. Start the infrastructure

```bash
docker-compose up -d
```

### 3. Run a test

```bash
docker-compose run --rm k6 run \
  --env SCENARIO=createCaseOnDoctorSidePage \
  --env ENV=demo \
  --env RAMP_UP_STEPS=2 \
  --env RAMP_DOWN_STEPS=2 \
  --env STEP_DURATION=10s \
  --env HOLD_DURATION=10s \
  --env MAX_VUS=6 \
  --out influxdb=http://influxdb:8086/k6 \
  /k6-tests/load-tests.js
```

| Variable          | Description                                   | Example                      |
|-------------------|-----------------------------------------------|------------------------------|
| `ENV`             | Environment config key (`qa`, `demo`, `prod`) | `demo`                       |
| `SCENARIO`        | Scenario name or `all` to run all             | `createCaseOnDoctorSidePage` |
| `MAX_VUS`         | Maximum number of virtual users               | `6`                          |
| `RAMP_UP_STEPS`   | Number of ramp-up steps                       | `2`                          |
| `RAMP_DOWN_STEPS` | Number of ramp-down steps                     | `2`                          |
| `STEP_DURATION`   | Duration of each ramp step                    | `10s`                        |
| `HOLD_DURATION`   | Duration to hold max VUs                      | `10s`                        |

## Setting Up Grafana

### 1. Go to: http://localhost:3000

### 2. Add InfluxDB as a data source:

- Name: k6influxdb
- URL: http://influxdb:8086
- Database: k6

### 3. Import the k6 Grafana dashboard

- Upload dashboard JSON file: `./k6-load-testing/dashboards/k6-load-testing-dashboard.json`
- Unique identifier (UID): paste from influxDB data source
