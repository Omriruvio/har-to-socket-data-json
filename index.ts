import { harToSocketDataJson } from './harToSocketDataJson';
import * as fs from 'fs';
let harFilePath: string;

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
