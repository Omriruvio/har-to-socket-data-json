import * as fs from 'fs';
import { prompt } from './prompt';

export const getHarFileFromPrompt = async (harFilePath?: string) => {
  if (harFilePath) return harFilePath;
  harFilePath = (await prompt('Enter path to HAR file: ')) as string;
  if (!harFilePath.endsWith('.har')) harFilePath = `${harFilePath}.har`;

  while (!fs.existsSync(harFilePath)) {
    harFilePath = (await prompt(`File ${harFilePath} does not exist, please try again: `)) as string;
    if (!harFilePath.endsWith('.har')) harFilePath = `${harFilePath}.har`;
  }

  return harFilePath;
};