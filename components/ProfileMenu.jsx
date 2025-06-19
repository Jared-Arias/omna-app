import { Image, Text, View } from "react-native";
import ProfileAvatar from "./ProfileAvatar";

export default function ProfileMenu() {
    return (
        <View className="flex-row gap-5 mr-4">
            <Image source={require('@/assets/logo2.png')} resizeMode="stretch" className="w-10 h-14" />
            <View className="gap-1 items-end">
                <Text className="text-[#188CFD] text-lg">Bienvenid@</Text>
                <View className="flex-row gap-2 items-center">
                    <Text>Daniel</Text>
                    <Image source={require('@/assets/icons/emoticonsaludo.png')} resizeMode="stretch" className="w-5 h-5" />
                </View>
            </View>
            <ProfileAvatar />
        </View>
    )
}