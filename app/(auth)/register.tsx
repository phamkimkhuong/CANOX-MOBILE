import '@/constants/unistyles';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function RegisterScreen() {
	const { theme } = useUnistyles();
	const styles = stylesheet;

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
			<View style={styles.content}>
				<Text style={styles.title}>Register</Text>
			</View>
		</SafeAreaView>
	);
}

const stylesheet = StyleSheet.create((theme) => ({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: theme.margins.md,
		justifyContent: 'center',
	},
	title: {
		color: theme.colors.typography,
		fontSize: 22,
		fontWeight: '700',
	},
}));

