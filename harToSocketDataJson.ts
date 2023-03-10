import * as fs from 'fs';
import { Entry, Har } from 'har-format';
import * as path from 'path';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

type MessageOutput = {
  message: string;
  timestamp: Date;
  timeToNextMessage: number | null;
  timeFromSessionStart: number;
  type: string;
  payload: any;
};

type SessionMetadata = {
  startTime: number;
  endTime: number;
  sessionTimeInSeconds: number;
  totalMessages: number;
};

const convertCamelCaseToUnderscore = (str: string) => str.replace(/([A-Z])/g, (match) => `_${match[0].toLowerCase()}`);
const validateJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    console.log('Invalid JSON: ', '\n' + str);
    return false;
  }
  return true;
};

const parseMessage = (inputMessage: any): MessageOutput | null => {
  const data = inputMessage.data.replace(/^42\[/, '').replace(/\]$/, '').split(/,(.+)/);
  const timeFromSessionStart = inputMessage.timeFromSessionStart;

  if (!data[0] || !data[1]) return null;

  const message = data[0].replace(/"/g, '');
  const caps = convertCamelCaseToUnderscore(data[0].replace(/"/g, '')).toUpperCase();
  const slicedData = data.slice(1).join('');
  if (!validateJson(slicedData)) return null;
  const payload = JSON.parse(data.slice(1).join(''));
  const timestamp = new Date(inputMessage.time * 1000);
  const timeToNextMessage = inputMessage.timeToNextMessage;

  return {
    message,
    timestamp,
    timeToNextMessage,
    timeFromSessionStart,
    type: caps,
    payload,
  };
};

export const harToSocketDataJson = async (harFilePath: string, outputPath?: string) => {
  const file = readFile(harFilePath, 'utf8');
  const parsedFile = JSON.parse(await file as string) as Har;
  const entries = parsedFile.log.entries;
  const filteredEntries = entries.filter((entry) => entry._webSocketMessages);
  let timeFromSessionStart = 0;

  const webSocketMessages = filteredEntries.map((entry: Entry) => entry._webSocketMessages);
  const flattenedWebSocketMessages = webSocketMessages.flat();
  const filteredWebSocketMessages = flattenedWebSocketMessages.filter((message: any) => message.type === 'receive');

  const mappedWebSocketMessages = filteredWebSocketMessages.reduce<MessageOutput[]>((acc, message: any, i: number, arr: any[]) => {
    const nextMessage = arr[i + 1];
    const timeToNextMessage = nextMessage ? nextMessage.time - message.time : null;
    message.timeToNextMessage = timeToNextMessage;
    message.timeFromSessionStart = timeFromSessionStart;
    timeFromSessionStart += timeToNextMessage || 0;
    const parsedMessage = parseMessage(message);
    if (!parsedMessage) return acc;
    return [...acc, parsedMessage];
  }, []);

  // out dir should be created in the execution path
  const usserFullPathOutDir = outputPath;
  let outDir = '';
  
  // if user provided full out path, create the dir if needed and use it
  if (usserFullPathOutDir) {
    if (!fs.existsSync(usserFullPathOutDir)) fs.mkdirSync(usserFullPathOutDir, { recursive: true });
    if (!fs.lstatSync(usserFullPathOutDir).isDirectory()) throw new Error(`The provided path is not a directory: ${usserFullPathOutDir}`);
    outDir = usserFullPathOutDir;
  } else {
    outDir = path.join(process.cwd(), '/out');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  }

  // generate a json file with the same name as the input file in the out dir
  const fileName = path.basename(harFilePath, '.har');
  const jsonFilePath = path.join(outDir, `${fileName}.json`);
  const jsonFile = await writeFile(jsonFilePath, JSON.stringify(mappedWebSocketMessages, null, 2));
  console.log(`File created: ${jsonFilePath}`);

  // generate a json file with the session metadata in the out dir
  const sessionMetadata: SessionMetadata = {
    startTime: mappedWebSocketMessages[0].timestamp.getTime(),
    endTime: mappedWebSocketMessages[mappedWebSocketMessages.length - 1].timestamp.getTime(),
    sessionTimeInSeconds: mappedWebSocketMessages[mappedWebSocketMessages.length - 1].timeFromSessionStart,
    totalMessages: mappedWebSocketMessages.length,
  };

  const sessionMetadataFilePath = path.join(outDir, `${fileName}-metadata.json`);
  const sessionMetadataFile = await writeFile(sessionMetadataFilePath, JSON.stringify(sessionMetadata, null, 2));
  console.log(`File created: ${sessionMetadataFilePath}`);

  return {
    messages: mappedWebSocketMessages,
    sessionMetadata,
  }

};
