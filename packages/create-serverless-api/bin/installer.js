"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
// @ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
const child_process_1 = require("child_process");
const semver = __importStar(require("semver"));
const https = __importStar(require("https"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const os = __importStar(require("os"));
const cross_spawn_1 = __importDefault(require("cross-spawn"));
let projectName;
let type;
const commonDependencies = {
    default: [
        '@serverless_api/core',
    ],
    dev: [
        '@types/node',
        'ts-loader',
        'ts-node',
        'typescript',
        'webpack',
        'webpack-cli',
        'webpack-node-externals',
        'serverless',
        'serverless-dotenv-plugin',
        'serverless-plugin-typescript',
        'serverless-webpack',
    ],
};
let customDependencies;
function init() {
    const program = new commander_1.Command(package_json_1.default.name);
    program.arguments('<project-directory> <type>')
        .usage(`${chalk_1.default.green('<project-directory>')} ${chalk_1.default.cyan('<type>')}`)
        .action((name, t) => {
        projectName = name;
        type = t;
    })
        .on('--help', () => {
        console.log(`    ${chalk_1.default.green('<project-directory>')} ${chalk_1.default.cyan('<type>')} are required.`);
        console.log(`    ${chalk_1.default.cyan('<type>')} values can be aws-lambda or google-cloud-functions.`);
    })
        .option('<type>')
        .usage(`${chalk_1.default.green('aws-lambda or google-cloud-functions')}`)
        .on('--help', () => {
        console.log(`    Only ${chalk_1.default.green('<type>')} is required.`);
    }).parse(process.argv);
    checkLatestVersion().catch(() => {
        try {
            return (0, child_process_1.execSync)('npm view create-serverless-api version').toString().trim();
        }
        catch (e) {
            return null;
        }
    }).then(latest => {
        if (latest && semver.lt(package_json_1.default.version, latest)) {
            console.log();
            console.error(chalk_1.default.yellow(`You are running \`create-serverless-api\` ${package_json_1.default.version}, which is behind the latest release (${latest}).\n\n` +
                'We recommend always using the latest version of create-serverless-api if possible.'));
            console.log();
            console.log('The latest instructions for creating a new app can be found here:\n' +
                '{{url}}');
            console.log();
        }
        else {
            if (typeof projectName === 'undefined') {
                console.error('Please specify the project directory:');
                console.log(`    ${chalk_1.default.cyan(program.name())} ${chalk_1.default.green('<project-directory>')}`);
                console.log();
                console.log('For example:');
                console.log(`    ${chalk_1.default.cyan(program.name())} ${chalk_1.default.green('my-serverless-api')}`);
                console.log();
                console.log(`Run ${chalk_1.default.cyan(`${program.name()} --help`)} to see all options.`);
                process.exit(1);
            }
            if (typeof type === 'undefined') {
                console.error('Please specify the project type:');
                console.log(`    ${chalk_1.default.cyan(program.name())} ${chalk_1.default.green('<type>')}`);
                console.log();
                console.log('For example:');
                console.log(`    ${chalk_1.default.cyan(program.name())} ${chalk_1.default.green('my-serverless-api')} ${chalk_1.default.cyan('aws-lambda')}`);
                console.log();
                console.log(`Run ${chalk_1.default.cyan(`${program.name()} --help`)} to see all options.`);
                process.exit(1);
            }
            createApp(projectName, type);
        }
    });
}
exports.init = init;
function createApp(name, type) {
    const root = path.resolve(name);
    const appName = path.basename(root);
    fs.ensureDirSync(name);
    console.log(`Creating a new ${chalk_1.default.cyan(type)} api in ${chalk_1.default.green(root)}.`);
    console.log();
    const packageJson = {
        name: appName,
        version: '0.1.0',
        private: true,
    };
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2) + os.EOL);
    const originalDirectory = process.cwd();
    process.chdir(root);
    if (!checkThatNpmCanReadCwd()) {
        process.exit(1);
    }
    return run(root, appName, originalDirectory, type);
}
function checkLatestVersion() {
    return new Promise((resolve, reject) => {
        https
            .get('https://registry.npmjs.org/-/package/@serverless_api/create-serverless-api/dist-tags', res => {
            if (res.statusCode === 200) {
                let body = '';
                res.on('data', data => (body += data));
                res.on('end', () => {
                    resolve(JSON.parse(body).latest);
                });
            }
            else {
                reject();
            }
        })
            .on('error', () => {
            reject();
        });
    });
}
function checkThatNpmCanReadCwd() {
    const cwd = process.cwd();
    let childOutput = null;
    try {
        // Note: intentionally using spawn over exec since
        // the problem doesn't reproduce otherwise.
        // `npm config list` is the only reliable way I could find
        // to reproduce the wrong path. Just printing process.cwd()
        // in a Node process was not enough.
        childOutput = cross_spawn_1.default.sync('npm', ['config', 'list']).output.join('');
    }
    catch (err) {
        // Something went wrong spawning node.
        // Not great, but it means we can't do this check.
        // We might fail later on, but let's continue.
        return true;
    }
    if (typeof childOutput !== 'string') {
        return true;
    }
    const lines = childOutput.split('\n');
    // `npm config list` output includes the following line:
    // "; cwd = C:\path\to\current\dir" (unquoted)
    // I couldn't find an easier way to get it.
    const prefix = '; cwd = ';
    const line = lines.find(line => line.startsWith(prefix));
    if (typeof line !== 'string') {
        // Fail gracefully. They could remove it.
        return true;
    }
    const npmCWD = line.substring(prefix.length);
    if (npmCWD === cwd) {
        return true;
    }
    console.error(chalk_1.default.red(`Could not start an npm process in the right directory.\n\n` +
        `The current directory is: ${chalk_1.default.bold(cwd)}\n` +
        `However, a newly started npm process runs in: ${chalk_1.default.bold(npmCWD)}\n\n` +
        `This is probably caused by a misconfigured system terminal shell.`));
    if (process.platform === 'win32') {
        console.error(chalk_1.default.red(`On Windows, this can usually be fixed by running:\n\n`) +
            `  ${chalk_1.default.cyan('reg')} delete "HKCU\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n` +
            `  ${chalk_1.default.cyan('reg')} delete "HKLM\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n\n` +
            chalk_1.default.red(`Try to run the above two lines in the terminal.\n`) +
            chalk_1.default.red(`To learn more about this problem, read: https://blogs.msdn.microsoft.com/oldnewthing/20071121-00/?p=24433/`));
    }
    return false;
}
function run(root, appName, originalDirectory, type) {
    console.log(commonDependencies, customDependencies);
    const dependencies = commonDependencies.default.concat([`@serverless_api/${type}`]).concat(customDependencies[type].default);
    const devDependencies = commonDependencies.dev.concat(customDependencies[type].dev);
    console.log('Installing packages. This might take a couple of minutes.');
    return install(root, dependencies).catch(reason => {
        console.log();
        console.log('Aborting installation.');
        if (reason.command) {
            console.log(`  ${chalk_1.default.cyan(reason.command)} has failed.`);
        }
        else {
            console.log(chalk_1.default.red('Unexpected error. Please report it as a bug:'));
            console.log(reason);
        }
        console.log();
        // On 'exit' we will delete these files from target directory.
        const knownGeneratedFiles = ['package.json', 'node_modules'];
        const currentFiles = fs.readdirSync(path.join(root));
        currentFiles.forEach(file => {
            knownGeneratedFiles.forEach(fileToMatch => {
                // This removes all knownGeneratedFiles.
                if (file === fileToMatch) {
                    console.log(`Deleting generated file... ${chalk_1.default.cyan(file)}`);
                    fs.removeSync(path.join(root, file));
                }
            });
        });
        const remainingFiles = fs.readdirSync(path.join(root));
        if (!remainingFiles.length) {
            // Delete target folder if empty
            console.log(`Deleting ${chalk_1.default.cyan(`${appName}/`)} from ${chalk_1.default.cyan(path.resolve(root, '..'))}`);
            process.chdir(path.resolve(root, '..'));
            fs.removeSync(path.join(root));
        }
        console.log('Done.');
        process.exit(1);
    }).then(() => install(root, devDependencies, true));
}
function install(root, dependencies, dev = false) {
    return new Promise((resolve, reject) => {
        const command = 'npm';
        const args = [
            'install',
            !dev ? '--save' : '--save-dev',
            '--save-exact',
            '--loglevel',
            'error',
        ].concat(dependencies);
        const child = (0, cross_spawn_1.default)(command, args, { stdio: 'inherit' });
        child.on('close', code => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    });
}
