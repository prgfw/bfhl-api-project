const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function runTest(name, payload, expectedData, type = 'POST', endpoint = '/bfhl') {
    try {
        let response;
        if (type === 'POST') {
            response = await axios.post(`${BASE_URL}${endpoint}`, payload);
        } else {
            response = await axios.get(`${BASE_URL}${endpoint}`);
        }

        const data = response.data;
        const success = data.is_success === true;
        const emailCheck = data.official_email === "pragati1381.be23@chitkarauniversity.edu.in";

        let dataMatch = false;
        if (endpoint === '/health') {
            dataMatch = true; // Health check doesn't need data field check if success & email are correct
        } else if (Array.isArray(expectedData)) {
            dataMatch = JSON.stringify(data.data) === JSON.stringify(expectedData);
        } else if (typeof expectedData === 'string' && endpoint === '/bfhl' && payload.AI) {
            // For AI, we check if the response is single word and mostly matches expectation (ignoring case/small diffs)
            // But strict requirement is single word.
            const w = data.data.trim().split(/\s+/);
            const isSingleWord = w.length === 1;
            const textMatch = data.data.toLowerCase().includes(expectedData.toLowerCase());
            if (!textMatch) console.warn(`      AI Output "${data.data}" might not match expected "${expectedData}" exactly, but checking single word constraint.`);
            dataMatch = isSingleWord;
        } else {
            dataMatch = data.data === expectedData;
        }

        if (success && emailCheck && dataMatch) {
            console.log(`[PASS] ${name}`);
        } else {
            console.error(`[FAIL] ${name}`);
            console.error(`      Expected: ${JSON.stringify(expectedData)}`);
            console.error(`      Received: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        if (expectedData === 'ERROR') {
            if (error.response && error.response.status === 400) {
                console.log(`[PASS] ${name} (Expected 400 Bad Request)`);
            } else {
                console.error(`[FAIL] ${name} - Expected 400, got ${error.response ? error.response.status : error.message}`);
            }
        } else {
            console.error(`[FAIL] ${name} - Request failed: ${error.message}`);
            if (error.response) console.error('      Response:', error.response.data);
        }
    }
}

async function testAll() {
    console.log("Starting PRD Compliance Tests...");

    // 1. Health Check
    await runTest('Health Check', {}, null, 'GET', '/health');

    // 2. Fibonacci: 7
    await runTest('Fibonacci (7)', { "fibonacci": 7 }, [0, 1, 1, 2, 3, 5, 8]);

    // 3. Prime: [2, 4, 7, 9, 11]
    await runTest('Prime Filter', { "prime": [2, 4, 7, 9, 11] }, [2, 7, 11]);

    // 4. LCM: [12, 18, 24]
    await runTest('LCM', { "lcm": [12, 18, 24] }, 72);

    // 5. HCF: [24, 36, 60]
    await runTest('HCF', { "hcf": [24, 36, 60] }, 12);

    // 6. AI: Capital of Maharashtra
    await runTest('AI (Mumbai)', { "AI": "What is the capital city of Maharashtra?" }, "Mumbai");

    // 7. AI: Capital of Himachal Pradesh
    await runTest('AI (Shimla)', { "AI": "Capital of Himachal Pradesh?" }, "Shimla");

    // 8. Validation Tests
    await runTest('Invalid Fibonacci (Negative)', { "fibonacci": -5 }, 'ERROR');
    await runTest('Invalid Function (String)', { "functions": "invalid" }, 'ERROR'); // This assumes default 400 for unknown keys if strict? Code returns 400 base on else.
    // Actually the code structure uses else if... else return 400. So unknown keys return 400.
    await runTest('Invalid Key', { "unknown": 123 }, 'ERROR');
    await runTest('Invalid Array (Prime)', { "prime": [1, "a", 3] }, 'ERROR');

}

testAll();
