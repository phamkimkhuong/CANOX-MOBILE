/**
 * ==============================================
 * EMPTY REVIEW STATE - Empty States
 * ==============================================
 * Empty state displays for pending and history tabs
 */

import { IconSymbol } from '@/components/ui/Icon';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface EmptyReviewStateProps {
    /** Type of empty state */
    type: 'pending' | 'history';
    /** Refresh callback */
    onRefresh?: () => void;
}

/**
 * EmptyReviewState - Display when no reviews
 */
export const EmptyReviewState: React.FC<EmptyReviewStateProps> = ({
    type,
    onRefresh,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const router = useRouter();

    const isPending = type === 'pending';

    const config = isPending
        ? {
              icon: 'checkmark.circle' as const,
              title: 'Bạn đã đánh giá tất cả sản phẩm!',
              description:
                  'Mua thêm sản phẩm để nhận xu thưởng khi đánh giá nhé.',
              buttonText: 'Khám phá sản phẩm',
              onButtonPress: () => router.push('/'),
          }
        : {
              icon: 'star' as const,
              title: 'Chưa có đánh giá nào',
              description:
                  'Hãy mua sắm và chia sẻ trải nghiệm của bạn để nhận xu thưởng.',
              buttonText: 'Bắt đầu mua sắm',
              onButtonPress: () => router.push('/'),
          };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconWrapper}>
                    <IconSymbol
                        name={config.icon}
                        size={48}
                        color={theme.colors.secondary}
                    />
                </View>

                {/* Title */}
                <Text style={styles.title}>{config.title}</Text>

                {/* Description */}
                <Text style={styles.description}>{config.description}</Text>

                {/* CTA Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={config.onButtonPress}
                >
                    <Text style={styles.buttonText}>{config.buttonText}</Text>
                </Pressable>

                {/* Refresh link */}
                {onRefresh && (
                    <Pressable style={styles.refreshLink} onPress={onRefresh}>
                        <IconSymbol
                            name="arrow.clockwise"
                            size={14}
                            color={theme.colors.primary}
                        />
                        <Text style={styles.refreshText}>Làm mới</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.margins.xl,
    },
    content: {
        alignItems: 'center',
        maxWidth: 280,
    },
    iconWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: theme.colors.secondaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    description: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: theme.margins.lg,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.margins.xl,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    refreshLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: theme.margins.lg,
        paddingVertical: theme.margins.sm,
    },
    refreshText: {
        fontSize: 14,
        color: theme.colors.primary,
    },
}));

export default EmptyReviewState;
