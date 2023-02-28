import { harToSocketDataJson } from './harToSocketDataJson';
import { getArgs } from './utils/getArgs';
import { getHarFileFromPrompt } from './utils/harFromPrompt';

const { harFilePath, outputFilePath } = getArgs();

(async () => {
  try {
    await harToSocketDataJson(await getHarFileFromPrompt(harFilePath), outputFilePath);
    console.log('Success!');
    process.exit(0);
  } catch (error) {
    console.log('Error: ', error);
    process.exit(1);
  }
})();

export { harToSocketDataJson } from './harToSocketDataJson';
