import * as core from '@actions/core';
import { setUserAgent, cleanupAzCLIAccounts, cleanupAzPSAccounts } from './common/Utils'; 

async function cleanup() {
    try {
        setUserAgent();
        await cleanupAzCLIAccounts();
        if(core.getInput('enable-AzPSSession').toLowerCase() === "true"){
            await cleanupAzPSAccounts();
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        core.warning(`Login cleanup failed with ${errorMessage}. Cleanup will be skipped.`);
        if (error instanceof Error && error.stack) {
            core.debug(error.stack);
        }
    }
}

cleanup();

