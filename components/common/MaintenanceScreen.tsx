import { IconSymbol } from '@/components/ui/Icon';
import { checkServerStatus } from '@/utils/api/healthCheck';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Contact constants
const SUPPORT_ZALO_LINK = 'https://zalo.me/0329670310';
const SUPPORT_PHONE = '0329670310';

interface MaintenanceScreenProps {
    onRetry?: () => void;
}

/**
 * MaintenanceScreen - Displays a "System Down" message when server hits 502/503/504 errors.
 * Includes auto-retry logic to restore app state when server comes back online.
 */
export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onRetry }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('common');
    const styles = stylesheet;
    const [isChecking, setIsChecking] = useState(false);

    const performCheck = useCallback(async () => {
        if (isChecking) return;

        setIsChecking(true);
        const isOnline = await checkServerStatus();
        setIsChecking(false);

        if (isOnline && onRetry) {
            onRetry();
        }
    }, [isChecking, onRetry]);

    const handleContactSupport = () => {
        Linking.openURL(SUPPORT_ZALO_LINK).catch(() => {
            // Fallback to phone call if Zalo fails
            Linking.openURL(`tel:${SUPPORT_PHONE}`);
        });
    };

    // Auto-check periodically for silent recovery
    useEffect(() => {
        const interval = setInterval(() => {
            performCheck();
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [performCheck]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={80} color="#f97316" />
                </View>

                <Text style={styles.title}>{t('maintenance.title')}</Text>

                <Text style={styles.description}>
                    {t('maintenance.description')}
                </Text>

                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleContactSupport}
                    >
                        <View style={styles.buttonContent}>
                            <IconSymbol name="chat" size={20} color={theme.colors.onPrimary} />
                            <Text style={styles.buttonText}>{t('maintenance.contactSupport')}</Text>
                        </View>
                    </TouchableOpacity>

                    {isChecking && (
                        <View style={styles.autoCheckingContainer}>
                            <ActivityIndicator size="small" color={theme.colors.secondary} />
                            <Text style={styles.autoCheckingText}>{t('status.loading')}</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{t('maintenance.support')}</Text>
            </View>
        </SafeAreaView>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.typography,
        marginBottom: theme.margins.md,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: theme.margins.xxl,
    },
    buttonGroup: {
        width: '100%',
        alignItems: 'center',
        gap: theme.margins.lg,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.xxl,
        borderRadius: theme.radius.m,
        minWidth: 260,
        alignItems: 'center',
        ...theme.shadows?.small,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: theme.colors.onPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    autoCheckingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: theme.margins.sm,
    },
    autoCheckingText: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        fontStyle: 'italic',
    },
    footer: {
        paddingVertical: theme.margins.md,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: theme.colors.secondary,
    },
}));
