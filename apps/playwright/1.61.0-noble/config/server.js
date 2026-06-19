const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/test-results', express.static(path.join(__dirname, 'test-results')));
app.use('/tests', express.static(path.join(__dirname, 'tests')));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Playwright Test Environment</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 50px auto; 
                padding: 20px;
                background: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .btn { 
                background: #007bff; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer; 
                margin: 5px;
                text-decoration: none;
                display: inline-block;
            }
            .btn:hover { background: #0056b3; }
            .section { 
                margin: 20px 0; 
                padding: 20px; 
                border: 1px solid #ddd; 
                border-radius: 8px; 
                background: #f9f9f9;
            }
            .status { color: #28a745; font-weight: bold; }
            .code { 
                background: #f8f9fa; 
                padding: 10px; 
                border-radius: 4px; 
                font-family: monospace; 
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎭 Playwright Test Environment</h1>
            <p class="status">✅ Environment is ready!</p>
            
            <div class="section">
                <h2>Quick Actions</h2>
                <button class="btn" onclick="runTests()">Run All Tests</button>
                <a class="btn" href="/test-results" target="_blank">View Reports</a>
                <button class="btn" onclick="generateExample()">Generate Example Test</button>
            </div>
            
            <div class="section">
                <h2>Environment Info</h2>
                <p><strong>Playwright Version:</strong> v1.55.0</p>
                <p><strong>Available Browsers:</strong> Chromium, Firefox, WebKit</p>
                <p><strong>Test Directory:</strong> ./tests</p>
                <p><strong>Reports Directory:</strong> ./test-results</p>
            </div>
            
            <div class="section">
                <h2>Usage Instructions</h2>
                <ol>
                    <li>Upload test files to the <code>tests/</code> directory</li>
                    <li>Configure tests in <code>playwright.config.ts</code></li>
                    <li>Run tests using the button above or CLI command</li>
                    <li>View HTML reports in the test-results directory</li>
                </ol>
                
                <h3>Example Test Code</h3>
                <div class="code">
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});
                </div>
            </div>
        </div>
        
        <script>
            function runTests() {
                fetch('/api/run-tests', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        alert('Tests started: ' + data.message);
                        setTimeout(() => {
                            window.open('/test-results', '_blank');
                        }, 3000);
                    })
                    .catch(err => alert('Error: ' + err));
            }
            
            function generateExample() {
                fetch('/api/generate-example', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => alert('Example generated: ' + data.message))
                    .catch(err => alert('Error: ' + err));
            }
        </script>
    </body>
    </html>
  `);
});

app.post('/api/run-tests', (req, res) => {
  const testProcess = spawn('npx', ['playwright', 'test'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });
  
  res.json({ message: 'Tests execution started, check reports in 30 seconds' });
});

app.post('/api/generate-example', (req, res) => {
  const exampleTest = `import { test, expect } from '@playwright/test';

test('playwright homepage test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
  
  // create a locator
  const getStarted = page.getByRole('link', { name: 'Get started' });
  
  // Expect an attribute "to be strictly equal" to the value.
  await expect(getStarted).toHaveAttribute('href', '/docs/intro');
  
  // Click the get started link.
  await getStarted.click();
  
  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/.*intro/);
});

test('example.com test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle('Example Domain');
  await expect(page.locator('h1')).toContainText('Example Domain');
});`;
  
  if (!fs.existsSync('./tests')) {
    fs.mkdirSync('./tests', { recursive: true });
  }
  
  fs.writeFileSync('./tests/example.spec.ts', exampleTest);
  res.json({ message: 'Example test generated at ./tests/example.spec.ts' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🎭 Playwright server running at http://0.0.0.0:${port}`);
  console.log(`📊 Test reports will be available at http://0.0.0.0:${port}/test-results`);
});