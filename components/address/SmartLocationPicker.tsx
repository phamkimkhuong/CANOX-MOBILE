import { IconSymbol } from '@/components/ui/Icon';
import { useProvinces, useWards } from '@/hooks/api/useAddressData';
import type { Province, Ward } from '@/types/address';
import { FlashList } from '@shopify/flash-list';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    Pressable,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type PickerStep = 'province' | 'district' | 'ward';

interface SmartLocationPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (data: {
        province: Province | null;
        districtName: string;
        ward: Ward | null;
    }) => void;
    initialProvince?: Province | null;
    initialDistrict?: string;
    initialWard?: Ward | null;
}

export const SmartLocationPicker: React.FC<SmartLocationPickerProps> = memo(({
    visible,
    onClose,
    onSelect,
    initialProvince,
    initialDistrict,
    initialWard,
}) => {
    const { t } = useTranslation(['address', 'common']);
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const searchInputRef = useRef<TextInput>(null);

    // Flow State
    const [step, setStep] = useState<PickerStep>('province');
    const [searchText, setSearchText] = useState('');

    // Selections
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(initialProvince || null);
    const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict || '');
    const [selectedWard, setSelectedWard] = useState<Ward | null>(initialWard || null);

    /**
     * DATA LOADERS
     */
    const { data: provincesRes } = useProvinces({
        enabled: visible && step === 'province'
    });

    const { data: wardsRes } = useWards({
        provinceCode: selectedProvince?.code || null,
        enabled: visible && !!selectedProvince && (step === 'ward' || step === 'district')
    });

    const provinces = useMemo(() => provincesRes?.data || [], [provincesRes]);
    const allWards = useMemo(() => wardsRes?.data || [], [wardsRes]);

    // Filtering logic based on step and searchText
    const filteredItems = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        if (step === 'province') {
            return provinces.filter(p => p.fullName.toLowerCase().includes(query));
        }
        if (step === 'ward') {
            return allWards.filter(w => w.fullName.toLowerCase().includes(query));
        }
        return [];
    }, [step, searchText, provinces, allWards]);

    // Handle Reset & Sync when opening
    useEffect(() => {
        if (visible) {
            setStep('province');
            setSearchText('');
            // Forced sync internal state with external props on every open
            setSelectedProvince(initialProvince || null);
            setSelectedDistrict(initialDistrict || '');
            setSelectedWard(initialWard || null);
        }
    }, [visible, initialProvince, initialDistrict, initialWard]);

    // Header title based on step
    const headerTitle = useMemo(() => {
        switch (step) {
            case 'province': return t('address:picker.provinceTitle');
            case 'district': return t('address:picker.districtTitle');
            case 'ward': return t('address:picker.wardTitle');
            default: return t('address:picker.locationTitle');
        }
    }, [step, t]);

    /**
     * TRANSITION LOGIC
     */
    const goToStep = useCallback((nextStep: PickerStep) => {
        setStep(nextStep);
        setSearchText('');
        // Pushing focus to search bar if it's a list step
        if (nextStep !== 'district') {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, []);

    const handleProvinceSelect = useCallback((item: Province) => {
        setSelectedProvince(item);
        setSelectedDistrict('');
        setSelectedWard(null);
        goToStep('district');
    }, [goToStep]);

    const handleDistrictConfirm = useCallback(() => {
        if (!selectedDistrict.trim()) return;
        goToStep('ward');
    }, [selectedDistrict, goToStep]);

    const handleWardSelect = useCallback((item: Ward) => {
        setSelectedWard(item);
        onSelect({
            province: selectedProvince,
            districtName: selectedDistrict,
            ward: item
        });
        onClose();
    }, [selectedProvince, selectedDistrict, onSelect, onClose]);

    const renderLocationItem = useCallback(({ item }: { item: Province | Ward }) => {
        const isProvince = 'code' in item && !('provinceCode' in item);
        const code = isProvince ? (item as Province).code : (item as Ward).code;
        const isSelected = isProvince
            ? selectedProvince?.code === code
            : selectedWard?.code === code;

        return (
            <Pressable
                onPress={() => isProvince ? handleProvinceSelect(item as Province) : handleWardSelect(item as Ward)}
                style={[styles.item, isSelected && styles.itemSelected]}
            >
                <Text style={styles.itemText} numberOfLines={1}>{item.fullName}</Text>
                {isSelected && <IconSymbol name="check" size={18} color={theme.colors.primary} />}
            </Pressable>
        );
    }, [selectedProvince?.code, selectedWard?.code, theme.colors.primary, styles, handleProvinceSelect, handleWardSelect]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <IconSymbol name="close" size={24} color={theme.colors.typography} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{headerTitle}</Text>
                </View>

                {/* Breadcrumbs Navigation */}
                <View style={styles.breadcrumbs}>
                    <BreadcrumbItem
                        label={selectedProvince?.fullName || t('address:form.province.label')}
                        active={step === 'province'}
                        done={!!selectedProvince}
                        onPress={() => goToStep('province')}
                    />
                    <IconSymbol name="chevron-forward" size={14} color={theme.colors.secondary} />

                    <BreadcrumbItem
                        label={selectedDistrict || t('address:form.district.label')}
                        active={step === 'district'}
                        done={!!selectedDistrict}
                        onPress={() => selectedProvince && goToStep('district')}
                        disabled={!selectedProvince}
                    />
                    <IconSymbol name="chevron-forward" size={14} color={theme.colors.secondary} />

                    <BreadcrumbItem
                        label={selectedWard?.fullName || t('address:form.ward.label')}
                        active={step === 'ward'}
                        done={!!selectedWard}
                        onPress={() => selectedDistrict && goToStep('ward')}
                        disabled={!selectedDistrict}
                    />
                </View>

                {/* Dynamic Content based on Step */}
                <View style={styles.flex1}>
                    {step !== 'district' ? (
                        <View style={styles.flex1}>
                            <View style={styles.searchContainer}>
                                <IconSymbol name="search" size={18} color={theme.colors.secondary} />
                                <TextInput
                                    ref={searchInputRef}
                                    style={styles.searchInput}
                                    placeholder={t('address:form.search.placeholder')}
                                    placeholderTextColor={theme.colors.secondary}
                                    value={searchText}
                                    onChangeText={setSearchText}
                                />
                            </View>
                            <FlashList<Province | Ward>
                                data={filteredItems}
                                renderItem={renderLocationItem}
                                keyExtractor={(item) => (item as Province | Ward).code}
                                keyboardShouldPersistTaps="handled"
                            />
                        </View>
                    ) : (
                        <View style={styles.flex1}>
                            <View style={styles.helperBox}>
                                <Text style={styles.helperText}>{t('address:form.district.placeholder')}</Text>
                            </View>
                            <View style={styles.customInputContainer}>
                                <TextInput
                                    style={styles.customInput}
                                    placeholder={t('address:form.district.placeholder')}
                                    placeholderTextColor={theme.colors.secondary}
                                    value={selectedDistrict}
                                    onChangeText={setSelectedDistrict}
                                    onSubmitEditing={handleDistrictConfirm}
                                    autoFocus
                                />
                                <Pressable
                                    onPress={handleDistrictConfirm}
                                    style={[styles.nextButton, !selectedDistrict.trim() && styles.disabledButton]}
                                    disabled={!selectedDistrict.trim()}
                                >
                                    <IconSymbol name="arrow-forward" size={20} color={theme.colors.onPrimary} />
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
});

interface BreadcrumbItemProps {
    label: string;
    active: boolean;
    done: boolean;
    onPress: () => void;
    disabled?: boolean;
}

const BreadcrumbItem = ({ label, active, done, onPress, disabled = false }: BreadcrumbItemProps) => {
    const styles = stylesheet;
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[styles.breadcrumbItem, active && styles.breadcrumbActive]}
        >
            <Text
                numberOfLines={1}
                style={[
                    styles.breadcrumbText,
                    active && styles.breadcrumbTextActive,
                    done && !active && styles.breadcrumbDone
                ]}
            >
                {label.replace('Tỉnh ', '').replace('Thành phố ', '')}
            </Text>
        </Pressable>
    )
}

const stylesheet = StyleSheet.create((theme) => ({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border
    },
    closeButton: { position: 'absolute', left: 16 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.typography },

    breadcrumbs: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: theme.colors.backgroundSurface,
        gap: 4
    },
    breadcrumbItem: {
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: 'center'
    },
    breadcrumbActive: {
        backgroundColor: theme.colors.primaryMuted
    },
    breadcrumbText: {
        fontSize: 12,
        color: theme.colors.secondary,
        textAlign: 'center'
    },
    breadcrumbTextActive: {
        color: theme.colors.primary,
        fontWeight: 'bold'
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 8
    },
    searchInput: { flex: 1, height: 44, fontSize: 15, color: theme.colors.typography },

    helperBox: { padding: 16, backgroundColor: theme.colors.backgroundSurface },
    helperText: { fontSize: 13, color: theme.colors.secondary, lineHeight: 18 },

    customInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12
    },
    customInput: {
        flex: 1,
        height: 54,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        fontSize: 16,
        color: theme.colors.typography
    },
    nextButton: {
        width: 54,
        height: 54,
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },

    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.background
    },
    itemSelected: { backgroundColor: theme.colors.primaryMuted },
    itemText: { fontSize: 15, color: theme.colors.typography },
    itemTextSelected: { color: theme.colors.primary, fontWeight: '600' },
    flex1: { flex: 1 },
    disabledButton: { opacity: 0.5 },
    breadcrumbDone: { color: theme.colors.typography }
}));
