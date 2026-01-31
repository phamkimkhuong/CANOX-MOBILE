import { API_ROUTES } from '@/constants/apiRoutes';
import type {
    RegisterPushTokenRequest,
    UserDevicesResponse
} from '@/types/pushToken';
import { apiClient } from './client';


const PUSH_TOKEN_ENDPOINT = API_ROUTES.NOTIFICATIONS.DEVICE_TOKENS;

/**
 * Register or update push token for current device
 * Call this when:
 * - User logs in
 * - Push token changes
 */
export async function registerPushToken(
    payload: RegisterPushTokenRequest
): Promise<void> {
    await apiClient.post(PUSH_TOKEN_ENDPOINT, payload);
}

/**
 * Unregister push token for current device
 * Call this when user logs out
 */
export async function unregisterPushToken(token: string): Promise<void> {
    await apiClient.delete(API_ROUTES.NOTIFICATIONS.UNREGISTER_DEVICE_TOKEN(token));
}

/**
 * Get list of devices registered for current user
 * Useful for "Manage logged-in devices" screen
 */
export async function getUserDevices(): Promise<UserDevicesResponse> {
    const response = await apiClient.get<UserDevicesResponse>(
        `${PUSH_TOKEN_ENDPOINT}/devices`
    );
    return response.data;
}

/**
 * Logout from a specific device
 * Removes push token for that device
 */
export async function logoutFromDevice(deviceId: string): Promise<void> {
    await apiClient.delete(`${PUSH_TOKEN_ENDPOINT}/devices/${deviceId}`);
}
