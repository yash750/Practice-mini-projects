import fs from 'fs';
import path from 'path';
import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('../.env') });

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID;
const REPORT_PATH = path.resolve('../html-report/report.html');
const RESULTS_PATH = path.resolve('../html-report/jest-results.json');
const SUMMARY_PATH = './test-summary.txt';

// 🔢 Extract test count and coverage summary
function generateTestSummary() {
  try {
    const resultsRaw = fs.readFileSync(RESULTS_PATH, 'utf-8');
    const results = JSON.parse(resultsRaw);

    const totalTests = results.numTotalTests;
    const passed = results.numPassedTests;
    const failed = results.numFailedTests;
    const skipped = results.numPendingTests;

    let summaryText = `
                        🧪 *Test Summary*
                        • ✅ Passed: ${passed}
                        • ❌ Failed: ${failed}
                        • 🔃 Skipped: ${skipped}
                        • 📊 Total: ${totalTests}
                        `;

    summaryText = summaryText.trim();
    fs.writeFileSync(SUMMARY_PATH, summaryText);
    return summaryText;

  } catch (err) {
    return '⚠️ Could not read test results or coverage.';
  }
}

async function uploadToSlack() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error('❌ HTML report not found.');
    return;
  }

  const summary = generateTestSummary();

  try {
    const result = await slack.files.uploadV2({
      channel_id: CHANNEL_ID,
      initial_comment: `✅ *Test Report*\n${summary}`,
      file_uploads: [
        {
          file: fs.createReadStream(REPORT_PATH),
          filename: 'jest-report.html',
          title: '📎 Jest HTML Report'
        },
        {
          file: fs.createReadStream(SUMMARY_PATH),
          filename: 'jest-summary.txt',
          title: '📄 Jest Test Summary'
        }
      ]
    });

    if (result.ok) {
      console.log('✅ Report and summary uploaded to Slack.');
    } else {
      console.error('Slack error:', result.error);
    }
  } catch (err) {
    console.error('❌ Slack upload failed:', err.message);
    console.log('Full error:', err.data || err);
  }
}

uploadToSlack();
