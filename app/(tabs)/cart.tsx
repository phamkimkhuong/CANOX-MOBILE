import React from 'react';
import '@/constants/unistyles';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function CartScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={styles.title}>Giỏ hàng của bạn</Text>

            <View style={styles.contentSection}>
                <Text style={styles.greeting}>Xin chào</Text>
                <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={() => { }}>
                    <Text style={styles.primaryButtonText}>Bấm tôi đi</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Image style={styles.cardImage} source={{ uri: 'https://picsum.photos/700' }} />
                <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>Giày Nike Air</Text>
                    <Text style={styles.cardSubtitle}>2025 Model</Text>

                    <Text style={styles.cardDescription}>Mô tả ngắn về sản phẩm...</Text>
                    <Text style={styles.cardPrice}>$199.00</Text>

                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={() => { }}>
                            <Text style={styles.secondaryButtonText}>Bỏ qua</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.primaryButtonSmall} activeOpacity={0.8} onPress={() => { }}>
                            <Text style={styles.primaryButtonText}>Mua ngay</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        padding: theme.margins.md,
        gap: theme.margins.md,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    contentSection: {
        gap: 10,
    },
    greeting: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    primaryButton: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.m,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    primaryButtonSmall: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.m,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    primaryButtonText: {
        color: theme.colors.onPrimary,
        fontWeight: '700',
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: theme.colors.surface,
    },
    secondaryButtonText: {
        color: theme.colors.typography,
        fontWeight: '700',
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 180,
    },
    cardBody: {
        padding: theme.margins.md,
        gap: 6,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    cardSubtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    cardDescription: {
        marginTop: 4,
        fontSize: 13,
        color: theme.colors.secondary,
    },
    cardPrice: {
        marginTop: 6,
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.error,
    },
    cardActions: {
        marginTop: 10,
        flexDirection: 'row',
        gap: 10,
    },
}));
