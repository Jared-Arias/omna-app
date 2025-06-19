import { Image, Pressable } from "react-native";

export default function CheckTermAndCond({ isActive, setIsActive }) {

    return (
        <Pressable onPress={() => setIsActive(!isActive)}>
            <Image source={isActive ? require('@/assets/terminosaceptado.png') : require('@/assets/terminosnoaceptado.png')} className="w-10 h-10" resizeMode="stretch" />
        </Pressable>
    )
}