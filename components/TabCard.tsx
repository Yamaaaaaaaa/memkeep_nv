import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

export type TabCardProps = {
    title: string;
    navigateTo: string;
    processing: number; // Phần trăm hoàn thành (0 - 100)
    conversationId?: string;
};

const getProgressColor = (progress: number) => {
    if (progress === 100) return styles.progressGreen;
    if (progress >= 50) return styles.progressYellow;
    return styles.progressOrange;
};

export default function TabCard({ title, navigateTo, processing, conversationId }: TabCardProps) {
    const navigation = useRouter();
    const progressBarStyle = getProgressColor(processing);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.push({
                    pathname: navigateTo,
                    params: { conversationId },
                })
            }
        >
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {processing === 100 ? (
                    <Text style={styles.finishedText}>Finished</Text>
                ) : (
                    <View style={styles.progressBarContainer}>
                        <View style={[progressBarStyle, { width: `${processing}%` }]} />
                    </View>
                )}
            </View>

            <View style={styles.bottom}>
                <Text style={styles.bottomText}>{title}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#353A3F',
        borderRadius: 12,
        borderTopLeftRadius: 0,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    finishedText: {
        color: '#34D399', // green-400
        fontSize: 20,
    },
    progressBarContainer: {
        width: '50%',
        height: 12,
        backgroundColor: '#1F2937', // gray-800
        borderRadius: 999,
        overflow: 'hidden',
    },
    progressGreen: {
        backgroundColor: '#34D399', // green-400
        height: '100%',
        borderRadius: 999,
    },
    progressYellow: {
        backgroundColor: '#FFCC00',
        height: '100%',
        borderRadius: 999,
    },
    progressOrange: {
        backgroundColor: '#FE8533',
        height: '100%',
        borderRadius: 999,
    },
    bottom: {
        alignItems: 'center',
        paddingTop: 25,
    },
    bottomText: {
        fontFamily: 'JudSon',
        color: '#FEF4F6',
        fontSize: 20,
        fontWeight: '300',
    },
});
