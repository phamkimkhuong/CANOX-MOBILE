// import { LinearGradient } from 'expo-linear-gradient';
// import React from 'react';
// import '@/constants/unistyles';
// import { Dimensions, ImageBackground, ScrollView, Text, View } from 'react-native';
// import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// const { width } = Dimensions.get('window');
// // Responsive: Nếu màn hình to (tablet) thì banner nhỏ lại chút
// const CARD_WIDTH = width * 0.88;

// const BANNERS = [
//     {
//         id: 1,
//         title: 'Super Brand Day',
//         subtitle: 'Giảm tới 70% đồ điện tử',
//         tag: 'LIMITED TIME',
//         tagColor: '#0088cc',
//         tagText: '#fff',
//         image: 'https://img.freepik.com/free-vector/gradient-colorful-sale-background_23-2148847427.jpg',
//     },
//     {
//         id: 2,
//         title: 'Thời trang Hè',
//         subtitle: 'Bộ sưu tập mới nhất 2025',
//         tag: 'NEW ARRIVALS',
//         tagColor: '#fff',
//         tagText: '#0088cc',
//         image: 'https://img.freepik.com/free-photo/pretty-young-stylish-sexy-woman-pink-luxury-dress-summer-fashion-trend-chic-style-sunglasses-blue-studio-background-shopping-holding-paper-bags-talking-mobile-phone-shopaholic_285396-2957.jpg',
//     },
// ];

// export const HomeBanner = () => {
//     const { theme } = useUnistyles();
//     const styles = stylesheet;
//     return (
//         <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             snapToInterval={CARD_WIDTH + 16}
//             decelerationRate="fast"
//             contentContainerStyle={styles.scrollContent}
//         >
//             {BANNERS.map((item) => (
//                 <View key={item.id} style={styles.cardContainer}>
//                     <ImageBackground
//                         source={{ uri: item.image }}
//                         style={styles.imageBg}
//                         imageStyle={{ borderRadius: 12 }}
//                     >
//                         <LinearGradient
//                             colors={['transparent', 'rgba(0,0,0,0.8)']}
//                             style={styles.gradient}
//                         >
//                             <View style={[styles.tag, { backgroundColor: item.tagColor }]}>
//                                 <Text style={[styles.tagText, { color: item.tagText }]}>
//                                     {item.tag}
//                                 </Text>
//                             </View>

//                             <Text style={styles.title}>{item.title}</Text>
//                             <Text style={styles.subtitle}>{item.subtitle}</Text>
//                         </LinearGradient>
//                     </ImageBackground>
//                 </View>
//             ))}
//         </ScrollView>
//     );
// };

// const stylesheet = StyleSheet.create((theme) => ({
//     scrollContent: {
//         paddingHorizontal: theme.margins.md,
//         paddingVertical: theme.margins.md,
//         gap: theme.margins.md,
//     },
//     cardContainer: {
//         width: CARD_WIDTH,
//         height: CARD_WIDTH * 0.5,
//         borderRadius: theme.radius.m,
//         backgroundColor: theme.colors.surface,
//         // Shadow style thuần
//         shadowColor: theme.colors.primary,
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.15,
//         shadowRadius: 10,
//         elevation: 5,
//     },
//     imageBg: {
//         flex: 1,
//         justifyContent: 'flex-end',
//         borderRadius: theme.radius.m,
//         overflow: 'hidden', // Để bo góc ảnh không bị lòi ra
//     },
//     gradient: {
//         height: '65%',
//         justifyContent: 'flex-end',
//         padding: theme.margins.md,
//     },
//     tag: {
//         alignSelf: 'flex-start',
//         paddingHorizontal: 8,
//         paddingVertical: 4,
//         borderRadius: 6,
//         marginBottom: 8,
//     },
//     tagText: {
//         fontSize: 10,
//         fontWeight: 'bold',
//     },
//     title: {
//         color: 'white',
//         fontWeight: 'bold',
//         fontSize: 22, // Tương đương headlineSmall
//         marginBottom: 4,
//     },
//     subtitle: {
//         color: 'rgba(255,255,255,0.9)',
//         fontSize: 14,
//     }
// }));