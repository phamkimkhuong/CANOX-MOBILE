import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from './Icon';

interface SectionHeaderProps {
    title: string;
    onSeeAll?: () => void;
}

export const SectionHeader = ({ title, onSeeAll }: SectionHeaderProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {onSeeAll && (
                <TouchableOpacity style={styles.seeAllBtn} onPress={onSeeAll}>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                    <IconSymbol name="chevron-right" size={16} color={theme.colors.secondary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.margins.sm,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.typography,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: 12,
        color: theme.colors.secondary,
        fontWeight: '500',
    },
}));
