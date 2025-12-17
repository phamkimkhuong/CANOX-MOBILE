import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import '@/constants/unistyles';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type MdiIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type Category = {
    id: number;
    name: string;
    icon: MdiIconName;
};

const CATEGORIES: Category[] = [
    { id: 1, name: 'Giày dép', icon: 'shoe-sneaker' },
    { id: 2, name: 'Điện thoại', icon: 'cellphone' },
    { id: 3, name: 'Thời trang', icon: 'tshirt-crew' },
    { id: 4, name: 'Đồng hồ', icon: 'watch' },
    { id: 5, name: 'Laptop', icon: 'laptop' },
];

export const CategoryRail = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity key={cat.id} style={styles.item} activeOpacity={0.7}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons
                                name={cat.icon}
                                size={24}
                                color={theme.colors.primary}
                            />
                        </View>
                        <Text style={styles.text} numberOfLines={1}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginBottom: theme.margins.md,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: 20,
    },
    item: {
        alignItems: 'center',
        width: 64,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 20,
        backgroundColor: '#f0f9ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#e0f2fe',
    },
    text: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        fontWeight: '500',
    },
}));