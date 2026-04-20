import { IconSymbol } from '@/components/ui/Icon';
import { useSupportedBanks } from '@/hooks/api/bank/useBank';
import { BankSupportedUI } from '@/types/bank/ui';
import { BlurView } from 'expo-blur';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface BankSelectModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (bank: BankSupportedUI) => void;
}

/**
 * BankSelectModal - Premium searchable bank selection
 */
export const BankSelectModal: React.FC<BankSelectModalProps> = memo(({
    visible,
    onClose,
    onSelect
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();
    const { t } = useTranslation(['bank']);
    const { data: banks } = useSupportedBanks();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBanks = useMemo(() => {
        if (!banks) return [];
        return banks.filter(bank =>
            bank.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bank.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [banks, searchQuery]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.content}>
                    <BlurView intensity={80} tint="light" style={styles.blurBg}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>{t('bank:modal.title')}</Text>
                            <Pressable onPress={onClose} style={styles.closeBtn}>
                                <IconSymbol name="close" size={24} color={theme.colors.typography} />
                            </Pressable>
                        </View>

                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <IconSymbol name="search" size={20} color={theme.colors.typographySecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={t('bank:modal.searchPlaceholder')}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor={theme.colors.typographySecondary}
                            />
                        </View>

                        {/* Bank List */}
                        <FlatList
                            data={filteredBanks}
                            keyExtractor={(item) => item.id}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={[
                                styles.listContent,
                                { paddingBottom: insets.bottom + 40 }
                            ]}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.bankItem,
                                        pressed && styles.bankItemPressed
                                    ]}
                                    onPress={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                >
                                    <View style={styles.bankLogo}>
                                        <IconSymbol name="account-balance" size={20} color={theme.colors.buttonActive} />
                                    </View>
                                    <View style={styles.bankTextContainer}>
                                        <Text style={styles.bankShortName}>{item.shortName}</Text>
                                        <Text style={styles.bankFullName} numberOfLines={1}>{item.fullName}</Text>
                                    </View>
                                    <IconSymbol name="chevron-right" size={20} color={theme.colors.border} />
                                </Pressable>
                            )}
                        />
                    </BlurView>
                </View>
            </View>
        </Modal>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    content: {
        height: '80%',
        backgroundColor: theme.colors.surface, // Use solid surface color
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        // Support for Shadow/Elevation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    blurBg: {
        flex: 1,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.typography,
        letterSpacing: -0.5,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.backgroundNewInput,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundNewInput,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: theme.colors.typography,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 40,
    },
    bankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.4)', // Subtle background for glass feel
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    bankItemPressed: {
        backgroundColor: theme.colors.activeSoft,
        borderColor: theme.colors.buttonActive,
    },
    bankLogo: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#FFF', // Solid white for logo contrast
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    bankTextContainer: {
        flex: 1,
    },
    bankShortName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    bankFullName: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
}));
