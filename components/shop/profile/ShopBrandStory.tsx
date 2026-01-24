/**
 * ==============================================
 * SHOP BRAND STORY - About the brand
 * ==============================================
 */

import React, { memo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopBrandStoryProps {
    story: string;
    foundedYear?: number | null;
    title?: string;
}

const MAX_LINES = 4;

export const ShopBrandStory = memo(({
    story,
    foundedYear,
    title = 'Về chúng tôi'
}: ShopBrandStoryProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const [expanded, setExpanded] = useState(false);

    if (!story) return null;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {foundedYear && (
                    <Text style={styles.foundedText}>Thành lập {foundedYear}</Text>
                )}
            </View>
            <Text
                style={styles.storyText}
                numberOfLines={expanded ? undefined : MAX_LINES}
            >
                {story}
            </Text>
            {story.length > 200 && (
                <Pressable onPress={() => setExpanded(!expanded)}>
                    <Text style={styles.expandText}>
                        {expanded ? 'Thu gọn' : 'Xem thêm'}
                    </Text>
                </Pressable>
            )}
        </View>
    );
});

ShopBrandStory.displayName = 'ShopBrandStory';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.margins.sm,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    foundedText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    storyText: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        lineHeight: 20,
    },
    expandText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        marginTop: theme.margins.xs,
    },
}));

export default ShopBrandStory;
