import { Command } from 'commander';
import chalk from 'chalk';
// @ts-ignore
import packageJson from '../package.json';
import { execSync } from 'child_process';
import * as semver from 'semver';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import spawn from 'cross-spawn';

let projectName: string | undefined;
let type: string | undefined;

export function init() {
    const program = new Command(packageJson.name);
    program.argument('<project-directory>')
        .usage(`${chalk.green('<project-directory>')} [options]`)
        .action(name => {
            console.debug('dir', name);
            projectName = name;
            console.debug('project name', name);
        })
        .on('--help', () => {
            console.log(`    Only ${chalk.green('<project-directory>')} is required.`);
        });

    program.argument('<type>')
        .usage(`${chalk.green('aws-lambda or google-cloud-functions')}`)
        .action(name => {
            type = name;
        })
        .on('--help', () => {
            console.log(`    Only ${chalk.green('<type>')} is required.`);
        });

    checkLatestVersion().catch(() => {
        try {
            return execSync('npm view create-serverless-api version').toString().trim();
        } catch (e) {
            return null;
        }
    }).then(latest => {
        if (latest && semver.lt(packageJson.version, latest)) {
            console.log();
            console.error(
                chalk.yellow(
                    `You are running \`create-serverless-api\` ${packageJson.version}, which is behind the latest release (${latest}).\n\n` +
                    'We recommend always using the latest version of create-serverless-api if possible.'
                )
            );
            console.log();
            console.log(
                'The latest instructions for creating a new app can be found here:\n' +
                '{{url}}'
            );
            console.log();
        } else {
            console.debug('typeof project name', typeof projectName);
            if (typeof projectName === 'undefined') {
                console.error('Please specify the project directory:');
                console.log(`    ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`);
                console.log();
                console.log('For example:');
                console.log(`    ${chalk.cyan(program.name())} ${chalk.green('my-serverless-api')}`);
                console.log();
                console.log(
                    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
                );
                process.exit(1);
            }

            createApp(projectName);
        }
    });
}

function createApp(name: string) {
    const root = path.resolve(name);
    const appName = path.basename(root);

    fs.ensureDirSync(name);

    console.log(`Creating a new Serverless api in ${chalk.green(root)}.`);
    console.log();

    const packageJson = {
        name: appName,
        version: '0.1.0',
        private: true,
    };

    fs.writeFileSync(
        path.join(root, 'package.json'),
        JSON.stringify(packageJson, null, 2) + os.EOL
    );

    const originalDirectory = process.cwd();
    process.chdir(root);
    if (!checkThatNpmCanReadCwd()) {
        process.exit(1);
    }

    return run(root, appName, originalDirectory);
}

function checkLatestVersion(): Promise<string> {
    return new Promise((resolve, reject)=> {
        https
            .get(
                'https://registry.npmjs.org/-/package/@serverless_api/create-serverless-api/dist-tags',
                res => {
                    if (res.statusCode === 200) {
                        let body = '';
                        res.on('data', data => (body += data));
                        res.on('end', () => {
                            resolve(JSON.parse(body).latest);
                        });
                    } else {
                        reject();
                    }
                }
            )
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
        childOutput = spawn.sync('npm', ['config', 'list']).output.join('');
    } catch (err) {
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
    console.error(
        chalk.red(
            `Could not start an npm process in the right directory.\n\n` +
            `The current directory is: ${chalk.bold(cwd)}\n` +
            `However, a newly started npm process runs in: ${chalk.bold(
                npmCWD
            )}\n\n` +
            `This is probably caused by a misconfigured system terminal shell.`
        )
    );
    if (process.platform === 'win32') {
        console.error(
            chalk.red(`On Windows, this can usually be fixed by running:\n\n`) +
            `  ${chalk.cyan(
                'reg'
            )} delete "HKCU\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n` +
            `  ${chalk.cyan(
                'reg'
            )} delete "HKLM\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n\n` +
            chalk.red(`Try to run the above two lines in the terminal.\n`) +
            chalk.red(
                `To learn more about this problem, read: https://blogs.msdn.microsoft.com/oldnewthing/20071121-00/?p=24433/`
            )
        );
    }
    return false;
}

function run(root: string, appName: string, originalDirectory: string) {
    const allDependencies = ['@serverless_api/core', `@serverless_api/${type}`];

    console.log('Installing packages. This might take a couple of minutes.');

    return install(root, allDependencies).catch(reason => {
        console.log();
        console.log('Aborting installation.');
        if (reason.command) {
            console.log(`  ${chalk.cyan(reason.command)} has failed.`);
        } else {
            console.log(
                chalk.red('Unexpected error. Please report it as a bug:')
            );
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
                    console.log(`Deleting generated file... ${chalk.cyan(file)}`);
                    fs.removeSync(path.join(root, file));
                }
            });
        });
        const remainingFiles = fs.readdirSync(path.join(root));
        if (!remainingFiles.length) {
            // Delete target folder if empty
            console.log(
                `Deleting ${chalk.cyan(`${appName}/`)} from ${chalk.cyan(
                    path.resolve(root, '..')
                )}`
            );
            process.chdir(path.resolve(root, '..'));
            fs.removeSync(path.join(root));
        }
        console.log('Done.');
        process.exit(1);
    });
}

function install(root: string, dependencies: string[]) {
    return new Promise<void>((resolve, reject) => {
        const command = 'npm';
        const args = [
            'install',
            //'--no-audit', // https://github.com/facebook/create-react-app/issues/11174
            '--save',
            '--save-exact',
            '--loglevel',
            'error',
        ].concat(dependencies);
        const child = spawn(command, args, {stdio: 'inherit'});
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