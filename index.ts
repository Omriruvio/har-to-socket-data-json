import { harToSocketDataJson } from './harToSocketDataJson';
import { getArgs } from './utils/getArgs';
import { getHarFileFromPrompt } from './utils/harFromPrompt';

// Parse command line arguments
// supports -f and --f for file path
// supports -o and --o for output path
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
