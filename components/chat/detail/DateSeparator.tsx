/**
 * DateSeparator - Shows date label between message groups
 */

import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface DateSeparatorProps {
    label: string;
}

/**
 * DateSeparator - Centered date pill between messages
 *
 * Examples:
 * - "Hôm nay"
 * - "Hôm qua"
 * - "20/10"
 * - "20/10/2024"
 *
 * Memoized to prevent unnecessary re-renders
 */
export const DateSeparator: React.FC<DateSeparatorProps> = React.memo(({ label }) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <View style={styles.pill}>
                <Text style={styles.text}>{label}</Text>
            </View>
        </View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.md,
    },
    pill: {
        backgroundColor: 'rgba(148, 163, 184, 0.15)',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: 6,
        borderRadius: theme.radius.full,
    },
    text: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
}));

export default DateSeparator;
