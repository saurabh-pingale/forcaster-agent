import cron from 'node-cron';
import { main } from '../index';

const schedule = [
  '0 8 * * *',   // Morning - 8:00 AM
  '0 13 * * *',  // Noon - 1:00 PM
  '0 20 * * *'   // Night - 8:00 PM
];

schedule.forEach((cronTime) => {
  cron.schedule(cronTime, async () => {
    console.log(`Running main() at ${new Date().toLocaleString()}`);
    await main();
  });
});

console.log("Cron jobs scheduled.");