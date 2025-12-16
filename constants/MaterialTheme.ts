import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

// Định nghĩa font (nếu dùng font riêng như Spline Sans, cấu hình ở đây)
const fontConfig = {
    fontFamily: 'SpaceMono', // Ví dụ dùng font có sẵn trong template
};
export const AppLightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#0088cc',
        onPrimary: '#ffffff',
        background: '#eef8ff',
        surface: '#ffffff',
        secondary: '#94a3b8',
        error: '#ef4444',
        elevation: {
            level0: 'transparent',
            level1: '#f0f9ff', // Card nổi mức 1
            level2: '#e8f6ff',
            level3: '#e0f3ff',
            level4: '#d9f0ff',
            level5: '#d1edff',
        }
    },
    // Config font (Optional)
    // fonts: configureFonts({config: fontConfig}),
};
export const AppDarkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#0088cc', // (Button, Active elements)
        onPrimary: '#ffffff',
        background: '#151718', // Màu nền tối 
        surface: '#1c1c1e',    // Màu card tối
        secondary: '#9BA1A6',  // Text phụ màu sáng hơn để nổi trên nền đen
        error: '#ff6666',
        // Paper tự động xử lý màu chữ chính (onBackground) thành màu trắng
    },
    // Config font (Optional)
    // fonts: configureFonts({config: fontConfig}),
};