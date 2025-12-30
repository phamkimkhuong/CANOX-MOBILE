import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export default function ChatConversationScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cuộc trò chuyện</Text>
            <Text style={styles.id}>Conversation ID: {id}</Text>
            <Text style={styles.placeholder}>🚧 Đang phát triển...</Text>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: theme.margins.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.md,
    },
    id: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        marginBottom: theme.margins.lg,
    },
    placeholder: {
        fontSize: 16,
        color: theme.colors.secondary,
    },
}));
