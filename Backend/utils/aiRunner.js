const { spawn } = require('child_process');
const path = require('path');

/**
 * Runs a Python script and returns the parsed JSON output.
 * @param {string} scriptName - Name of the script in utils/ai directory.
 * @param {object} inputData - Data to pass to the script via stdin.
 */
const runAiScript = (scriptName, inputData) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'ai', scriptName);
        const pythonProcess = spawn('python', [scriptPath]);

        let output = '';
        let error = '';

        pythonProcess.stdin.write(JSON.stringify(inputData));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`AI Script ${scriptName} failed with code ${code}: ${error}`));
            }
            try {
                resolve(JSON.parse(output));
            } catch (e) {
                reject(new Error(`Failed to parse AI output from ${scriptName}: ${output}`));
            }
        });
    });
};

module.exports = { runAiScript };
