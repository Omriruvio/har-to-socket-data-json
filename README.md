# Har To Json - Socket data extraction

Script that parses HAR (HTTP Archive) files created by browser dev-tools and returns a JSON with the following structure:

``` 
type MessageOutput = {
  message: string;
  timestamp: Date;
  timeToNextMessage: number | null;
  timeFromSessionStart: number;
  type: string;
  payload: any;
};
```

## Installation

Use npm to install

```bash
git clone <this repo url>
cd <your cloned repo path>
npm i
```

## Usage

```bash
npx ts-node index.ts
npx ts-node index.ts --harFilePath=<path>
```
Input the path to your HAR file to the console

Two files will be created:

``out/<original-har-filename>.json``

``out/<original-har-filename-metadata>.json``

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.