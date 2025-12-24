import { ICON_COLOR_MAP } from '@/constants/settings';
import type { SettingsItem as SettingsItemType } from '@/types/settings';
import { MaterialIcons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SettingsItemProps {
    item: SettingsItemType;
    /** Current value for toggle type */
    toggleValue?: boolean;
    /** Handler for toggle change */
    onToggleChange?: (value: boolean) => void;
    /** Dynamic info value (e.g., cache size) */
    infoValue?: string;
    onPress?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
}

/**
 * Polymorphic Settings Item Component
 * Renders different UI based on item type:
 * - link: Navigation with chevron
 * - toggle: Switch on/off
 * - info: Display text value
 * - action: Button with special styling
 */
export const SettingsItem: React.FC<SettingsItemProps> = memo(({
    item,
    toggleValue = false,
    onToggleChange,
    infoValue,
    onPress,
    isFirst = false,
    isLast = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const iconColors = ICON_COLOR_MAP[item.iconColor];

    const handlePress = useCallback(() => {
        if (item.type === 'toggle') {
            onToggleChange?.(!toggleValue);
        } else {
            onPress?.();
        }
    }, [item.type, onPress, onToggleChange, toggleValue]);

    const handleToggleChange = useCallback((value: boolean) => {
        onToggleChange?.(value);
    }, [onToggleChange]);

    // Get icon name mapping (MaterialIcons uses different names)
    const getIconName = (icon: string): keyof typeof MaterialIcons.glyphMap => {
        const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
            'badge': 'badge',
            'lock': 'lock',
            'link': 'link',
            'fingerprint': 'fingerprint',
            'credit-card': 'credit-card',
            'notifications': 'notifications',
            'language': 'language',
            'dark-mode': 'dark-mode',
            'delete-sweep': 'delete-sweep',
            'policy': 'policy',
            'description': 'description',
            'star': 'star',
            'logout': 'logout',
            'delete-forever': 'delete-forever',
        };
        return iconMap[icon] ?? 'chevron-right';
    };

    // Render right side based on type
    const renderRightContent = () => {
        switch (item.type) {
            case 'link':
                return (
                    <View style={styles.rightContent}>
                        {item.subtitle && (
                            <Text style={styles.subtitle}>{item.subtitle}</Text>
                        )}
                        <MaterialIcons
                            name="chevron-right"
                            size={20}
                            color={theme.colors.secondary}
                        />
                    </View>
                );

            case 'toggle':
                return (
                    <Switch
                        value={toggleValue}
                        onValueChange={handleToggleChange}
                        trackColor={{
                            false: theme.colors.secondaryLight,
                            true: theme.colors.primary,
                        }}
                        thumbColor={theme.colors.surface}
                        ios_backgroundColor={theme.colors.secondaryLight}
                    />
                );

            case 'info':
                return (
                    <View style={styles.rightContent}>
                        <Text style={styles.infoValue}>
                            {infoValue ?? item.value ?? '—'}
                        </Text>
                        <MaterialIcons
                            name="chevron-right"
                            size={20}
                            color={theme.colors.secondary}
                        />
                    </View>
                );

            case 'action':
                return null;

            default:
                return null;
        }
    };

    // Action type has different styling
    if (item.type === 'action') {
        const isDestructive = item.actionStyle === 'danger';
        return (
            <TouchableOpacity
                style={[
                    styles.actionContainer,
                    isDestructive && styles.actionDestructive,
                ]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <MaterialIcons
                    name={getIconName(item.icon)}
                    size={20}
                    color={isDestructive ? theme.colors.error : theme.colors.typographySecondary}
                />
                <Text style={[
                    styles.actionLabel,
                    isDestructive && styles.actionLabelDestructive,
                ]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[
                styles.container,
                isFirst && styles.containerFirst,
                isLast && styles.containerLast,
            ]}
            onPress={handlePress}
            activeOpacity={item.type === 'toggle' ? 1 : 0.7}
            disabled={item.type === 'toggle'}
        >
            {/* Left: Icon + Label */}
            <View style={styles.leftContent}>
                <View style={[styles.iconBox, { backgroundColor: iconColors.bg }]}>
                    <MaterialIcons
                        name={getIconName(item.icon)}
                        size={22}
                        color={iconColors.icon}
                    />
                </View>
                <Text style={styles.label}>{item.label}</Text>
            </View>

            {/* Right: Type-specific content */}
            {renderRightContent()}
        </TouchableOpacity>
    );
});

SettingsItem.displayName = 'SettingsItem';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    containerFirst: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    containerLast: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderBottomWidth: 0,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.typography,
        flex: 1,
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },
    infoValue: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },
    // Action button styles
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 8,
    },
    actionDestructive: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    actionLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    actionLabelDestructive: {
        color: theme.colors.error,
    },
}));
