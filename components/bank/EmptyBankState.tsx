import { IconSymbol } from '@/components/ui/Icon';
import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * EmptyBankState - Shown when user has no bank accounts
 */
export const EmptyBankState: React.FC = memo(() => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <View style={styles.iconCircle}>
                <IconSymbol name="account-balance-wallet" size={48} color={theme.colors.typographySecondary} />
            </View>
            <Text style={styles.title}>Chưa có tài khoản ngân hàng</Text>
            <Text style={styles.subtitle}>
                Hãy liên kết tài khoản ngân hàng để thực hiện rút tiền và thanh toán dễ dàng hơn.
            </Text>
        </View>
    );
});

EmptyBankState.displayName = 'EmptyBankState';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.secondarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
}));
