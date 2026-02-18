const { exec } = require('child_process');
const path = require('path');

console.log('Running Playwright tests for BasketballHub...');

const testCommand = 'npx playwright test tests/basketball-hub.spec.ts --reporter=line';

exec(testCommand, { cwd: __dirname }, (error, stdout, stderr) => {
  console.log('=== STDOUT ===');
  console.log(stdout);
  
  if (stderr) {
    console.log('=== STDERR ===');
    console.log(stderr);
  }
  
  if (error) {
    console.log('=== ERROR ===');
    console.error(error);
  }
  
  console.log('Test execution completed.');
});