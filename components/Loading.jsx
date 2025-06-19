import { ActivityIndicator, Modal, Text, View } from "react-native";

export default function Loading({ isVisible }) {
    return (
        <Modal animationType='fade' transparent={true} visible={isVisible}>
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="py-5 rounded-2xl bg-white items-center w-80">
                    <Text className='text-3xl font-bold'>Cargando...</Text>
                    <ActivityIndicator className="mt-3" size='large' />
                </View>
            </View>
        </Modal>
    )
}