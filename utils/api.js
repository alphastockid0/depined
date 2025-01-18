import randomUseragent from 'random-useragent';
import axios from 'axios';
import log from './logger.js';
import { newAgent } from './helper.js'
import chalk from 'chalk';


const userAgent = randomUseragent.getRandom();
const headers = {
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent": userAgent,
}

export const registerUser = async (email, password) => {
    const url = 'https://api.depined.org/api/user/register';

    try {
        const response = await axios.post(url, { email, password }, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        log.info('User registered successfully:', response.data.message);
        return response.data;
    } catch (error) {
        log.error('Error registering user:', error.response ? error.response.data : error.message);
        return null;
    }
};

export const loginUser = async (email, password) => {
    const url = 'https://api.depined.org/api/user/login';

    try {
        const response = await axios.post(url, { email, password }, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        log.info('User Login successfully:', response.data.message);
        return response.data;
    } catch (error) {
        log.error('Error Login user:', error.response ? error.response.data : error.message);
        return null;
    }
};

export const createUserProfile = async (token, payload) => {
    const url = 'https://api.depined.org/api/user/profile-creation';

    try {
        const response = await axios.post(url, payload, {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        log.info('Profile created successfully:', payload);
        return response.data;
    } catch (error) {
        log.error('Error creating profile:', error.response ? error.response.data : error.message);
        return null;
    }
};

export const confirmUserReff = async (token, referral_code) => {
    const url = 'https://api.depined.org/api/access-code/referal';

    try {
        const response = await axios.post(url, { referral_code }, {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        log.info('Confirm User referral successfully:', response.data.message);
        return response.data;
    } catch (error) {
        log.error('Error Confirm User referral:', error.response ? error.response.data : error.message);
        return null;
    }
};

export const addIpToWhitelist = async (ip) => {
    try {
        // Memanggil API untuk menambahkan IP ke whitelist
        const response = await axios.get(`https://api.922proxy.com/api/add_ip`, {
            params: {
                user: '29562882', // Ganti dengan user Anda
                user_key: '490d52cc9d374854d70b6e28c5016779', // Ganti dengan user_key Anda
                ip: ip
            }
        });

        // Memeriksa respons dari API
        if (response.data.code === 0) {
            log.log(`IP ${ip} berhasil ditambahkan ke whitelist.`);
        } else {
            log.error('Gagal menambahkan IP ke whitelist:', response.data.msg);
        }
    } catch (error) {
        log.error('Terjadi kesalahan saat menambahkan IP ke whitelist:', error.message || error);
    }
};
export const getUserInfo = async (token, proxy) => {
    const agent = newAgent(proxy);
    try {
        const response = await axios.get('https://api.depined.org/api/user/details', {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        log.error('Error fetching user info:', error.message || error);

        // Mendapatkan IP publik dari error dan menambahkannya ke whitelist
        const publicIp = await getPublicIp(); // Dapatkan IP publik Anda (lihat di bawah)
        await addIpToWhitelist(publicIp);

        return null;
    }
};
// Fungsi untuk mendapatkan IP publik (contoh menggunakan API lain)
export const getPublicIp = async () => {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
    } catch (error) {
        log.error('Gagal mendapatkan IP publik:', error.message || error);
        return '';
    }
};
export async function getUserRef(token, proxy) {
    const agent = newAgent(proxy);
    try {
        const response = await axios.get('https://api.depined.org/api/referrals/stats', {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        log.error('Error fetching user info:', error.message || error);
        return null;
    }
}
export async function getEarnings(token, proxy) {
    const agent = newAgent(proxy);
    try {
        const response = await axios.get('https://api.depined.org/api/stats/epoch-earnings', {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        log.error('Error fetching user info:', error.message || error);
        const publicIp = await getPublicIp(); // Dapatkan IP publik Anda (lihat di bawah)
        await addIpToWhitelist(publicIp);

        return null;
    }
}
export async function connect(token, proxy) {
    const agent = newAgent(proxy);
    try {
        const payload = { connected: true }
        const response = await axios.post('https://api.depined.org/api/user/widget-connect', payload, {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        log.error(`Error when update connection: ${error.message}`);
        const publicIp = await getPublicIp(); // Dapatkan IP publik Anda (lihat di bawah)
        await addIpToWhitelist(publicIp);

        return null;
    }
}
export async function status(token, proxy) {
    const agent = newAgent(proxy);
    try {
        const payload = { connected: true }
        const response = await axios.post('https://api.depined.org/api/user/widget-status', payload, {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        log.error(`Error when update connection: ${error.message}`);
        const publicIp = await getPublicIp(); // Dapatkan IP publik Anda (lihat di bawah)
        await addIpToWhitelist(publicIp);
        return null;
    }
}
export async function logWidgetStatus(token, proxy) {
    const agent = newAgent(proxy); // Membuat agent proxy jika diperlukan

    try {
        const response = await axios.get(
            'https://api.depined.org/api/user/widget-status',
            {
                headers: {
                    'Authorization': `Bearer ${token}`, // Menambahkan header Authorization dengan Bearer Token
                    'Accept': 'application/json', // Menambahkan header Accept
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Origin': 'https://app.depined.org',
                    'Referer': 'https://app.depined.org/',
                },
                httpsAgent: agent, // Menggunakan agent https jika menggunakan proxy atau pengaturan SSL
                httpAgent: agent, // Menggunakan agent http jika diperlukan
            }
        );

        const responseData = response.data;

        // Evaluasi respons
        if (responseData.code === 200 && responseData.status) {
            const { hostConnected, widgetConnected } = responseData.data;

            // Format status untuk logging
            const hostStatus = hostConnected ? `${chalk.green('[Host]')} ${chalk.bgGreen('connected')}` : `${chalk.red('[Host]')} ${chalk.red('NOT connected')}`;
            const widgetStatus = widgetConnected ? `${chalk.green('[Widget]')} ${chalk.bgGreen('connected')}` : `${chalk.red('[Widget]')} ${chalk.red('NOT connected')}`;

            // Log status ringkas
            log.info(`Status >> ${hostStatus} | ${widgetStatus}`);

            return responseData.data; // Kembalikan data jika diperlukan
        } else {
            log.error(
                `Unexpected status or code in response: Code - ${responseData.code}, Message - ${responseData.message}`
            );
            return null;
        }
    } catch (error) {
        // Tangani error HTTP atau error lain
        log.error(`[Widget Status] Error: ${error.message}`);
        return null;
    }
}

export function updateTemplate(points, today, uptime, email, current_tier, current_epoch,proxy,statusData) {
    const { hostConnected, widgetConnected } = statusData;
    
    const template = `
Proxy : ${chalk.green(proxy)} | Widget : ${widgetConnected ? `${chalk.green('connected')}` : `${chalk.red('Not connected')}`} | Host : ${hostConnected ? `${chalk.green('connected')}` : `${chalk.red('Not connected')}`}
${chalk.cyanBright("================================================================")}
${chalk.cyanBright(`| Account : ${chalk.green(email)} | Tier : ${current_tier} | Epoch : ${current_epoch}`)}
${chalk.cyanBright("================================================================")}
${chalk.cyanBright(`| Points : ${points.toFixed(2)} | Today : ${today.toFixed(2)} | Uptime : ${uptime} |`)}
${chalk.cyanBright("================================================================")} 
`;

    // Gunakan carriage return untuk menimpa baris sebelumnya
    process.stdout.write(`\r${template}`);
}

export async function getEarningsData(token, proxy) {
    try {
        const agent = newAgent(proxy); // Ganti dengan implementasi proxy Anda
        const response = await axios.get('https://api.depined.org/api/stats/earnings', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            httpsAgent: agent,
            httpAgent: agent,
        });

        if (response.data && response.data.code === 200) {
            const data = response.data.data;
            return {
                points: data.total_points_balance,
                today: data.total_points_today,
                uptime: data.uptime_epoch,
                epoch: data.current_epoch
            };
        } else {
            log.error('Unexpected response:', response.data);
            return null;
        }
    } catch (error) {
        log.error('Error fetching earnings data:', error.message);
        const publicIp = await getPublicIp(); // Dapatkan IP publik Anda (lihat di bawah)
        await addIpToWhitelist(publicIp);

        return null;
    }
}

// [INFO] Earnings Stats Retrieved:
// [INFO] Total Depined Balance: 0
// [INFO] Total Depined Today: 0
// [INFO] Depined Daily Change: 0%
// [INFO] Depined Monthly Change: 0%
// [INFO] Total Points Today: 485.16
// [INFO] Points Percentage Change: 118.05%
// [INFO] Total Points Balance: 707.65
// [INFO] Current Tier: 1
// [INFO] Total Referrals: 0
// [INFO] Total Points This Epoch: 707.65
// [INFO] Current Epoch: 2
// [INFO] Uptime Today: 0day, 8hr, 5min
// [INFO] Uptime Epoch: 0day, 11hr, 47min


//     ================================================================
//     | Points : 707.65 | Today : 485.16 | Uptime : 0day, 11hr, 47min |
//     ================================================================