import * as fs from 'fs';
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

const parseMessage = (inputMessage: any): MessageOutput => {
  const data = inputMessage.data.replace(/^42\[/, '').replace(/\]$/, '').split(/,(.+)/);
  const timeFromSessionStart = inputMessage.timeFromSessionStart;

  if (!data[0] || !data[1]) {
    return {
      message: '',
      timestamp: new Date(inputMessage.time * 1000),
      timeToNextMessage: null,
      timeFromSessionStart,
      type: '',
      payload: {},
    };
  }

  const message = data[0].replace(/"/g, '');
  const caps = convertCamelCaseToUnderscore(data[0].replace(/"/g, '')).toUpperCase();
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

export const harToSocketDataJson = async (harFilePath: string) => {
  const file = readFile(harFilePath, 'utf8');
  const parsedFile = JSON.parse(await file);
  const entries = parsedFile.log.entries;
  const filteredEntries = entries.filter((entry: any) => entry._webSocketMessages);
  let timeFromSessionStart = 0;

  const webSocketMessages = filteredEntries.map((entry: any) => entry._webSocketMessages);
  const flattenedWebSocketMessages = webSocketMessages.flat();
  const filteredWebSocketMessages = flattenedWebSocketMessages.filter((message: any) => message.type === 'receive');
  const mappedWebSocketMessages = filteredWebSocketMessages.map((message: any, i: number, arr: any[]) => {
    const nextMessage = arr[i + 1];
    const timeToNextMessage = nextMessage ? nextMessage.time - message.time : null;
    message.timeToNextMessage = timeToNextMessage;
    message.timeFromSessionStart = timeFromSessionStart;
    timeFromSessionStart += timeToNextMessage || 0;
    return parseMessage(message);
  });

  // if no /out directory exists, create it
  const outDir = path.join(path.dirname(harFilePath), '/out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  // generate a json file with the same name as the input file
  const fileName = path.basename(harFilePath, '.har');
  const jsonFilePath = path.join(path.dirname(harFilePath), `/out/${fileName}.json`);
  const jsonFile = await writeFile(jsonFilePath, JSON.stringify(mappedWebSocketMessages, null, 2));
  console.log('json file created');

  // generate a json file with the session metadata
  const sessionMetadata: SessionMetadata = {
    startTime: mappedWebSocketMessages[0].timestamp.getTime(),
    endTime: mappedWebSocketMessages[mappedWebSocketMessages.length - 1].timestamp.getTime(),
    sessionTimeInSeconds: mappedWebSocketMessages[mappedWebSocketMessages.length - 1].timeFromSessionStart,
    totalMessages: mappedWebSocketMessages.length,
  };

  const sessionMetadataFilePath = path.join(path.dirname(harFilePath), `/out/${fileName}-metadata.json`);
  const sessionMetadataFile = await writeFile(sessionMetadataFilePath, JSON.stringify(sessionMetadata, null, 2));
  console.log('session metadata file created');

  return { jsonFile, sessionMetadataFile };
};
