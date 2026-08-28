import { useAuth, useUser } from '@clerk/expo';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function ProfileScreen() {
    const {user} = useUser();
    const {signOut} = useAuth();
    return <SafeAreaView className="flex-1 bg-brand-body" edges={["top"]}>
        <TouchableOpacity onPress={() => signOut()}>
            <Text onPress={() => signOut()}>LOG OUT</Text>
        </TouchableOpacity>
    </SafeAreaView>
}
