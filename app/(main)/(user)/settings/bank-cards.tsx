import { BankCardItem, BankListSkeleton, EmptyBankState } from '@/components/bank';
import { SettingsHeader } from '@/components/settings';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useMyBankAccounts } from '@/hooks/api/bank/useBank';
import { Navigator } from '@/utils/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * BankCardsScreen - Premium Bank Account Management
 */
export default function BankCardsScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // API Hooks
    const { data: accounts, isLoading, refetch, isRefetching } = useMyBankAccounts();

    // Handlers
    const handleAddBank = useCallback(() => {
        Navigator.push(ROUTES.SETTINGS.ADD_BANK);
    }, []);

    const handleCardPress = useCallback((card: any) => {
        // TODO: Show card bottom sheet options
    }, []);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Liquid Glass Background Layers */}
            <View style={styles.bgGlow1} />
            <View style={styles.bgGlow2} />

            <SettingsHeader title="Tài khoản / Thẻ ngân hàng" showHelpButton={false} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={theme.colors.buttonActive}
                    />
                }
            >
                {/* Header Section */}
                <Animated.View entering={FadeInDown.duration(600)} style={styles.headerSection}>
                    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    <Text style={styles.sectionSubtitle}>
                        Quản lý các tài khoản ngân hàng để thực hiện giao dịch an toàn.
                    </Text>
                </Animated.View>

                {/* Bank Accounts List */}
                <View style={styles.listContainer}>
                    {isLoading ? (
                        <BankListSkeleton />
                    ) : accounts && accounts.length > 0 ? (
                        accounts.map((card, index) => (
                            <BankCardItem
                                key={card.id}
                                card={card}
                                index={index}
                                onPress={handleCardPress}
                            />
                        ))
                    ) : (
                        <EmptyBankState />
                    )}
                </View>

                {/* Add Bank Button - Floating Style */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)}>
                    <TouchableOpacity
                        onPress={handleAddBank}
                        activeOpacity={0.8}
                        style={styles.addBtnWrapper}
                    >
                        <LinearGradient
                            colors={[theme.colors.buttonActive, '#6366f1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addBtnGradient}
                        >
                            <View style={styles.addBtnInner}>
                                <IconSymbol name="add-circle" size={24} color="#FFF" />
                                <Text style={styles.addBtnText}>Thêm tài khoản ngân hàng</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.footerInfo}>
                    <IconSymbol name="shield" size={16} color={theme.colors.success} />
                    <Text style={styles.footerText}>Thông tin ngân hàng của bạn được mã hóa và bảo mật tuyệt đối.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    // Background Glow Effects (Liquid Style)
    bgGlow1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
    },
    bgGlow2: {
        position: 'absolute',
        bottom: 100,
        left: -50,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
    },
    headerSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.typography,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        lineHeight: 20,
    },
    listContainer: {
        marginBottom: 32,
    },
    addBtnWrapper: {
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: theme.colors.buttonActive,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    addBtnGradient: {
        paddingVertical: 16,
    },
    addBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    addBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 32,
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
}));
