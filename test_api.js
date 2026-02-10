const axios = require('axios');

async function testApi() {
    try {
        console.log('Testing /bfhl endpoint...');
        const response = await axios.post('http://localhost:3000/bfhl', {
            AI: "What is the capital of France?"
        });
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));

        if (response.data.is_success && response.data.data) {
            console.log('SUCCESS: API Key is working!');
        } else {
            console.log('FAILURE: API Key might not be working.');
        }
    } catch (error) {
        console.error('Error testing API:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testApi();
