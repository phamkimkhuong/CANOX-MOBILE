import { IconSymbol } from '@/components/ui/Icon';
import { SkeletonBox } from '@/components/ui/feedback/Skeleton';
import { useAddressAutocomplete } from '@/hooks/api/useAddressData';
import { MapboxAutocompleteResponse } from '@/types/address';
import { FlashList } from '@shopify/flash-list';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Keyboard,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface AddressSearchSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (suggestion: MapboxAutocompleteResponse) => void;
    countryCode?: string;
    language?: string;
}

export const AddressSearchSheet: React.FC<AddressSearchSheetProps> = memo(({
    visible,
    onClose,
    onSelect,
    countryCode,
    language = 'vi',
}) => {
    const { t } = useTranslation(['address']);
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const searchInputRef = useRef<TextInput>(null);

    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (visible) {
            setSearchText('');
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 300);
        }
    }, [visible]);

    const { data, isFetching } = useAddressAutocomplete(
        searchText,
        language,
        { enabled: visible && searchText.length >= 3, countryCode }
    );

    const suggestions = data?.data ?? [];

    const handleSelect = useCallback(
        (item: MapboxAutocompleteResponse) => {
            Keyboard.dismiss();
            onSelect(item);
            onClose();
        },
        [onSelect, onClose]
    );

    const renderItem = useCallback(
        ({ item }: { item: MapboxAutocompleteResponse }) => (
            <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [
                    styles.item,
                    pressed && styles.itemPressed,
                ]}
            >
                <View style={styles.itemIcon}>
                    <IconSymbol name="location-outline" size={20} color={theme.colors.secondary} />
                </View>
                <View style={styles.itemContent}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.text}
                    </Text>
                    <Text style={styles.itemSubTitle} numberOfLines={2}>
                        {item.placeName}
                    </Text>
                </View>
            </Pressable>
        ),
        [handleSelect, styles, theme.colors.secondary]
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('address:form.search.label')}</Text>
                    <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
                        <IconSymbol name="close" size={24} color={theme.colors.typography} />
                    </Pressable>
                </View>

                <View style={styles.searchContainer}>
                    <IconSymbol name="search" size={20} color={theme.colors.secondary} />
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder={t('address:form.search.placeholder')}
                        placeholderTextColor={theme.colors.secondary}
                        value={searchText}
                        onChangeText={setSearchText}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.listContainer}>
                    {isFetching ? (
                        <SearchSkeleton />
                    ) : suggestions.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <IconSymbol name="search" size={48} color={theme.colors.border} />
                            <Text style={styles.emptyText}>
                                {searchText.length < 3
                                    ? t('address:form.search.placeholder')
                                    : t('address:form.search.noResults')}
                            </Text>
                        </View>
                    ) : (
                        <FlashList<MapboxAutocompleteResponse>
                            data={suggestions}
                            renderItem={renderItem}
                            keyboardShouldPersistTaps="handled"
                        />
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
});

const SearchSkeleton = () => {
    const styles = stylesheet;
    return (
        <View style={styles.skeletonContainer}>
            {Array.from({ length: 10 }).map((_, i) => (
                <View key={i} style={styles.skeletonItem}>
                    <SkeletonBox width="60%" height={16} style={styles.skeletonTitle} />
                    <SkeletonBox width="90%" height={12} />
                </View>
            ))}
        </View>
    );
};

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
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        margin: theme.margins.md,
        paddingHorizontal: theme.margins.smd,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.margins.sm,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: theme.colors.typography,
    },
    listContainer: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        padding: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        gap: theme.margins.md,
    },
    itemPressed: {
        backgroundColor: theme.colors.backgroundSurface,
    },
    itemIcon: {
        marginTop: 2,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    itemSubTitle: {
        fontSize: 13,
        color: theme.colors.secondary,
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.md,
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.secondary,
    },
    skeletonContainer: {
        padding: theme.margins.md,
    },
    skeletonItem: {
        paddingVertical: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    skeletonTitle: {
        marginBottom: 8,
    },
}));
