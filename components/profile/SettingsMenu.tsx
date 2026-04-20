import { IconSymbol } from '@/components/ui/Icon';
import { ProfileMenuItem, SETTINGS_MENU_CONFIG } from '@/types/profile/profile';
import { Navigator } from '@/utils/navigation';
import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SettingsMenuProps {
    appVersion?: string;
    onPressItem?: (route: string) => void;
}

interface MenuItemProps {
    item: ProfileMenuItem;
    isFirst: boolean;
    isLast: boolean;
    onPress: (route: string) => void;
    value?: string;
}

/**
 * Single menu item component
 */
const MenuItem: React.FC<MenuItemProps> = memo(({ item, isFirst, isLast, onPress, value }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('profile');
    const styles = stylesheet;

    return (
        <TouchableOpacity
            style={[
                styles.menuItem,
                isFirst && styles.menuItemFirst,
                isLast && styles.menuItemLast,
            ]}
            onPress={() => onPress(item.route)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconWrapper, { backgroundColor: item.backgroundColor }]}>
                <IconSymbol
                    name={item.icon as keyof typeof IconSymbol}
                    size={18}
                    color={item.iconColor}
                />
            </View>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Text style={styles.menuLabel}>{t(`menu.${item.key}` as any)}</Text>
            {value && <Text style={styles.menuValue}>{value}</Text>}
            <IconSymbol name="chevron-right" size={18} color={theme.colors.typographySecondary} />
        </TouchableOpacity>
    );
});

MenuItem.displayName = 'MenuItem';

/**
 * Settings menu section with grouped items
 */
export const SettingsMenu: React.FC<SettingsMenuProps> = memo(({ appVersion = '1.0.0', onPressItem }) => {
    const styles = stylesheet;
    const { t } = useTranslation('profile');

    const handlePress = useCallback((route: string) => {
        if (onPressItem) {
            onPressItem(route);
        } else {
            Navigator.navigate(route as never);
        }
    }, [onPressItem]);

    const getValue = useCallback((key: string): string | undefined => {
        switch (key) {
            case 'version':
                return appVersion;
            default:
                return undefined;
        }
    }, [appVersion]);

    // Group items by category
    const groupedItems = useMemo(() => SETTINGS_MENU_CONFIG.reduce<Record<string, ProfileMenuItem[]>>(
        (acc, item) => {
            const group = item.group ?? 'other';
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(item);
            return acc;
        },
        {}
    ), []);

    const groups = Object.entries(groupedItems);

    return (
        <View style={styles.container}>
            {groups.map(([groupKey, items], groupIndex) => (
                <React.Fragment key={groupKey}>
                    <Text style={styles.groupTitle}>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {t(`settings.sections.${groupKey}` as any)}
                    </Text>
                    <View
                        style={[
                            styles.group,
                            groupIndex === groups.length - 1 && styles.groupLast,
                        ]}
                    >
                        {items.map((item, index) => (
                            <MenuItem
                                key={item.key}
                                item={item}
                                isFirst={index === 0}
                                isLast={index === items.length - 1}
                                onPress={handlePress}
                                value={getValue(item.key)}
                            />
                        ))}
                    </View>
                </React.Fragment>
            ))}
        </View>
    );
});

SettingsMenu.displayName = 'SettingsMenu';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginHorizontal: theme.margins.md,
        // gap: theme.margins.md,
    },
    groupTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.typographySecondary,
        marginBottom: theme.margins.sm,
        marginLeft: theme.margins.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    group: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    groupLast: {
        marginBottom: 20, // Space for tab bar
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    menuItemFirst: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    menuItemLast: {
        borderBottomWidth: 0,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        marginLeft: theme.margins.md,
    },
    menuValue: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        marginRight: theme.margins.sm,
    },
}));
