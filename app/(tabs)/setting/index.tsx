import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Màn hình Cài đặt</Text>
      {/* Thêm nội dung cài đặt của bạn ở đây */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});