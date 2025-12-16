// 1. Chỉ dùng View thuần túy cho bố cục
import { StyleSheet, View } from 'react-native';
// import { View } from '@/components/Themed';
// 2. Import Surface và useTheme từ Paper
import { Button, Card, Text, useTheme } from 'react-native-paper';

export default function CartScreen() {
    // 3. Lấy theme từ nguồn chân lý duy nhất (PaperProvider)
    const theme = useTheme();
    return (
        // 4. Áp dụng màu nền từ theme vào View tổng
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Tiêu đề dùng màu từ theme, không hardcode màu đen */}
            <Text style={[styles.title, { color: theme.colors.primary }]}>
                Giỏ hàng của bạn
            </Text>
            <View style={styles.contentSection}>
                <Text variant="displaySmall" style={{ color: theme.colors.onBackground }}>
                    Xin chào
                </Text>
                <Button mode="contained" onPress={() => { }} style={{ marginTop: 10 }}>
                    Bấm tôi đi
                </Button>
            </View>
            {/* Dùng Surface thay vì View cho các khối nội dung cần nổi bật 
               Surface mặc định lấy màu theme.colors.surface
            */}
            <Card style={styles.card}>
                <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
                <Card.Title title="Giày Nike Air" subtitle="2025 Model" />
                <Card.Content>
                    {/* Dùng màu từ theme, không hardcode hex */}
                    <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
                        Mô tả ngắn về sản phẩm...
                    </Text>
                    <Text variant="titleLarge" style={{ color: theme.colors.error, marginTop: 8 }}>
                        $199.00
                    </Text>
                </Card.Content>
                <Card.Actions>
                    {/* Nút này sẽ tự động có màu #0088cc */}
                    <Button onPress={() => { }}>Bỏ qua</Button>
                    <Button mode="contained" onPress={() => { }}>Mua ngay</Button>
                </Card.Actions>
            </Card>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    contentSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    card: {
        marginTop: 10,
    }
});
