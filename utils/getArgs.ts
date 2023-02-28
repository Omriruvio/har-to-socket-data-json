import * as fs from 'fs';
import chalk from 'chalk';
const log = console.log;

// Parse command line arguments
// supports -f and --f for file path
// supports -o and --o for output path
// support -h and --h for help

export const getArgs = () => {
  let harFilePath: string | undefined;
  let outputFilePath: string | undefined;

  const argsMap = new Map();
  process.argv.slice(2).forEach((arg) => {
    const key = arg.split('=')[0];
    const value = arg.split('=')[1];
    argsMap.set(key, value);
  });

  if (argsMap.has('--f') || argsMap.has('-f')) {
    harFilePath = argsMap.get('--f') || argsMap.get('-f');
    if (!harFilePath?.endsWith('.har')) harFilePath = `${harFilePath}.har`;
    if (!fs.existsSync(harFilePath)) {
      log(`File path is not valid, please try again`);
      process.exit(1);
    }
  }

  if (argsMap.has('--o') || argsMap.has('-o')) {
    outputFilePath = argsMap.get('--o') || argsMap.get('-o');
    if (!outputFilePath) {
      log(`Output path is not valid, please try again`);
      process.exit(1);
    }
    log(`Setting output path to ${outputFilePath}`);
  }

  if (argsMap.has('--h') || argsMap.has('-h')) {
    log(chalk.blue(`                                                                   `));
    log(chalk.blue(`██╗  ██╗ █████╗ ██████╗ ██████╗      ██╗███████╗ ██████╗ ███╗   ██╗`));
    log(chalk.blue(`██║  ██║██╔══██╗██╔══██╗╚════██╗     ██║██╔════╝██╔═══██╗████╗  ██║`));
    log(chalk.blue(`███████║███████║██████╔╝ █████╔╝     ██║███████╗██║   ██║██╔██╗ ██║`));
    log(chalk.blue(`██╔══██║██╔══██║██╔══██╗██╔═══╝ ██   ██║╚════██║██║   ██║██║╚██╗██║`));
    log(chalk.blue(`██║  ██║██║  ██║██║  ██║███████╗╚█████╔╝███████║╚██████╔╝██║ ╚████║`));
    log(chalk.blue(`╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝`));
    log(chalk.blue(`                                                                   `));
    log(chalk.yellow(`                  Created by: Omri Ruvio                         `));
    log(chalk.blue(`
    This tool will convert a HAR file to a JSON file.
    Output includes Socket events data & timing.
    `));
    log(chalk.blue("Usage: ts-node index.js -f=" + chalk.yellow("<path to har file>") + " -o=" + chalk.yellow("<path to output file>")));

    // log(`Usage: node index.js --f=<path to har file> --o=<path to output file>`);
    process.exit(0);
  }

  return { harFilePath, outputFilePath };
};