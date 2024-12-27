const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
// user role role & state
// userprofile id key & not blank
// Path to the JSON configuration file
const CONFIG_FILE = path.join(__dirname, 'config.json');

// Function to execute a script
function executeScript(name, scriptPath, envFilePath) {
  console.log(`Starting operation: ${name}`);
  const scriptFullPath = path.resolve(scriptPath);

  if (!fs.existsSync(scriptFullPath)) {
    console.error(`Error: Script file not found at ${scriptFullPath}`);
    return;
  }

    // Load the .env file if specified
    let customEnv = {};
    if (envFilePath && fs.existsSync(envFilePath)) {
      console.log(`Loading environment variables from ${envFilePath}`);
      const dotenv = require('dotenv');
      customEnv = dotenv.config({ path: envFilePath }).parsed || {};
    } else {
      console.warn(`Warning: .env file not found at ${envFilePath}. Proceeding without custom env.`);
    }

    const child = spawn('node', [scriptFullPath], {
      stdio: 'inherit', // Show output in the console
      cwd: path.dirname(scriptFullPath), // Set working directory to the script's location
      env: {
        ...process.env, // Inherit the main process environment
        ...customEnv,   // Inject custom environment variables
      },
    });

  child.on('close', (code) => {
    if (code === 0) {
      console.log(`Operation "${name}" completed successfully.`);
    } else {
      console.error(`Operation "${name}" failed with exit code ${code}.`);
    }
  });

  child.on('error', (err) => {
    console.error(`Failed to start operation "${name}":`, err);
  });
}

// Main function
function main() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(`Configuration file not found at ${CONFIG_FILE}`);
    process.exit(1);
  }

  // Read the configuration file
  const configData = fs.readFileSync(CONFIG_FILE, 'utf-8');
  let operations;

  try {
    operations = JSON.parse(configData);
  } catch (err) {
    console.error('Error parsing configuration file:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(operations)) {
    console.error('Configuration file must contain an array of operations.');
    process.exit(1);
  }

  // Iterate over each operation and execute the script
  operations.forEach(({ name, script, env }) => {
    if (name && script) {
      const envFilePath = env ? path.resolve(__dirname, env) : null; // Resolve .env path if provided
    
      executeScript(name, script,envFilePath);
    } else {
      console.warn('Skipping invalid operation:', { name, script });
    }
  });
}

// Run the main function
main();
