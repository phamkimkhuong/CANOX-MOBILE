import { IconSymbol, type IconSymbolName } from '@/components/ui/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export type SectionStateKind =
    | 'secondary-data-error'
    | 'background-error'
    | 'business-guidance'
    | 'empty'
    | 'unavailable';

type SectionStateTone = 'neutral' | 'warning' | 'error' | 'info' | 'success';

interface SectionStateConfig {
    icon: IconSymbolName;
    tone: SectionStateTone;
    titleKey: string;
    messageKey: string;
    actionLabelKey: string;
}

export interface SectionStateCardProps {
    kind?: SectionStateKind;
    title?: string;
    titleKey?: string;
    message?: string;
    messageKey?: string;
    actionLabel?: string;
    actionLabelKey?: string;
    onAction?: () => void;
    onDismiss?: () => void;
    dismissLabel?: string;
    dismissLabelKey?: string;
    icon?: IconSymbolName;
    tone?: SectionStateTone;
    compact?: boolean;
    testID?: string;
}

const DEFAULT_CONFIG: Record<SectionStateKind, SectionStateConfig> = {
    'secondary-data-error': {
        icon: 'cloud-offline-outline',
        tone: 'warning',
        titleKey: 'sectionState.secondaryDataError.title',
        messageKey: 'sectionState.secondaryDataError.message',
        actionLabelKey: 'sectionState.secondaryDataError.actionLabel',
    },
    'background-error': {
        icon: 'alert-circle-outline',
        tone: 'info',
        titleKey: 'sectionState.backgroundError.title',
        messageKey: 'sectionState.backgroundError.message',
        actionLabelKey: 'sectionState.backgroundError.actionLabel',
    },
    'business-guidance': {
        icon: 'info-outline',
        tone: 'info',
        titleKey: 'sectionState.businessGuidance.title',
        messageKey: 'sectionState.businessGuidance.message',
        actionLabelKey: 'sectionState.businessGuidance.actionLabel',
    },
    empty: {
        icon: 'folder-open-outline',
        tone: 'neutral',
        titleKey: 'sectionState.empty.title',
        messageKey: 'sectionState.empty.message',
        actionLabelKey: 'sectionState.empty.actionLabel',
    },
    unavailable: {
        icon: 'warning',
        tone: 'warning',
        titleKey: 'sectionState.unavailable.title',
        messageKey: 'sectionState.unavailable.message',
        actionLabelKey: 'sectionState.unavailable.actionLabel',
    },
};

export function SectionStateCard({
    kind = 'secondary-data-error',
    title,
    titleKey,
    message,
    messageKey,
    actionLabel,
    actionLabelKey,
    onAction,
    onDismiss,
    dismissLabel,
    dismissLabelKey = 'common:actions.done',
    icon,
    tone,
    compact = false,
    testID,
}: SectionStateCardProps) {
    const { theme } = useUnistyles();
    const { t } = useTranslation('common');
    const config = DEFAULT_CONFIG[kind];
    const resolvedTone = tone ?? config.tone;
    const toneStyle = getToneStyle(theme, resolvedTone);
    const resolvedTitle = title ?? (t((titleKey ?? config.titleKey) as never) as string);
    const resolvedMessage = message ?? (t((messageKey ?? config.messageKey) as never) as string);
    const resolvedActionLabel = actionLabel ?? (t((actionLabelKey ?? config.actionLabelKey) as never) as string);
    const resolvedDismissLabel = dismissLabel ?? (t(dismissLabelKey as never) as string);

    return (
        <View
            testID={testID}
            style={[
                styles.card,
                compact ? styles.compactCard : null,
                { borderColor: toneStyle.borderColor, backgroundColor: toneStyle.backgroundColor },
            ]}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={`${resolvedTitle}. ${resolvedMessage}`}
        >
            <View style={[styles.iconBubble, { backgroundColor: toneStyle.iconBackgroundColor }]}>
                <IconSymbol
                    name={icon ?? config.icon}
                    size={compact ? 18 : 22}
                    color={toneStyle.iconColor}
                />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{resolvedTitle}</Text>
                <Text style={styles.message}>{resolvedMessage}</Text>

                {(onAction || onDismiss) ? (
                    <View style={styles.actions}>
                        {onAction ? (
                            <Pressable
                                accessibilityRole="button"
                                style={({ pressed }) => [
                                    styles.primaryAction,
                                    { backgroundColor: toneStyle.actionColor },
                                    pressed ? styles.pressed : null,
                                ]}
                                onPress={onAction}
                            >
                                <Text style={styles.primaryActionText}>{resolvedActionLabel}</Text>
                            </Pressable>
                        ) : null}

                        {onDismiss ? (
                            <Pressable
                                accessibilityRole="button"
                                style={({ pressed }) => [
                                    styles.secondaryAction,
                                    { borderColor: toneStyle.borderColor },
                                    pressed ? styles.pressed : null,
                                ]}
                                onPress={onDismiss}
                            >
                                <Text style={styles.secondaryActionText}>{resolvedDismissLabel}</Text>
                            </Pressable>
                        ) : null}
                    </View>
                ) : null}
            </View>
        </View>
    );
}

const getToneStyle = (theme: ReturnType<typeof useUnistyles>['theme'], tone: SectionStateTone) => {
    switch (tone) {
        case 'error':
            return {
                iconColor: theme.colors.error,
                actionColor: theme.colors.error,
                borderColor: theme.colors.errorLight,
                backgroundColor: theme.colors.errorSubtle,
                iconBackgroundColor: theme.colors.errorLight,
            };
        case 'warning':
            return {
                iconColor: theme.colors.warning,
                actionColor: theme.colors.warning,
                borderColor: theme.colors.warningLight,
                backgroundColor: theme.colors.warningSubtle,
                iconBackgroundColor: theme.colors.warningLight,
            };
        case 'success':
            return {
                iconColor: theme.colors.success,
                actionColor: theme.colors.success,
                borderColor: theme.colors.successLight,
                backgroundColor: theme.colors.successSubtle,
                iconBackgroundColor: theme.colors.successLight,
            };
        case 'info':
            return {
                iconColor: theme.colors.info,
                actionColor: theme.colors.info,
                borderColor: theme.colors.infoLight,
                backgroundColor: theme.colors.infoSubtle,
                iconBackgroundColor: theme.colors.infoLight,
            };
        case 'neutral':
        default:
            return {
                iconColor: theme.colors.secondary,
                actionColor: theme.colors.typography,
                borderColor: theme.colors.borderMuted,
                backgroundColor: theme.colors.surface,
                iconBackgroundColor: theme.colors.secondarySoft,
            };
    }
};

const styles = StyleSheet.create((theme) => ({
    card: {
        flexDirection: 'row',
        gap: theme.margins.smd,
        padding: theme.margins.md,
        borderWidth: 1,
        borderRadius: theme.radius.l,
    },
    compactCard: {
        padding: theme.margins.smd,
    },
    iconBubble: {
        width: 38,
        height: 38,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: theme.fontSizes.md,
        lineHeight: 20,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.typography,
    },
    message: {
        marginTop: theme.margins.xs,
        fontSize: theme.fontSizes.sm,
        lineHeight: 18,
        color: theme.colors.typographySecondary,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        marginTop: theme.margins.smd,
    },
    primaryAction: {
        minHeight: 34,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.margins.md,
    },
    primaryActionText: {
        color: theme.colors.onPrimary,
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.semibold,
    },
    secondaryAction: {
        minHeight: 34,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.surface,
    },
    secondaryActionText: {
        color: theme.colors.typography,
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.medium,
    },
    pressed: {
        opacity: 0.78,
    },
}));
