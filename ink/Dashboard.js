import React, { useEffect, useState } from 'react';
import { render, Text, Box } from 'ink';
import cliProgress from 'cli-progress';
import * as api from './utils/api.js';
import * as helper from './utils/helper.js';
import log from './utils/logger.js';

const Dashboard = ({ tokens, proxies }) => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const initializeAccounts = () =>
      tokens.map((token, index) => ({
        token,
        proxy: proxies[index % proxies.length] || null,
        email: 'Loading...',
        points: 0,
        earn: 0,
        status: 'Initializing...',
      }));

    setAccounts(initializeAccounts());

    // Simulasi pembaruan data setiap 5 detik
    const interval = setInterval(async () => {
      const updatedAccounts = await Promise.all(
        accounts.map(async (account, index) => {
          try {
            const userData = await api.getUserInfo(account.token, account.proxy);
            const earningsData = await api.getEarningsData(account.token, account.proxy);

            if (userData && earningsData) {
              return {
                ...account,
                email: userData.data.email,
                points: earningsData.points,
                earn: earningsData.points - account.points,
                status: 'Active',
              };
            }
          } catch (error) {
            return {
              ...account,
              status: `Error: ${error.message}`,
            };
          }
          return account;
        })
      );
      setAccounts(updatedAccounts);
    }, 5000);

    return () => clearInterval(interval); // Bersihkan interval saat komponen dilepas
  }, [tokens, proxies]);

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="cyan">Dashboard</Text>
      <Box flexDirection="column" marginTop={1}>
        {accounts.map((account, index) => (
          <Box key={index} flexDirection="row" justifyContent="space-between">
            <Text color="green">{index + 1}. {account.email}</Text>
            <Text>Points: {account.points}</Text>
            <Text>Earn: {account.earn}</Text>
            <Text>Status: {account.status}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Dashboard;
