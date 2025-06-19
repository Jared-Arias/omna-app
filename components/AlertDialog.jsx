import { Modal, Pressable, Text, View } from "react-native";

export const ALERT_TYPE = {
    ERROR: 'ERROR',
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
}

export default function AlertDialog({ isVisible, type, title, msg, onClose }) {

    const close = () => {
        onClose();
    }

    return (
        <Modal animationType='fade' transparent={true} visible={isVisible}>
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="p-5 items-center rounded-2xl bg-white w-80">
                    <Text className={`text-2xl font-bold text-center ${type == ALERT_TYPE.ERROR ? 'text-red-500' : ''}`}>{title}</Text>
                    <Text className="my-3 text-center">{msg}</Text>
                    <Pressable className="mt-3 bg-[#188CFD] py-2 px-5 rounded-lg" onPress={close}>
                        <Text className="text-white">OK</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}