import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData, Clipboard } from 'react-native';

interface OTPInputProps {
    length: number;
    onComplete: (code: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete }) => {
    const [code, setCode] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<Array<TextInput | null>>(Array(length).fill(null));

    // Manejo de cambio de texto para entrada normal
    const handleChange = (text: string, index: number) => {
        // Si el texto tiene más de un carácter, probablemente sea una operación de pegado
        if (text.length > 1) {
            handlePastedText(text);
            return;
        }
        
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);
        
        // Si se ingresó un número y no es el último input, mover al siguiente
        if (text !== '' && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
        
        // Verificar si todos los campos están llenos
        if (newCode.every(digit => digit !== '')) {
            onComplete(newCode.join(''));
        }
    };

    // Método para manejar texto pegado
    const handlePastedText = (text: string) => {
        // Filtrar solo dígitos del texto pegado
        const digits = text.replace(/\D/g, '');
        
        if (digits.length > 0) {
            // Crear nuevo array para el código
            const newCode = [...code];
            
            // Llenar el array con los dígitos pegados
            for (let i = 0; i < length; i++) {
                if (i < digits.length) {
                    newCode[i] = digits[i];
                }
            }
            
            setCode(newCode);
            
            // Si hay más dígitos que campos disponibles, enfocar el último campo
            // Si hay menos, enfocar el siguiente campo después del último dígito pegado
            const focusIndex = Math.min(digits.length, length - 1);
            if (inputRefs.current[focusIndex]) {
                inputRefs.current[focusIndex]?.focus();
            }
            
            // Verificar si el código está completo después del pegado
            if (newCode.every(digit => digit !== '')) {
                onComplete(newCode.join(''));
            }
        }
    };

    const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        // Si se presiona backspace y el input está vacío, mover al anterior
        if (event.nativeEvent.key === 'Backspace' && index > 0 && code[index] === '') {
            const newCode = [...code];
            newCode[index - 1] = '';
            setCode(newCode);
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Método específico para el evento de pegado
    const handlePaste = async () => {
        try {
            const clipboardContent = await Clipboard.getString();
            if (clipboardContent) {
                handlePastedText(clipboardContent);
            }
        } catch (error) {
            console.error('Error al acceder al portapapeles:', error);
        }
    };

    return (
        <View style={styles.container}>
            {Array(length).fill(0).map((_, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => {
                        inputRefs.current[index] = ref;
                    }}
                    style={styles.input}
                    maxLength={length} // Permitir pegar múltiples dígitos
                    keyboardType="numeric"
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    value={code[index]}
                    selectTextOnFocus
                    onPaste={handlePaste}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    input: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderRadius: 100,
        borderColor: '#fff',
        backgroundColor: '#fff',
        color: 'black',
        marginHorizontal: 5,
        textAlign: 'center',
        fontSize: 20
    },
});

export default OTPInput;