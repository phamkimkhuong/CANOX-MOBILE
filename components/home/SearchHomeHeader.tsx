import { RollingSearchPlaceholder } from '@/components/search/RollingSearchPlaceholder';
import { IconSymbol } from '@/components/ui/Icon';
import { CartHeaderButton, ChatHeaderButton } from '@/components/ui/navigation/HeaderButtons';
import { searchRoutes } from '@/constants/routes';
import '@/constants/unistyles';
import { useHotKeywords } from '@/hooks/api/search';
import { Navigator } from '@/utils/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

/**
 * HomeHeader - Header component cho trang chủ
 * Bao gồm thanh tìm kiếm với Rolling Keywords và các nút chức năng.
 */
export const HomeHeader = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Fetch hot keywords for rolling placeholder
    const { data: hotKeywords, isLoading: isLoadingKeywords } = useHotKeywords({ limit: 10 });

    // Extract keywords array from hot keywords data
    const rollingKeywords = useMemo(() => {
        if (!hotKeywords || hotKeywords.length === 0) return [];
        return hotKeywords.map((item) => item.keyword);
    }, [hotKeywords]);

    const { t } = useTranslation('home');

    // Navigate to search entry screen
    const handleSearchPress = useCallback(() => {
        Navigator.push(searchRoutes.entry());
    }, []);

    return (
        <LinearGradient
            colors={[theme.colors.newPrimary, '#ff5500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.headerContainer}
        >
            {/* 1. Thanh tìm kiếm - Rolling Keywords */}
            <Pressable
                style={({ pressed }) => [
                    styles.searchContainer,
                    pressed && styles.searchContainerPressed,
                ]}
                onPress={handleSearchPress}
            >
                <IconSymbol name="search" size={20} color={theme.colors.secondary} style={styles.searchIcon} />

                <View style={styles.placeholderContainer}>
                    <RollingSearchPlaceholder
                        keywords={rollingKeywords}
                        fallbackText={t('search.placeholder')}
                        animate={!isLoadingKeywords && rollingKeywords.length > 1}
                        interval={3500}
                    />
                </View>
            </Pressable>

            {/* 2. Các nút chức năng dùng chung */}
            <View style={styles.actions}>
                <CartHeaderButton />
                <ChatHeaderButton />
            </View>
        </LinearGradient>
    );
};
const stylesheet = StyleSheet.create((theme) => ({
    headerContainer: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
        paddingTop: UnistylesRuntime.insets.top + 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.backgroundInput,
        paddingHorizontal: 5,
    },
    searchIcon: {
        marginLeft: 10,
    },
    placeholderContainer: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'hidden',
    },
    searchContainerPressed: {
        backgroundColor: theme.colors.backgroundNewInput,
    },
    searchPlaceholder: {
        flex: 1,
        paddingHorizontal: 8,
        fontSize: theme.fontSizes.md,
        color: theme.colors.secondary,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 8,
        fontSize: theme.fontSizes.md,
        color: theme.colors.typography,
        fontFamily: 'System', // Thay bằng font custom nếu có
    },
    cameraBtn: {
        padding: 8,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconBtn: {
        padding: 4,
        position: 'relative',
    },
    iconWrapper: {
        position: 'relative',
    },
    pressedOpacity: {
        opacity: 0.9,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: theme.colors.error,
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff', // Tạo viền trắng cho badge nổi bật
    },
    badgeText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
    }
}));
