/**
 * ==============================================
 * LANGUAGE SETTINGS SCREEN
 * ==============================================
 * Screen change language of app
 * Support: Vietnamese (vi), English (en)
 * 
 * Design:
 * - Radio selection cards with clear visual feedback
 * - Apply button to confirm changes (UX improvement)
 * - Sync with i18next and persistent storage
 */

import { SettingsHeader } from '@/components/settings';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { useAppStore } from '@/store/useAppStore';
import { SupportedLanguage } from '@/utils/language';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================
// LANGUAGE OPTIONS
// ============================================

interface LanguageOption {
    code: SupportedLanguage;
    nativeName: string;
    englishName: string;
    flag: string; // Emoji flag
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
    {
        code: 'vi',
        nativeName: 'Tiếng Việt',
        englishName: 'Vietnamese',
        flag: '🇻🇳',
    },
    {
        code: 'en',
        nativeName: 'English',
        englishName: 'English',
        flag: '🇺🇸',
    },
    {
        code: 'lo',
        nativeName: 'ພາສາລາວ',
        englishName: 'Lao',
        flag: '🇱🇦',
    },
    {
        code: 'km',
        nativeName: 'ភាសាខ្មែរ',
        englishName: 'Khmer',
        flag: '🇰🇭',
    },
];

// ============================================
// LANGUAGE CARD COMPONENT
// ============================================

interface LanguageCardProps {
    option: LanguageOption;
    isSelected: boolean;
    onSelect: () => void;
}

