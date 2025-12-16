import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';

// Mock data
const CATEGORIES = [
    { id: 1, name: 'Giày dép', icon: 'shoe-sneaker' },
    { id: 2, name: 'Điện thoại', icon: 'cellphone' },
    { id: 3, name: 'Thời trang', icon: 'tshirt-crew' },
    { id: 4, name: 'Đồng hồ', icon: 'watch' },
    { id: 5, name: 'Laptop', icon: 'laptop' },
];

export const CategoryRail = () => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity key={cat.id} style={styles.item}>
                        <Avatar.Icon
                            size={50}
                            icon={cat.icon}
                            style={{ backgroundColor: theme.colors.elevation.level2 }}
                            color={theme.colors.primary}
                        />
                        <Text variant="bodySmall" style={styles.text}>{cat.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 16, // Khoảng cách giữa các item
    },
    item: {
        alignItems: 'center',
        width: 60,
    },
    text: {
        marginTop: 4,
        textAlign: 'center',
    },
});