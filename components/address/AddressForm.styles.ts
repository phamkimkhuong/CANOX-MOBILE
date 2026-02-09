import { StyleSheet } from 'react-native-unistyles';

export const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.margins.md,
        gap: theme.margins.md,
    },
    scrollContentExtra: {
        paddingBottom: 10,
    },

    field: {
        gap: theme.margins.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.margins.md,
    },
    pickerCompact: {
        flex: 1,
        minHeight: 44,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.smd,
        fontSize: 15,
        color: theme.colors.typography,
    },
    inputMultiline: {
        minHeight: 80,
        paddingTop: theme.margins.smd,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
    },

    picker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.smd,
        minHeight: 48,
    },
    pickerDisabled: {
        opacity: 0.6,
    },
    pickerText: {
        flex: 1,
        fontSize: 15,
        color: theme.colors.typography,
    },
    pickerPlaceholder: {
        color: theme.colors.secondary,
    },

    labelOptions: {
        flexDirection: 'row',
        gap: theme.margins.sm,
    },
    labelOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        paddingVertical: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
    },
    labelOptionSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryMuted,
    },
    labelOptionText: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    labelOptionTextSelected: {
        color: theme.colors.primary,
        fontWeight: '500',
    },

    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    switchTextContainer: {
        flex: 1,
        marginRight: theme.margins.md,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    switchDescription: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },

    footer: {
        padding: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    footerButtonRow: {
        flexDirection: 'row',
        gap: theme.margins.smd,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.error,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.md,
        height: 48,
    },
    deleteButtonPressed: {
        backgroundColor: theme.colors.backgroundSurface,
    },
    deleteButtonDisabled: {
        opacity: 0.6,
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.error,
    },
    submitButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.m,
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
    },
    submitButtonFullWidth: {
        flex: 1,
    },
    submitButtonPressed: {
        opacity: 0.9,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },

    // Styles for Search
    searchContainer: {
        position: 'relative',
        zIndex: 10,
    },
    searchIconContainer: {
        position: 'absolute',
        left: 12,
        top: 15,
        zIndex: 10,
    },
    searchInput: {
        paddingLeft: 40,
    },
    suggestionList: {
        position: 'absolute',
        top: 52,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        maxHeight: 250,
        zIndex: 100,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.backgroundSurface,
    },
    suggestionIcon: {
        marginRight: theme.margins.sm,
    },
    suggestionContent: {
        flex: 1,
    },
    suggestionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    suggestionSubTitle: {
        fontSize: 12,
        color: theme.colors.secondary,
        marginTop: 2,
    },
    loadingText: {
        padding: theme.margins.md,
        textAlign: 'center',
        color: theme.colors.secondary,
        fontSize: 13,
    },
    emptyText: {
        padding: theme.margins.md,
        textAlign: 'center',
        color: theme.colors.secondary,
        fontSize: 13,
    },
    pickerAutoFilling: {
        backgroundColor: theme.colors.backgroundSurface,
    },
    pressedOpacity: {
        opacity: 0.7,
    },
    searchInner: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
}));
