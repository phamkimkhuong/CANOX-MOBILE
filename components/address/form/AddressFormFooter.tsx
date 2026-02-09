import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { stylesheet } from '../AddressForm.styles';

interface AddressFormFooterProps {
    isEdit: boolean;
    isSubmitting: boolean;
    isDeleting: boolean;
    onSubmit: () => void;
    onDelete?: () => void;
}

export const AddressFormFooter: React.FC<AddressFormFooterProps> = ({
    isEdit,
    isSubmitting,
    isDeleting,
    onSubmit,
    onDelete,
}) => {
    const { t } = useTranslation(['address', 'common']);
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.footer}>
            <View style={styles.footerButtonRow}>
                {isEdit && onDelete && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.deleteButton,
                            pressed && styles.deleteButtonPressed,
                            isDeleting && styles.deleteButtonDisabled,
                        ]}
                        onPress={onDelete}
                        disabled={isDeleting || isSubmitting}
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color={theme.colors.error} />
                        ) : (
                            <>
                                <IconSymbol name="delete" size={20} color={theme.colors.error} />
                                <Text style={styles.deleteButtonText}>
                                    {t('common:actions.delete')}
                                </Text>
                            </>
                        )}
                    </Pressable>
                )}

                <Pressable
                    style={({ pressed }) => [
                        styles.submitButton,
                        !isEdit && styles.submitButtonFullWidth,
                        pressed && styles.submitButtonPressed,
                        isSubmitting && styles.submitButtonDisabled,
                    ]}
                    onPress={onSubmit}
                    disabled={isSubmitting || isDeleting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {isEdit ? t('common:actions.save') : t('common:actions.add')}
                        </Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
};
