const axios = require('axios');

const API_KEY = 'AIzaSyAfAhiXNYxFXzpFysV7YI3bI6a-0rKNCkI';
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    try {
        console.log('Listing Gemini Models...');
        console.log('URL:', URL);
        const response = await axios.get(URL);

        const fs = require('fs');
        console.log('Success! Found models:');
        const models = response.data.models || [];
        const modelNames = models.map(m => m.name).join('\n');
        fs.writeFileSync('models.txt', modelNames);
        console.log('Saved models to models.txt');
    } catch (error) {
        console.error('Error listing models:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
}

listModels();
