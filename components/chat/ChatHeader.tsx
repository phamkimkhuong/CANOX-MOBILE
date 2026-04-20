import { IconSymbol } from '@/components/ui/Icon';
import { ChatFilter } from '@/types/chat';
import { Navigator } from '@/utils/navigation';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * ChatHeader - Header component cho màn hình Chat
 * 
 * Bao gồm:
 * - Title và nút back
 * - Search bar với filter button
 * - Filter tabs (All, Unread, Shop, Support)
 */
interface ChatHeaderProps {
    activeFilter: ChatFilter;
    onFilterChange: (filter: ChatFilter) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    showBack?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    activeFilter,
    onFilterChange,
    searchQuery,
    onSearchChange,
    showBack = true,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['chat', 'common']);
    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    const translatedTabs = useMemo(() => [
        { key: ChatFilter.ALL, label: t('list.filterAll') },
        { key: ChatFilter.UNREAD, label: t('list.filterUnread') },
        { key: ChatFilter.SHOP, label: t('list.filterShop') },
        { key: ChatFilter.SUPPORT, label: t('list.filterSupport') },
    ], [t]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Title Row */}
            <View style={styles.titleRow}>
                {showBack && (
                    /* Nút Back - UX: Tăng hitSlop để dễ bấm */
                    <TouchableOpacity
                        onPress={() => Navigator.back()}
                        style={styles.backBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel={t('common:actions.back')}
                    >
                        <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                    </TouchableOpacity>
                )}
                <Text style={styles.title}>{t('list.title')}</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <IconSymbol
                    name="search"
                    size={20}
                    color={theme.colors.secondary}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('list.search')}
                    placeholderTextColor={theme.colors.secondary}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
            </View>

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsContainer}
                keyboardShouldPersistTaps="handled"
            >
                {translatedTabs.map((tab) => {
                    const isActive = activeFilter === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, isActive && styles.tabActive]}
                            onPress={() => onFilterChange(tab.key)}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isActive }}
                        >
                            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        gap: theme.margins.sm
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        marginLeft: -theme.margins.sm,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.3,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.sm,
        marginBottom: theme.margins.sm,
        height: 40,
    },
    searchIcon: {
        marginRight: theme.margins.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: theme.margins.smd,
        fontSize: 14,
        color: theme.colors.typography,
    },
    tabsContainer: {
        gap: theme.margins.lg,
        paddingBottom: theme.margins.sm,
    },
    tab: {
        paddingBottom: theme.margins.sm,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: theme.colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.secondary,
    },
    tabTextActive: {
        fontWeight: '600',
        color: theme.colors.primary,
    },
}));
