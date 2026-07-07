import { StyleSheet as RNStyleSheet, StyleProp } from 'react-native';

/**
 * Clean up and flatten style arrays to prevent Reanimated v4 empty style/unistyles metadata error.
 * 
 * Reanimated v4 throws an error when it encounters:
 * 1. An empty style object {}
 * 2. Unistyles internal class metadata keys (e.g. "unistyles_5fd3376c": {})
 * 
 * This helper filters out falsy values, flattens the styles, and strips out
 * any internal Unistyles metadata keys so Reanimated only receives valid style properties.
 */
export function cleanAndFlattenStyles(...styles: any[]): any {
    const filtered = styles.filter(Boolean);
    if (filtered.length === 0) return undefined;
    
    const flattened = RNStyleSheet.flatten(filtered);
    
    if (!flattened || Object.keys(flattened).length === 0) {
        return undefined;
    }
    
    const cleanObject: any = {};
    let hasKeys = false;
    
    for (const key of Object.keys(flattened)) {
        // Strip out Unistyles internal hash properties (e.g. unistyles_xxxxx)
        // and also ensure we don't pass empty objects as style values.
        if (!key.startsWith('unistyles_')) {
            const val = (flattened as any)[key];
            if (val !== null && val !== undefined && (typeof val !== 'object' || Object.keys(val).length > 0)) {
                cleanObject[key] = val;
                hasKeys = true;
            }
        }
    }
    
    return hasKeys ? cleanObject : undefined;
}
