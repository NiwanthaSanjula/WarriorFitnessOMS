import cron from 'node-cron';
import * as membershipService from '../services/membershipService.js';

export const initCronjobs = () => {
    //  Run everyday at 00:00
    cron.schedule('0 0 * * * ', async () => {
        console.log("--- Running Nigthly Expiration Sweep ---");
        try {
            const report = await membershipService.checkAndUpdateExpiredMembers();
            console.log(`Sweep complete. ${report.updatedCount} members moved to pending-payment`);
            
        } catch (error) {
            console.log( 'Cron Job Error: ' , error);
            
        }
        
    })
}