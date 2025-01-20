
import cliProgress from "cli-progress";
import * as api from './utils/api.js';
import * as helper from './utils/helper.js';
import log from './utils/logger.js';



const processAccount = async (token, proxy, index, progressBar) => {
  let currentPoint = 0;

  try {
    setInterval(async () => {
      try {
        const userData = await api.getUserInfo(token, proxy);
        const earningsData = await api.getEarningsData(token, proxy);
        const widget = await api.logWidgetStatus(token, proxy);

        if (earningsData && userData?.data) {
          const { email, verified, current_tier } = userData.data;
          const { points, today, uptime, epoch } = earningsData;

          const earn = points - currentPoint;
          currentPoint = points; // Update currentPoint untuk interval berikutnya

          const template = api.updateTemplate(points, today, uptime, email, current_tier, epoch, proxy, widget, earn);
          log.info(template);

          // Update progress bar
          progressBar.update(index + 1);
        }
      } catch (error) {
        log.error(`Error updating account ${index}: ${error.message}`);
      }
    }, 60000); // Interval setiap 1 menit

    setInterval(async () => {
      try {
        await api.connect(token, proxy);
        await api.getEarnings(token, proxy);
      } catch (error) {
        log.error(`Error connecting or fetching earnings for account ${index}: ${error.message}`);
      }
    }, 1000 * 30); // Interval setiap 30 detik
  } catch (error) {
    log.error(`Error processing account ${index}: ${error.message}`);
  }
};
const main = async () => {
  await helper.delay(3);

  const tokens = await helper.readFile('./config/tokens.txt');
  if (tokens.length === 0) {
    log.error('No tokens found in tokens.txt');
    return;
  }
  const proxies = await helper.readFile('./config/proxy.txt');
  if (proxies.length === 0) {
    log.warn('Running without proxy...');
  }
  log.info(`Starting Program for all accounts: ${tokens.length}`);

  // Inisialisasi progress bar
  const progressBar = new cliProgress.SingleBar(
    {
      format: 'Progress | {bar} | {percentage}% | {value}/{total} accounts',
    },
    cliProgress.Presets.shades_classic
  );

  progressBar.start(tokens.length, 0); // Mulai progress bar

  try {
    const accountsProcessing = tokens.map((token, index) => {
      const proxy = proxies[index % proxies.length] || null;
      return processAccount(token, proxy, index, progressBar);
    });

    await Promise.all(accountsProcessing);

    progressBar.stop(); // Hentikan progress bar saat selesai
    log.info('All accounts processed successfully!');
  } catch (error) {
    progressBar.stop(); // Hentikan progress bar jika ada error
    log.error(`Error in main loop: ${error.message}`);
  }
};
main();
