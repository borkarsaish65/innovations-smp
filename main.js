const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load the configuration file
const configPath = path.resolve(__dirname, 'config2.json');
let config;

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error(`Error reading config file: ${err.message}`);
  process.exit(1);
}

// Function to execute a Python script
const executePythonScript = (operation) => {
  console.log(`Starting: ${operation.name}`);
  
  // Prepare arguments for the Python script
  const scriptArgs = [operation.script, '--env', operation.env, '--programFile' , operation.programFile];
  
  // Spawn the Python process (use python3 if that's how you normally invoke it)
  const pythonProcess = spawn('python3', scriptArgs);

  // Handle output
  pythonProcess.stdout.on('data', (data) => {
    console.log(`[${operation.name}] Output: ${data.toString()}`);
  });

  // Handle errors
  pythonProcess.stderr.on('data', (data) => {
    console.error(`[${operation.name}] Error: ${data.toString()}`);
  });

  // Handle process exit
  pythonProcess.on('close', (code) => {
    console.log(`[${operation.name}] Script exited with code ${code}`);
  });
};

// Iterate over each operation in the configuration
config.forEach((operation) => {
  if (fs.existsSync(operation.script)) {
    executePythonScript(operation);
  } else {
    console.error(`Script not found for operation: ${operation.name}`);
  }
});
