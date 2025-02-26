const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config()
const environmentVariable = process.env.ENVIRONMENT_VARIABLE || 'local';
// Load the configuration file
const configPath = path.resolve(__dirname, 'config2.json');
let config;

try {
  config = fs.readFileSync(configPath, 'utf8');
  config = config.replaceAll('{{dynamicEnv}}',environmentVariable)
  config = JSON.parse(config);
} catch (err) {
  console.error(`Error reading config file: ${err.message}`);
  process.exit(1);
}

// Function to execute a Python script
const executePythonScript = (operation) => {
  return new Promise((resolve, reject) => {
    console.log(`Starting Python script: ${operation.name}`);

    // Prepare arguments for the Python script
    const scriptArgs = [operation.script];

    if (operation.env) {
      scriptArgs.push('--env', operation.env);
    }

    if (operation.programFile) {
      scriptArgs.push(  operation.fileNameArgument ? operation.fileNameArgument: '--programFile' , operation.programFile);
    }

    console.log(scriptArgs, 'scriptArgs');

    // Spawn the Python process
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
      console.log(`[${operation.name}] python Script exited with code ${code}`);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`[${operation.name}] Script failed with code ${code}`));
      }
    });
  });
};

// Function to execute a JavaScript script
const executeJavascriptScript = (operation) => {
  return new Promise((resolve, reject) => {
    console.log(`Starting JavaScript script: ${operation.name}`);

    // Prepare arguments for the JavaScript script
    const scriptArgs = [operation.script];

    if (operation.env) {
      scriptArgs.push('--env', operation.env);
    }

    if (operation.programFile) {
      scriptArgs.push(operation.fileNameArgument ? operation.fileNameArgument: '--programFile' , operation.programFile);
    }

    // Spawn the Node.js process
    const nodeProcess = spawn('node', scriptArgs);

    // Handle output
    nodeProcess.stdout.on('data', (data) => {
      console.log(`[${operation.name}] Output: ${data.toString()}`);
    });

    // Handle errors
    nodeProcess.stderr.on('data', (data) => {
      console.error(`[${operation.name}] Error: ${data.toString()}`);
    });

    // Handle process exit
    nodeProcess.on('close', (code) => {
      console.log(`[${operation.name}] node Script exited with code ${code}`);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`[${operation.name}] Script failed with code ${code}`));
      }
    });
  });
};

// Function to execute operations sequentially
const executeOperationsSequentially = async (operations) => {
  for (const operation of operations) {
    if (fs.existsSync(operation.script)) {
      const fileExtension = path.extname(operation.script);
      try {
        if (fileExtension === '.py') {
          await executePythonScript(operation);
        } else if (fileExtension === '.js') {
          await executeJavascriptScript(operation);
        } else {
          console.error(`Unsupported script type for operation: ${operation.name}`);
        }
      } catch (error) {
        console.error(error.message);
     //   break; // Stop execution on failure
      }
    } else {
      console.error(`Script not found for operation: ${operation.name}`);
    }
  }
};

// Execute all operations sequentially
executeOperationsSequentially(config);
