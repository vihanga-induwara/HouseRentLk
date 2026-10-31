// k6 load test for the public read paths of the API.
// Usage: k6 run -e BASE_URL=https://staging-api.example.com Backend/scripts/loadtest/smoke.k6.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
    stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 50 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<800'],
    },
};

const TOWNS = ['Colombo', 'Kandy', 'Galle', 'Nugegoda', 'Negombo'];

export default function () {
    const town = TOWNS[Math.floor(Math.random() * TOWNS.length)];

    const list = http.get(`${BASE_URL}/api/listings?page=1&limit=12&town=${town}`);
    check(list, { 'browse 200': (r) => r.status === 200 });

    const listings = list.status === 200 ? list.json('data') : [];
    if (listings && listings.length) {
        const id = listings[Math.floor(Math.random() * listings.length)]._id;
        const detail = http.get(`${BASE_URL}/api/listings/${id}`);
        check(detail, { 'detail 200': (r) => r.status === 200 });
        http.get(`${BASE_URL}/api/listings/${id}/similar`);
    }

    check(http.get(`${BASE_URL}/api/settings`), { 'settings 200': (r) => r.status === 200 });
    sleep(1 + Math.random() * 2);
}
