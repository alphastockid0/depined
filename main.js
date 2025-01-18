import * as utils from './utils/api.js';
import banner from './utils/banner.js';
import log from './utils/logger.js';
import { readFile, delay } from './utils/helper.js'
import { startCountdown } from './utils/helper.js';

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

                setInterval(async () => {
                    const userData = await utils.getUserInfo(token, proxy);
                    const earningsData = await utils.getEarningsData(token, proxy);
                    const widget = await utils.logWidgetStatus(token, proxy);
                    
                    if (earningsData) {
                        if (userData?.data) {
                            const { email, verified, current_tier, points_balance } = userData.data
                            const { points, today, uptime, epoch } = earningsData;
                            utils.updateTemplate(points, today, uptime, email, current_tier,epoch,proxy,widget);
                        }
                    }
                }, 60000 * 2);

                setInterval(async () => {
                    const connectRes = await utils.connect(token, proxy);
                    const result = await utils.getEarnings(token, proxy);
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
