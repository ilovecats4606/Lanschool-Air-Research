"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execAndSpawn = void 0;
const child_process_1 = require("child_process");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
function splitParameterString(paramString) {
    const regex = /[^\s"]+|"([^"]*)"/gi;
    const matches = paramString.match(regex) || [];
    return matches.map((match) => (match.charAt(0) === '"' && match.charAt(match.length - 1) === '"') ? match.slice(1, -1) : match);
}
function execAndSpawn(command, options) {
    if (process.platform === 'darwin') {
        return exec(command, options);
    }
    let parameters = splitParameterString(command);
    if (!parameters || parameters.length === 0)
        return Promise.reject('execAndSpawn(): No command found.');
    for (let i = 0; i < parameters.length; i++) {
        parameters[i] = parameters[i].replace(/&quot;/g, '"');
    }
    return new Promise((resolve, reject) => {
        const childProcess = (0, child_process_1.spawn)(parameters[0], parameters.length > 0 ? parameters.slice(1) : undefined, options);
        let stdout = '';
        let stderr = '';
        childProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        childProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        childProcess.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            }
            else {
                reject(new Error(`Command failed with code ${code}\n${stderr}`));
            }
        });
        childProcess.on('error', (error) => {
            reject(error);
        });
    });
}
exports.execAndSpawn = execAndSpawn;
//# sourceMappingURL=execAndSpawn.js.map