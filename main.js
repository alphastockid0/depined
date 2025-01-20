import * as utils from './utils/api.js';
import log from './utils/logger.js';
import { readFile, delay } from './utils/helper.js'



const processAccount = async (token, proxy, index) => {
    let currentPoint = 0;
    let earn = 0;

    try {
        setInterval(async () => {
            try {
                console.clear();
                const userData = await utils.getUserInfo(token, proxy);
                const earningsData = await utils.getEarningsData(token, proxy);
                const widget = await utils.logWidgetStatus(token, proxy);

                if (earningsData && userData?.data) {
                    const { email, verified, current_tier } = userData.data;
                    const { points, today, uptime, epoch } = earningsData;

                    currentPoint == points || currentPoint == 0 ? earn = 0 : earn = points - currentPoint;
                    currentPoint = points; // Update currentPoint untuk interval berikutnya

                    utils.updateTemplate(points, today, uptime, email, current_tier, epoch, proxy, widget, earn);

                }
            } catch (error) {
                log.error(`Error updating account ${index}: ${error.message}`);
            }
        }, 60000 * 3); // Interval setiap 3 menit

        setInterval(async () => {
            try {
                await utils.connect(token, proxy);
                await utils.getEarnings(token, proxy);
            } catch (error) {
                log.error(`Error connecting or fetching earnings for account ${index}: ${error.message}`);
            }
        }, 1000 * 30); // Interval setiap 30 detik
    } catch (error) {
        log.error(`Error processing account ${index}: ${error.message}`);
    }
};

const main = async () => {
    await delay(3);

    const tokens = await readFile("./config/tokens.txt");
    if (tokens.length === 0) {
        log.error("No tokens found in tokens.txt");
        return;
    }

    const proxies = await readFile("./config/proxy.txt");
    if (proxies.length === 0) {
        log.warn("Running without proxy...");
    }

    log.info(`Starting Program for all accounts: ${tokens.length}`);

    try {        
        const accountsProcessing = tokens.map((token, index) => {
            const proxy = proxies[index % proxies.length] || null;
            return processAccount(token, proxy, index);
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