const LanguageCard: React.FC<LanguageCardProps> = ({
    option,
    isSelected,
    onSelect,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <TouchableOpacity
            style={[
                styles.languageCard,
                isSelected && styles.languageCardSelected,
            ]}
            onPress={onSelect}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={`${option.nativeName} (${option.englishName})`}
        >
            {/* Language Names */}
            <View style={styles.languageInfo}>
                <Text style={[
                    styles.nativeName,
                    isSelected && styles.nativeNameSelected,
                ]}>
                    {option.nativeName}
                </Text>
                <Text style={styles.englishName}>
                    {option.englishName}
                </Text>
            </View>

            {/* Selection Indicator */}
            <View style={[
                styles.radioOuter,
                isSelected && styles.radioOuterSelected,
            ]}>
                {isSelected && (
                    <View style={styles.radioInner}>
                        <MaterialIcons
                            name="check"
                            size={14}
                            color={theme.colors.onPrimary}
                        />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

// ============================================
// MAIN SCREEN
// ============================================

export default function LanguageSettingsScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { theme } = useUnistyles();

    const styles = stylesheet;
    const insets = useSafeAreaInsets();
    const { i18n } = useTranslation('common');

    // Store settings
    const currentLanguage = useAppStore((state) => state.language);
    const setLanguage = useAppStore((state) => state.setLanguage);

    // Local state for pending selection
    const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(currentLanguage);

    // Checks if there are unsaved changes
    const hasChanges = selectedLang !== currentLanguage;

    // Memoized header title
    const headerTitle = useMemo(() => 'Ngôn ngữ / Language', []);

    // Helper text
    const getText = useCallback((vi: string, en: string, lo: string, km: string) => selectedLang === 'vi' ? vi : selectedLang === 'lo' ? lo : selectedLang === 'km' ? km : en, [selectedLang]);

    /**
     * Handle apply changes
     * - Update store (persist)
     * - Change i18next immediately
     * - Show toast confirmation
     */
    const handleApply = useCallback(() => {
        if (!hasChanges) return;

        // Update store and i18n
        setLanguage(selectedLang);
        i18n.changeLanguage(selectedLang);

        // Find language name to display in toast
        const langInfo = LANGUAGE_OPTIONS.find(l => l.code === selectedLang);

        Toast.show({
            type: 'success',
            text1: getText('Đã cập nhật ngôn ngữ', 'Language updated', 'ອັບເດດພາສາແລ້ວ', 'បានធ្វើបច្ចុប្បន្នភាពភាសា'),
            text2: langInfo?.nativeName,
            visibilityTime: 2000,
        });
    }, [selectedLang, hasChanges, setLanguage, i18n, getText]);

    return (
        <View style={styles.container}>
            <SettingsHeader
                title={headerTitle}
                showHelpButton={false}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + 100 } // Extra padding for fixed button
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <MaterialIcons
                        name="translate"
                        size={20}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.sectionTitle}>
                        {getText('Chọn ngôn ngữ hiển thị', 'Select display language', 'ເລືອກພາສາສະແດງຜົນ', 'ជ្រើសរើសភាសាបង្ហាញ')}
                    </Text>
                </View>

                {/* Language Options */}
                <View style={styles.optionsContainer}>
                    {LANGUAGE_OPTIONS.map((option) => (
                        <LanguageCard
                            key={option.code}
                            option={option}
                            isSelected={selectedLang === option.code}
                            onSelect={() => setSelectedLang(option.code)}
                        />
                    ))}
                </View>

                {/* Footer Note */}
                <View style={styles.footerNote}>
                    <MaterialIcons
                        name="info-outline"
                        size={16}
                        color={theme.colors.typographySecondary}
                    />
                    <Text style={styles.footerNoteText}>
                        {getText(
                            'Nhấn nút "Áp dụng" bên dưới để thay đổi ngôn ngữ cho toàn bộ ứng dụng.',
                            'Press the "Apply" button below to change the language for the entire app.',
                            'ກົດປຸ່ມ "ນຳໃຊ້" ຂ້າງລຸ່ມນີ້ເພື່ອປ່ຽນພາສາສຳລັບແອັບທັງໝົດ.',
                            'ចុចប៊ូតុង "អនុវត្ត" ខាងក្រោមដើម្បីផ្លាស់ប្តូរភាសាសម្រាប់កម្មវិធីទាំងមូល។'
                        )}
                    </Text>
                </View>

                {/* Current Language Info (ReadOnly) */}
                <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeLabel}>
                        {getText('Đang hoạt động:', 'Currently active:', 'ກຳລັງໃຊ້ງານ:', 'កំពុងសកម្ម:')}
                    </Text>
                    <View style={styles.currentBadgeValue}>
                        <Text style={styles.currentBadgeName}>
                            {LANGUAGE_OPTIONS.find(l => l.code === currentLanguage)?.nativeName}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Action Button */}
            <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={[
                        styles.applyButton,
                        !hasChanges && styles.applyButtonDisabled
                    ]}
                    onPress={handleApply}
                    disabled={!hasChanges}
                    activeOpacity={0.8}
                >
                    <MaterialIcons
                        name="check-circle"
                        size={20}
                        color={theme.colors.onPrimary}
                    />
                    <Text style={styles.applyButtonText}>
                        {getText('Áp dụng thay đổi', 'Apply Changes', 'ນຳໃຊ້ການປ່ຽນແປງ', 'អនុវត្តការផ្លាស់ប្តូរ')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.sm,
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        marginBottom: theme.margins.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    // Options Container
    optionsContainer: {
        gap: theme.margins.smd,
        marginBottom: theme.margins.lg,
    },

    // Language Card
    languageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: theme.margins.sm,
        borderWidth: 2,
        borderColor: theme.colors.border,
        gap: theme.margins.md,
    },
    languageCardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryMuted,
    },

    // Flag
    flagContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: theme.colors.backgroundSurface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flagEmoji: {
        fontSize: 28,
    },

    // Language Info
    languageInfo: {
        flex: 1,
    },
    nativeName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: 2,
    },
    nativeNameSelected: {
        color: theme.colors.primary,
    },
    englishName: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },

    // Radio Button
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
    },
    radioInner: {
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Footer Note
    footerNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.infoSubtle,
        borderRadius: 12,
        padding: theme.margins.sm,
        marginBottom: theme.margins.lg,
    },
    footerNoteText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        color: theme.colors.typographySecondary,
    },

    // Current Badge
    currentBadge: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: theme.margins.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        opacity: 0.8,
    },
    currentBadgeLabel: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginBottom: theme.margins.sm,
    },
    currentBadgeValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    currentBadgeFlag: {
        fontSize: 24,
    },
    currentBadgeName: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },

    // Bottom Action
    bottomAction: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    applyButton: {
        height: 52,
        backgroundColor: theme.colors.primary,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    applyButtonDisabled: {
        backgroundColor: theme.colors.secondary,
        opacity: 0.6,
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.onPrimary,
    },
}));
