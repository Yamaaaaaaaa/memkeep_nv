import { Tabs, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons'; // Cần cài đặt @expo/vector-icons
import { useEffect } from 'react';
import { useAuthentication } from '@/context/AuthContext';
import { View, Text } from 'react-native';

export default function TabLayout() {
  const { user } = useAuthentication();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000', // Màu chữ và icon khi active
        tabBarInactiveTintColor: 'gray', // Màu chữ và icon khi inactive
        tabBarStyle: {
          backgroundColor: '#fff', // Màu nền của tab bar
          borderTopLeftRadius: 20, // Bo tròn góc trên bên trái
          borderTopRightRadius: 20, // Bo tròn góc trên bên phải
          position: 'absolute', // Để tab bar nổi lên trên nội dung
          bottom: 0, // Đặt ở dưới cùng
          left: 0,
          right: 0,
          elevation: 10, // Thêm bóng đổ cho Android
          shadowColor: '#000', // Thêm bóng đổ cho iOS
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          
          height: 80, // Chiều cao của tab bar
        },
        tabBarLabelStyle: {
            fontSize: 10, // Kích thước chữ của label
            marginBottom: 5, // Khoảng cách giữa icon và label
            display: "none",
        },
        tabBarIconStyle: {
            //marginTop: 5, // Khoảng cách giữa icon và mép trên của tab item
        },
      }}
    >
      {/* Tab cho nhóm (home) - Biểu tượng cuốn sách mở */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
             <View style={{ alignItems: 'center' }}>
                 <Ionicons name={focused ? "book" : "book-outline"} size={focused ? 30 : size} color={focused ? '#000' : color} />
                 {focused && <Text style={{ color: '#000', fontSize: 10, marginTop: 2 }}>Home</Text>}
             </View>
          ),
          headerShown: false,
        }}
      />

      {/* Tab cho MyStories - Biểu tượng cuốn sách đóng */}
      <Tabs.Screen
        name="mystories"
        options={{
          title: 'MyStories',
          tabBarIcon: ({ color, size, focused }) => (
              <View style={{ alignItems: 'center' }}>
                 <Ionicons name={focused ? "book" : "book-outline"} size={focused ? 30 : size} color={focused ? '#000' : color} />
                  {focused && <Text style={{ color: '#000', fontSize: 10, marginTop: 2 }}>My Stories</Text>}
              </View>
          ),
          headerShown: false,
        }}
      />

      {/* Tab cho Friend Stories - Biểu tượng nhóm người */}
      <Tabs.Screen
        name="friend-stories"
        options={{
          title: 'Friends Stories',
          tabBarIcon: ({ color, size, focused }) => (
               <View style={{ alignItems: 'center' }}>
                 <Ionicons name={focused ? "people" : "people-outline"} size={focused ? 30 : size} color={focused ? 'blue' : color} /> {/* Blue for active as in image */}
                  {focused && <Text style={{ color: 'blue', fontSize: 10, marginTop: 2 }}>Friends Stories</Text>}
               </View>
          ),
          headerShown: false,
        }}
      />

      {/* Tab cho Settings - Biểu tượng bánh răng cưa hoặc bút chì? Ảnh mẫu dùng bút chì */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
             <View style={{ alignItems: 'center' }}>
                 <Ionicons name={focused ? "settings" : "settings-outline"} size={focused ? 30 : size} color={focused ? '#000' : color} /> {/* Using settings icon for now */}
                  {focused && <Text style={{ color: '#000', fontSize: 10, marginTop: 2 }}>Settings</Text>}
             </View>
          ),
          headerShown: false,
        }}
      />

      {/* Tab cho Create Story - Biểu tượng bút chì/tạo mới */}
      <Tabs.Screen
        name="create_story"
        options={{
          title: 'Create Story',
          tabBarIcon: ({ color, size, focused }) => (
             <View style={{ alignItems: 'center' }}>
                 <Ionicons name={focused ? "create" : "create-outline"} size={focused ? 30 : size} color={focused ? '#000' : color} /> {/* Using create icon */}
                  {focused && <Text style={{ color: '#000', fontSize: 10, marginTop: 2 }}>Create Story</Text>}
             </View>
          ),
          // headerShown: false,
        }}
      />
    </Tabs>
  );
}