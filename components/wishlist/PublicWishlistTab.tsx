import { IconSymbol } from '@/components/ui/Icon';
import { WishlistCard } from '@/components/wishlist/WishlistCard';
import {
    flattenSearchResults,
    useLatestWishlists,
    usePopularWishlists,
    useSearchWishlists
} from '@/hooks/api/wishlist/usePublicWishlists';
import { Navigator } from '@/utils/navigation';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export const PublicWishlistTab: React.FC = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('wishlist');

    const [keyword, setKeyword] = useState('');

    const { data: popularData, isLoading: isLoadingPopular } = usePopularWishlists();
    const { data: latestData, isLoading: isLoadingLatest } = useLatestWishlists();

    // Using enabled: false because we want to trigger it manually or debounced?
    // useSearchWishlists requires length >= 2 to run.
    const searchResult = useSearchWishlists(keyword, keyword.length >= 2);

    const handleWishlistPress = useCallback((id: string) => {
        Navigator.push({
            pathname: '/(main)/(user)/wishlist/[id]',
            params: { id },
        });
    }, []);

    const isSearching = keyword.length >= 2;
    const searchData = flattenSearchResults(searchResult.data);

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <IconSymbol name="search" size={20} color={theme.colors.secondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('publicTab.searchPlaceholder')}
                        placeholderTextColor={theme.colors.secondary}
                        value={keyword}
                        onChangeText={setKeyword}
                        returnKeyType="search"
                    />
                    {keyword.length > 0 && (
                        <Pressable onPress={() => setKeyword('')} style={{ padding: 4 }}>
                            <IconSymbol
                                name="close-circle"
                                size={20}
                                color={theme.colors.secondary}
                            />
                        </Pressable>
                    )}
                </View>
            </View>

            {isSearching ? (
                // SEARCH RESULTS
                <View style={styles.listContainer}>
                    {searchResult.isLoading ? (
                        <ActivityIndicator size="large" color={theme.colors.newPrimary} style={styles.loader} />
                    ) : searchData.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{t('publicTab.emptySearch')}</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={searchData}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.flatListContent}
                            renderItem={({ item }) => (
                                <WishlistCard
                                    wishlist={item}
                                    onPress={handleWishlistPress}
                                />
                            )}
                            onEndReached={() => {
                                if (searchResult.hasNextPage) searchResult.fetchNextPage();
                            }}
                        />
                    )}
                </View>
            ) : (
                // DEFAULT DISCOVERY VIEW
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Popular Wishlists */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleContainer}>
                            <IconSymbol name="fire" size={20} color="#ef4444" />
                            <Text style={styles.sectionTitle}>{t('publicTab.popularTitle')}</Text>
                        </View>
                        {isLoadingPopular ? (
                            <ActivityIndicator size="small" color={theme.colors.newPrimary} style={styles.loader} />
                        ) : (
                            popularData?.content.map((wishlist) => (
                                <WishlistCard
                                    key={`pop-${wishlist.id}`}
                                    wishlist={wishlist}
                                    onPress={handleWishlistPress}
                                />
                            ))
                        )}
                    </View>

                    {/* Latest Wishlists */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleContainer}>
                            <IconSymbol name="celebration" size={20} color="#eab308" />
                            <Text style={styles.sectionTitle}>{t('publicTab.latestTitle')}</Text>
                        </View>
                        {isLoadingLatest ? (
                            <ActivityIndicator size="small" color={theme.colors.newPrimary} style={styles.loader} />
                        ) : (
                            latestData?.content.map((wishlist) => (
                                <WishlistCard
                                    key={`lat-${wishlist.id}`}
                                    wishlist={wishlist}
                                    onPress={handleWishlistPress}
                                />
                            ))
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    searchContainer: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
        paddingBottom: theme.margins.sm,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        paddingHorizontal: theme.margins.sm,
        height: 44,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: theme.margins.sm,
        fontSize: 14,
        color: theme.colors.typography,
    },
    listContainer: {
        flex: 1,
    },
    flatListContent: {
        paddingVertical: theme.margins.md,
    },
    scrollContent: {
        paddingVertical: theme.margins.md,
        paddingBottom: theme.margins.xl,
    },
    section: {
        marginBottom: theme.margins.lg,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
        gap: 6,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.typography,
    },
    loader: {
        marginTop: theme.margins.md,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: theme.colors.typographySecondary,
        fontSize: 14,
    },
}));
