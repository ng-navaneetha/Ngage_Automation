import { exec } from 'child_process';
import axios from 'axios';
import { TEAMS_WEBHOOK_URL } from './constants/webhookURL.js';


// Function to parse Playwright test summary
function parseSummary(output) {
    const summary = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
    };

    const match = output.match(/Tests:\s+(\d+)\s+passed\s+(\d+)\s+failed\s+(\d+)\s+skipped/);
    if (match) {
        summary.passed = parseInt(match[1]);
        summary.failed = parseInt(match[2]);
        summary.skipped = parseInt(match[3]);
        summary.total = summary.passed + summary.failed + summary.skipped;
    }

    return summary;
}

// Function to send Teams message
async function sendTeamsMessage(summary) {
    const color = summary.failed > 0 ? "FF0000" : "00FF00"; // Red if failed, Green if all passed
    const message = {
        "@type": "MessageCard",
        "@context": "https://schema.org/extensions",
        "summary": "Playwright Test Results",
        "themeColor": color,
        "title": "Playwright Test Results",
        "sections": [{
            "facts": [
                { "name": "Total Tests", "value": summary.total },
                { "name": "Passed", "value": summary.passed },
                { "name": "Failed", "value": summary.failed },
                { "name": "Skipped", "value": summary.skipped }
            ]
        }]
    };

    await axios.post(TEAMS_WEBHOOK_URL, message);
}

// Run Playwright tests
exec('npx playwright test --grep smoke --workers=1', (error, stdout, stderr) => {
    console.log(stdout);
    if (error) {
        console.error(`Error running tests: ${error.message}`);
    }

    const summary = parseSummary(stdout);
    console.log('Summary:', summary);

    sendTeamsMessage(summary)
        .then(() => console.log('Teams message sent!'))
        .catch(err => console.error('Error sending Teams message:', err));
});
