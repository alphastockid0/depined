import React from 'react';
import { render } from 'ink';
import Dashboard from './Dashboard.js';
import helper from './utils/helper.js';
import log from './utils/logger.js';

const main = async () => {
  const tokens = await helper.readFile('./config/tokens.txt');
  if (tokens.length === 0) {
    log.error('No tokens found in tokens.txt');
    return;
  }

  const proxies = await helper.readFile('./config/proxy.txt');
  if (proxies.length === 0) {
    log.warn('Running without proxy...');
  }

  render(<Dashboard tokens={tokens} proxies={proxies} />);
};

main();
