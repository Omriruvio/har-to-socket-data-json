import * as fs from 'fs';

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
      console.log(`File ${harFilePath} does not exist, please try again`);
      process.exit(1);
    }
  }

  if (argsMap.has('--o') || argsMap.has('-o')) {
    outputFilePath = argsMap.get('--o') || argsMap.get('-o');
    console.log(`Setting output path to ${outputFilePath}`);
  }

  return { harFilePath, outputFilePath };
};