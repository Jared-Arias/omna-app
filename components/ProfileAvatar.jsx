import { Image, View } from 'react-native';

export default function ProfileAvatar() {
    return (
        <View>
            <Image source={require('@/assets/fotoperfil.png')} resizeMode="stretch" className="w-14 h-14" />
            <View className='bg-[#5AE04E] w-5 h-5 border-4 border-white rounded-full absolute -right-1 -bottom-1' />
        </View>
    )
}