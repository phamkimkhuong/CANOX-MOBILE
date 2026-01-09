import { IconSymbol } from '@/components/ui/Icon';
import { CHAT_FILTER_TABS, ChatFilter } from '@/types/chat';
import { Navigator } from '@/utils/navigation';
import React from 'react';
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
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    activeFilter,
    onFilterChange,
    searchQuery,
    onSearchChange,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Title Row */}
            <View style={styles.titleRow}>
                {/* Nút Back - UX: Tăng hitSlop để dễ bấm */}
                <TouchableOpacity
                    onPress={() => Navigator.back()}
                    style={styles.backBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                </TouchableOpacity>
                <Text style={styles.title}>Tin nhắn</Text>
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
                    placeholder="Tìm kiếm Shop, tin nhắn..."
                    placeholderTextColor={theme.colors.secondary}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
                <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
                    <IconSymbol name="tune" size={20} color={theme.colors.secondary} />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsContainer}
            >
                {CHAT_FILTER_TABS.map((tab) => {
                    const isActive = activeFilter === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, isActive && styles.tabActive]}
                            onPress={() => onFilterChange(tab.key)}
                            activeOpacity={0.7}
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
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.zero,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm
    },
    backBtn: {
        marginRight: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.onPrimary,
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
        marginTop: theme.margins.sm,
        marginBottom: theme.margins.sm,
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
    filterBtn: {
        padding: theme.margins.sm,
    },
    tabsContainer: {
        gap: theme.margins.lg,
        paddingTop: theme.margins.sm,
    },
    tab: {
        paddingBottom: theme.margins.sm,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: theme.colors.onPrimary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.textOnOverlay,
    },
    tabTextActive: {
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
}));
