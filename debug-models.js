const fs = require('fs');
const path = require('path');

// Simple .env parser
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    const match = envConfig.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
}

async function listModels() {
    if (!apiKey) {
        console.error("No API key found");
        return;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
        } else {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

listModels();
