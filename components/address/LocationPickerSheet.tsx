/**
 * LocationPickerSheet - Smart BottomSheet for selecting Province/Ward
 * 
 * Features:
 * - Search with debounce (300ms)
 * - Infinite scroll pagination
 * - Skeleton loading
 * - Auto-focus search input
 */

import { IconSymbol } from '@/components/ui/Icon';
import { SkeletonBox } from '@/components/ui/feedback/Skeleton';
import { useFlattenedCountries, useFlattenedProvinces, useFlattenedWards } from '@/hooks/api/useAddressData';
import type { Country, Province, Ward } from '@/types/address';
import { FlashList } from '@shopify/flash-list';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Keyboard,
    Modal,
    Pressable,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type PickerType = 'country' | 'province' | 'ward';

interface LocationPickerSheetProps {
    type: PickerType;
    provinceCode?: string | null;
    /** Currently selected value */
    selectedValue?: Country | Province | Ward | null;
    visible: boolean;
    onClose: () => void;
    onSelect: (item: Country | Province | Ward) => void;
}

// ============================================
// COMPONENT
// ============================================

export const LocationPickerSheet: React.FC<LocationPickerSheetProps> = memo(({
    type,
    provinceCode,
    selectedValue,
    visible,
    onClose,
    onSelect,
}) => {
    const { t } = useTranslation(['address']);
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const searchInputRef = useRef<TextInput>(null);

    // Search state
    const [searchText, setSearchText] = useState('');

    // Reset search when modal opens/closes
    useEffect(() => {
        if (visible) {
            setSearchText('');
            // Auto focus search input after modal animation
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 300);
        }
    }, [visible]);

    // Fetch data based on type
    const countriesQuery = useFlattenedCountries({
        search: searchText,
        enabled: visible && type === 'country',
    });

    const provincesQuery = useFlattenedProvinces({
        search: searchText,
        enabled: visible && type === 'province',
    });

    const wardsQuery = useFlattenedWards({
        provinceCode: provinceCode ?? null,
        search: searchText,
        enabled: visible && type === 'ward' && !!provinceCode,
    });

    // Select the right query based on type
    const getQueryData = () => {
        switch (type) {
            case 'country': return { query: countriesQuery, items: countriesQuery.countries };
            case 'province': return { query: provincesQuery, items: provincesQuery.provinces };
            case 'ward': return { query: wardsQuery, items: wardsQuery.wards };
            default: return { query: provincesQuery, items: [] };
        }
    };

    const { query, items } = getQueryData();

    // Title based on type
    const getTitle = () => {
        switch (type) {
            case 'country': return t('address:picker.countryTitle');
            case 'province': return t('address:picker.provinceTitle');
            case 'ward': return t('address:picker.wardTitle');
        }
    };

    const getPlaceholder = () => {
        switch (type) {
            case 'country': return t('address:form.country.placeholder');
            case 'province': return t('address:picker.provincePlaceholder');
            case 'ward': return t('address:picker.wardPlaceholder');
        }
    };

    const title = getTitle();
    const placeholder = getPlaceholder();

    // Handle item selection
    const handleSelect = useCallback(
        (item: Country | Province | Ward) => {
            Keyboard.dismiss();
            onSelect(item);
            onClose();
        },
        [onSelect, onClose]
    );

    // Handle load more (No longer needed for non-paginated data)
    const handleEndReached = useCallback(() => {
        // No-op
    }, []);

    // Render item
    const renderItem = useCallback(
        ({ item }: { item: Country | Province | Ward }) => {
            const isSelected = selectedValue?.code === item.code;

            const name = (item as Country).name || (item as Province | Ward).fullName;

            return (
                <Pressable
                    onPress={() => handleSelect(item)}
                    style={({ pressed }) => [
                        styles.item,
                        isSelected && styles.itemSelected,
                        pressed && styles.itemPressed,
                    ]}
                >
                    <Text
                        style={[styles.itemText, isSelected && styles.itemTextSelected]}
                        numberOfLines={1}
                    >
                        {name}
                    </Text>
                    {isSelected && (
                        <IconSymbol
                            name="check"
                            size={20}
                            color={theme.colors.primary}
                        />
                    )}
                </Pressable>
            );
        },
        [selectedValue, handleSelect, styles, theme.colors.primary]
    );

    // Render footer (loading indicator)
    const renderFooter = useCallback(() => {
        return null;
    }, []);

    // Key extractor
    const keyExtractor = useCallback(
        (item: Country | Province | Ward) => item.code,
        []
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <Pressable
                        onPress={onClose}
                        style={styles.closeButton}
                        hitSlop={8}
                    >
                        <IconSymbol
                            name="close"
                            size={24}
                            color={theme.colors.typography}
                        />
                    </Pressable>
                </View>

                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <IconSymbol
                        name="search"
                        size={20}
                        color={theme.colors.secondary}
                    />
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder={placeholder}
                        placeholderTextColor={theme.colors.secondary}
                        value={searchText}
                        onChangeText={setSearchText}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                        autoCorrect={false}
                    />
                    {searchText.length > 0 && (
                        <Pressable
                            onPress={() => setSearchText('')}
                            hitSlop={8}
                        >
                            <IconSymbol
                                name="close"
                                size={18}
                                color={theme.colors.secondary}
                            />
                        </Pressable>
                    )}
                </View>

                {/* Results count */}
                {!query.isLoading && items.length > 0 && (
                    <Text style={styles.resultCount}>
                        {query.totalCount} {t('address:picker.results')}
                    </Text>
                )}


                {/* List */}
                <View style={styles.listContainer}>
                    {query.isLoading ? (
                        <LocationPickerSkeleton />
                    ) : items.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <IconSymbol
                                name="location-outline"
                                size={48}
                                color={theme.colors.secondary}
                            />
                            <Text style={styles.emptyText}>
                                {searchText
                                    ? t('address:picker.notFound', { search: searchText })
                                    : t('address:picker.emptyText')}
                            </Text>
                        </View>
                    ) : (
                        <FlashList
                            data={items}
                            renderItem={renderItem}
                            keyExtractor={keyExtractor}
                            onEndReached={handleEndReached}
                            onEndReachedThreshold={0.3}
                            ListFooterComponent={renderFooter}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
});

LocationPickerSheet.displayName = 'LocationPickerSheet';

// ============================================
// SKELETON
// ============================================

const LocationPickerSkeleton: React.FC = memo(() => {
    const styles = stylesheet;

    return (
        <View style={styles.skeletonContainer}>
            {Array.from({ length: 10 }).map((_, index) => (
                <View key={index} style={styles.skeletonItem}>
                    <SkeletonBox width="75%" height={18} />
                </View>
            ))}
        </View>
    );
});

LocationPickerSkeleton.displayName = 'LocationPickerSkeleton';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    closeButton: {
        position: 'absolute',
        right: theme.margins.md,
        padding: theme.margins.sm,
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.margins.md,
        marginVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.smd,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.margins.sm,
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 15,
        color: theme.colors.typography,
    },

    resultCount: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
    },

    listContainer: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    itemSelected: {
        backgroundColor: theme.colors.primaryMuted,
    },
    itemPressed: {
        backgroundColor: theme.colors.backgroundSurface,
    },
    itemText: {
        flex: 1,
        fontSize: 15,
        color: theme.colors.typography,
    },
    itemTextSelected: {
        color: theme.colors.primary,
        fontWeight: '500',
    },

    footer: {
        paddingVertical: theme.margins.md,
        alignItems: 'center',
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.margins.xl,
        gap: theme.margins.md,
    },
    emptyText: {
        fontSize: 15,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },

    skeletonContainer: {
        padding: theme.margins.md,
    },
    skeletonItem: {
        paddingVertical: theme.margins.smd,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
}));
