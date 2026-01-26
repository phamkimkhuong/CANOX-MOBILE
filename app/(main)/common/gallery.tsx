import { IconSymbol } from '@/components/ui/Icon';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StatusBar, Text, View } from 'react-native';
import Gallery, { RenderItemInfo } from 'react-native-awesome-gallery';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const IMAGE_PLACEHOLDER = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export default function GalleryScreen() {
    const router = useRouter();
    const { images: imagesParam, initialIndex: initialIndexParam } = useLocalSearchParams<{ images: string; initialIndex?: string }>();
    const insets = useSafeAreaInsets();
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const images = JSON.parse(imagesParam || '[]') as string[];
    const initialIndex = initialIndexParam ? parseInt(initialIndexParam, 10) : 0;
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const galleryData = images.map((uri, index) => ({ uri, id: index.toString() }));

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#000" barStyle="light-content" hidden={false} />

            <Gallery
                data={galleryData}
                keyExtractor={(item) => item.id}
                initialIndex={initialIndex}
                onIndexChange={setCurrentIndex}
                onSwipeToClose={() => router.back()}
                renderItem={({ item, setImageDimensions }: RenderItemInfo<{ uri: string; id: string }>) => (
                    <Image
                        source={{ uri: item.uri }}
                        style={styles.image}
                        contentFit="contain"
                        placeholder={IMAGE_PLACEHOLDER}
                        onLoad={(e) => {
                            const { width, height } = e.source;
                            setImageDimensions({ width, height });
                        }}
                    />
                )}
            />

            {/* Header with Close Button and Counter */}
            <View style={[styles.header, { top: insets.top }]}>
                <Pressable
                    style={styles.closeButton}
                    onPress={() => router.back()}
                    hitSlop={20}
                >
                    <IconSymbol name="close" size={24} color="#FFF" />
                </Pressable>

                <Text style={styles.headerText}>
                    {currentIndex + 1} / {images.length}
                </Text>

                {/* Spacer to balance header */}
                <View style={styles.headerSpacer} />
            </View>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    image: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 10,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    headerSpacer: {
        width: 40,
    },
}));
