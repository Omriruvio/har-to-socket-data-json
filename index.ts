import { harToSocketDataJson } from './harToSocketDataJson';
import * as fs from 'fs';
let harFilePath: string;

// get the file path from the execution command which will be npx ts-node index.ts --harFilePath=<path>
const args = process.argv.slice(2);
const key = args[0].split('=')[0];
if (args.length > 0 && key === '--harFilePath') {
  harFilePath = args[0].split('=')[1];
  if (!harFilePath.endsWith('.har')) harFilePath = `${harFilePath}.har`;
  if (!fs.existsSync(harFilePath)) {
    console.log('File does not exist, please try again');
    process.exit(1);
  }
}

const prompt = (question: string) => {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdin.resume();
    stdout.write(question);

    stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });

    stdin.once('error', (err) => {
      reject(err);
    });
  });
};

const getHarFileFromPrompt = async () => {
  if (harFilePath) return harFilePath;
  harFilePath = (await prompt('Enter path to HAR file: ')) as string;
  if (!harFilePath.endsWith('.har')) harFilePath = `${harFilePath}.har`;

  while (!fs.existsSync(harFilePath)) {
    harFilePath = (await prompt('File does not exist, please try again: ')) as string;
    if (!harFilePath.endsWith('.har')) harFilePath = `${harFilePath}.har`;
  }

  return harFilePath;
};

(async () => {
  try {
    const harFilePath = await getHarFileFromPrompt();
    await harToSocketDataJson(harFilePath);
    console.log('Success!');
    process.exit(0);
  } catch (error) {
    console.log('Error: ', error);
    process.exit(1);
  }
})();
