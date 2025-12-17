const tintColorLight = '#0088cc'; // Màu chủ đạo (Primary)
const tintColorDark = '#fff';

export const Colors = {
	light: {
		text: '#1c3024',
		background: '#eef8ff', // Xanh da trời nhạt toàn cục
		tint: tintColorLight,
		icon: '#687076',
		tabIconDefault: '#94a3b8', // Icon tab khi chưa chọn
		tabIconSelected: tintColorLight, // Icon tab khi đang chọn
		price: '#ef4444',
		cardBackground: '#ffffff', // Màu nền trắng cho các khối sản phẩm
	},
	dark: {
		text: '#ECEDEE',
		background: '#151718',
		tint: tintColorDark,
		icon: '#9BA1A6',
		tabIconDefault: '#9BA1A6',
		tabIconSelected: tintColorDark,
		price: '#ff6666',
		cardBackground: '#000000',
	},
} as const;
