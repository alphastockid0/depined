import * as utils from './utils/api.js';
import banner from './utils/banner.js';
import log from './utils/logger.js';
import { readFile, delay } from './utils/helper.js'

const main = async () => {
    // log.info(banner);
    await delay(3)
    const tokens = await readFile("./config/tokens.txt");
    if (tokens.length === 0) {
        log.error('No tokens found in tokens.txt');
        return;
    }
    const proxies = await readFile("./config/proxy.txt");
    if (proxies.length === 0) {
        log.warn('Running without proxy...');
    }

    try {
        log.info(`Starting Program for all accounts:`, tokens.length);

        const accountsProcessing = tokens.map(async (token, index) => {
            const proxy = proxies[index % proxies.length] || null;
            try {
                const userData = await utils.getUserInfo(token, proxy);

                if (userData?.data) {
                    const { email, verified, current_tier, points_balance } = userData.data
                    log.info(`Account ${index + 1} info:`, { email, verified, current_tier, points_balance });
                }

                // Ping setiap 5 detik
                setInterval(async () => {
                    try {
                        const connectRes = await utils.connect(token, proxy);
                        log.info(`Ping account ${index + 1}:`, connectRes || { message: 'unknown error' });
                    } catch (error) {
                        log.error(`Ping error for account ${index + 1}:`, error.message || error);
                    }
                }, 1000 * 5); // Run every 5 seconds

                // Earning setiap 30 detik
                setInterval(async () => {
                    try {
                        const result = await utils.getEarnings(token, proxy);
                        log.info(`Earnings account ${index + 1}:`, result?.data || { message: 'unknown error' });
                    } catch (error) {
                        log.error(`Earnings error for account ${index + 1}:`, error.message || error);
                    }
                }, 1000 * 30); // Run every 30 seconds

            } catch (error) {
                log.error(`Error processing account ${index}: ${error.message}`);
            }
        });

        await Promise.all(accountsProcessing);
    } catch (error) {
        log.error(`Error in main loop: ${error.message}`);
    }
};


process.on('SIGINT', () => {
    log.warn(`Process received SIGINT, cleaning up and exiting program...`);
    process.exit(0);
});

process.on('SIGTERM', () => {
    log.warn(`Process received SIGTERM, cleaning up and exiting program...`);
    process.exit(0);
});


// Run the main function
main();
