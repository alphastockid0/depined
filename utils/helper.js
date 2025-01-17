import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import fs from 'fs/promises';
import log from './logger.js';
import chalk from 'chalk';

// Fungsi untuk menjalankan countdown
export const startCountdown = (seconds) => {
    let timeLeft = seconds;

    const countdownInterval = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60);
        let secondsRemaining = timeLeft % 60;

        // Format angka menjadi dua digit (misalnya 03 untuk 3 detik)
        let formattedTime = `${minutes}:${secondsRemaining < 10 ? '0' : ''}${secondsRemaining}`;

        // Tentukan warna berdasarkan waktu yang tersisa
        let color;
        if (timeLeft > 30) {
            color = chalk.green;  // Jika waktu lebih dari 30 detik, tampilkan hijau
        } else if (timeLeft > 10) {
            color = chalk.yellow; // Jika waktu antara 10 dan 30 detik, tampilkan kuning
        } else {
            color = chalk.red;    // Jika waktu kurang dari 10 detik, tampilkan merah
        }

        // Tampilkan waktu dengan warna yang sesuai
        console.clear(); // Hapus output sebelumnya agar tampil terupdate
        console.log(color(formattedTime));

        timeLeft--;

        // Jika waktu habis, hentikan countdown
        if (timeLeft < 0) {
            clearInterval(countdownInterval);
            console.log(chalk.blue('Countdown selesai!'));
        }
    }, 1000); // Update setiap 1 detik
};
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms * 1000));
}

// Save data to a file
export async function saveToFile(filename, data) {
    try {
        await fs.appendFile(filename, `${data}\n`, 'utf-8');
        log.info(`Data saved to ${filename}`);
    } catch (error) {
        log.error(`Failed to save data to ${filename}: ${error.message}`);
    }
}

// Read the file
export async function readFile(pathFile) {
    try {
        const datas = await fs.readFile(pathFile, 'utf8');
        return datas.split('\n')
            .map(data => data.trim())
            .filter(data => data.length > 0);
    } catch (error) {
        log.error(`Error reading file: ${error.message}`);
        return [];
    }
}

// Create an agent
export const newAgent = (proxy = null) => {
    if (proxy) {
        if (proxy.startsWith('http://')) {
            return new HttpsProxyAgent(proxy);
        } else if (proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
            return new SocksProxyAgent(proxy);
        } else {
            log.warn(`Unsupported proxy type: ${proxy}`);
            return null;
        }
    }
    return null;
};
