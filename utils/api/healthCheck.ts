/**
 * Health Check Utility
 * 
 * Provides functions to check if the backend services are reachable.
 * Used during maintenance mode to auto-recovery the app.
 */

import { logger } from '@/utils/logger';
import axios from 'axios';

const HEALTH_CHECK_URL = 'https://api.calatha.com/api/v1/search/hot';
const TIMEOUT = 5000;

/**
 * Perform a lightweight check to see if the server is back online.
 * Uses HEAD request to minimize bandwidth.
 */
export const checkServerStatus = async (): Promise<boolean> => {
    try {
        logger.api.info('Running server health check (Heartbeat)...');

        // Use HEAD instead of GET to save data, only status matters
        const response = await axios.head(HEALTH_CHECK_URL, {
            params: { limit: 1 },
            timeout: TIMEOUT,
            // Validate any status < 500 as "alive" (since 401/404 mean gateway is up)
            validateStatus: (status) => status < 500,
        });

        logger.api.info(`Server is alive! Status: ${response.status}`);
        return true;
    } catch (error) {
        let status: number | undefined;
        if (axios.isAxiosError(error)) {
            status = error.response?.status;
        }
        logger.api.warn(`Server health check failed. Status: ${status ?? 'Timeout/Network Error'}`);

        // Even if it returns 401 or 404, the Gateway/Nginx is ALIVE.
        // Only 5xx or Network/Timeout errors count as "System Down".
        if (status && status < 500) {
            return true;
        }

        return false;
    }
};
