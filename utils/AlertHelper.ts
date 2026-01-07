import { createRef } from 'react';

export type AlertConfig = {
    title?: string;
    message?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
};

// Create Ref global
export const alertRef = createRef<any>();

export const Alert = {
    show: (config: AlertConfig) => {
        alertRef.current?.show(config);
    },
    hide: () => {
        alertRef.current?.hide();
    },
    // Shortcut for common cases
    error: (message: string, onConfirm?: () => void) => {
        alertRef.current?.show({
            title: 'Lỗi',
            message,
            type: 'error',
            showCancel: false,
            onConfirm,
        });
    },
    success: (message: string, onConfirm?: () => void) => {
        alertRef.current?.show({
            title: 'Thành công',
            message,
            type: 'success',
            showCancel: false,
            onConfirm,
        });
    }
};