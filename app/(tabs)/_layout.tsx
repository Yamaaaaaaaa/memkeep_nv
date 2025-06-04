import { Tabs, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons'; // Cần cài đặt @expo/vector-icons
import { useEffect } from 'react';
import { useAuthentication } from '@/context/AuthContext';
export default function TabLayout() {
  const { user } = useAuthentication();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user]);
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      {/* Định nghĩa các màn hình trong Tab navigator */}

      {/* Tab cho nhóm (home) */}
      {/* Tên của màn hình trong Tabs.Screen là tên của thư mục/file trong nhóm (tabs) */}
      <Tabs.Screen
        name="home" // Tên này khớp với thư mục (home)
        options={{
          title: 'Home',
          // Có thể thêm biểu tượng cho tab
          tabBarStyle: { display: 'none' }, // Ẩn toàn bộ tab bar khi ở tab này
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
          headerShown: false, // Ẩn header mặc định của Tabs cho tab này (header sẽ do Stack trong (home)/_layout quản lý)
        }}
      />
      <Tabs.Screen
        name="mystories" // Tên này khớp với file settings.tsx
        options={{
          title: 'MyStories',
          // Có thể thêm biểu tượng cho tab
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
          headerShown: false, // Nếu bạn muốn header do Stack của Root layout quản lý (không khuyến khích trong Tab)
        }}
      />

      <Tabs.Screen
        name="friend-stories" // Tên này khớp với file settings.tsx
        options={{
          title: 'Friends Stories',
          // Có thể thêm biểu tượng cho tab
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people-outline" size={size} color={color} />
          ),
          headerShown: false, // Nếu bạn muốn header do Stack của Root layout quản lý (không khuyến khích trong Tab)
        }}
      />
      {/* Tab cho màn hình settings */}
      <Tabs.Screen
        name="settings" // Tên này khớp với file settings.tsx
        options={{
          title: 'Settings',
          // Có thể thêm biểu tượng cho tab
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
          headerShown: false, // Nếu bạn muốn header do Stack của Root layout quản lý (không khuyến khích trong Tab)
        }}
      />
      <Tabs.Screen
        name="create_story" // Tên này khớp với file settings.tsx
        options={{
          title: 'CreateStory',
          // Có thể thêm biểu tượng cho tab
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
          headerShown: false, // Nếu bạn muốn header do Stack của Root layout quản lý (không khuyến khích trong Tab)
        }}
      />
    </Tabs>
  );
}