import { SETTINGS_MENU_CONFIG, SettingsMenuItem } from '@/types/profile';
import { MaterialIcons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SettingsMenuProps {
    onPressItem?: (route: string) => void;
}

interface MenuItemProps {
    item: SettingsMenuItem;
    isFirst: boolean;
    isLast: boolean;
    onPress: (route: string) => void;
}

/**
 * Single menu item component
 */
const MenuItem: React.FC<MenuItemProps> = memo(({ item, isFirst, isLast, onPress }) => {
    const { theme } = useUnistyles();
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
                <MaterialIcons
                    name={item.icon as keyof typeof MaterialIcons.glyphMap}
                    size={18}
                    color={item.iconColor}
                />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <MaterialIcons name="chevron-right" size={18} color={theme.colors.typographySecondary} />
        </TouchableOpacity>
    );
});

MenuItem.displayName = 'MenuItem';

/**
 * Settings menu section with grouped items
 */
export const SettingsMenu: React.FC<SettingsMenuProps> = memo(({ onPressItem }) => {
    const styles = stylesheet;

    const handlePress = useCallback((route: string) => {
        onPressItem?.(route);
        // TODO: Navigate to route
    }, [onPressItem]);

    // Group items by category
    const groupedItems = SETTINGS_MENU_CONFIG.reduce<Record<string, SettingsMenuItem[]>>(
        (acc, item) => {
            const group = item.group ?? 'other';
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(item);
            return acc;
        },
        {}
    );

    const groups = Object.entries(groupedItems);

    return (
        <View style={styles.container}>
            {groups.map(([groupKey, items], groupIndex) => (
                <View
                    key={groupKey}
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
                        />
                    ))}
                </View>
            ))}
        </View>
    );
});

SettingsMenu.displayName = 'SettingsMenu';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginHorizontal: theme.margins.md,
        gap: theme.margins.md,
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
        marginBottom: 100, // Space for tab bar
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
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
}));
