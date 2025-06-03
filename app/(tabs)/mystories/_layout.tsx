import { Stack } from 'expo-router';

export default function MyStoriesLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[id]" options={{ title: 'Story Detail' }} />
        </Stack>
    );
}