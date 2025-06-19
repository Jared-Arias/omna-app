import { ActivityIndicator, Image, SafeAreaView, Keyboard, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useNavigation, useLocalSearchParams } from 'expo-router';
import OTPInput from '@/components/OTPInput';
import { verifyOTP, forgotPassword, enviarOTP, extractFirstErrorMessage } from '@/services/auth/userDataController/authService';

interface NavigationProp {
    setOptions: (options: { title: string, onComplete: () => void; }) => void;
}

const OTPVerification: React.FC<{ email: string, onComplete: (id: string) => void }> = ({ email, onComplete }) => {
    const navigation = useNavigation<NavigationProp>();
    const params = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [otp, setOtp] = useState<string>('');
    const [countdown, setCountdown] = useState<number>(30);
    const [canResend, setCanResend] = useState<boolean>(false);
    const emailUser = email;
    const redireccion = params.redireccion as string;
    const [error, setError] = useState<string>('');

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    // Add keyboard listeners to detect when keyboard appears/disappears
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        // Cleanup listeners
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        navigation.setOptions({ title: 'Verificación OTP' });
    }, [navigation]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0 && !canResend) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleOTPComplete = (code: string): void => {
        setOtp(code);
    };

    const handleResendOTP = async (): Promise<void> => {
        if (canResend) {
            try {
                setIsLoading(true);
                const response = await enviarOTP(emailUser);
                if (response.success) {
                    setCountdown(30);
                    setCanResend(false);
                }
            } catch (error) {
                if (error && typeof error === 'object' && 'message' in error) {
                    setError((error as { message: string }).message);
                } else {
                    setError('Error al reenviar el código OTP');
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleConfirm = async (): Promise<void> => {
        if (otp.length !== 5) {
            Alert.alert('Error', 'Por favor ingrese el código OTP que recibió en su correo electrónico');
            return;
        }

        try {
            setIsLoading(true);

            const response = await verifyOTP(otp, emailUser);
            console.log('response de otp verificacion:', response);
            if (response.message === 'Correo confirmado satisfactoriamente') {
                const userId = response.data.user.id; // Assuming the response contains a userId
                console.log('userId del otp:', userId);
                onComplete(userId);
            }

        } catch (error) {
            const errorMessage = extractFirstErrorMessage((error as Error).message);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <SafeAreaView style={styles.container}>
                <View style={[{ alignItems: 'center', }]}>

                    <Text style={[styles.textSubtitle, { color: 'white', marginHorizontal: -10 }]}>*Ingrese el código que le enviamos a su E-MAIL</Text>

                    <OTPInput
                        length={5}
                        onComplete={handleOTPComplete}
                    />
                    {error && <Text style={[styles.textEmail, { color: 'red' }]}>{error}</Text>}
                    <TouchableOpacity
                        style={[styles.button, (!otp || isLoading) && styles.buttonDisabled]}
                        disabled={isLoading || !otp || otp.length !== 5}
                        onPress={handleConfirm}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff"  />
                        ) : (
                            <>
                                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center',  alignContent: 'center'}}>
                                    <Text style={styles.buttonText}>SIGUIENTE</Text>
                                    <Image source={require('@/assets/flechablanca.png')} style={{ width: 18, height: 18, marginLeft: 5, resizeMode: 'contain' }} />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                    <View style={styles.bottomContainer}>
                        <Text style={[styles.resendText, { color: 'white' }]}>No recibiste el código?</Text>
                        <TouchableOpacity
                            style={styles.endAlaing}
                            onPress={handleResendOTP}
                            disabled={!canResend || isLoading}
                        >
                            <Text style={[
                                styles.forgotPassword,
                                (!canResend || isLoading) && styles.disabledText
                            ]}>
                                {canResend ? 'Reenviar código OTP' : `Espere ${countdown}s`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </SafeAreaView>
            {!isKeyboardVisible && (
                <View style={styles.bottomImageContainer}>
                    {/* <Image
          style={styles.bottomImage}
          source={require("@/assets/images/gradientBottom.png")}
        /> */}
                </View>
            )}
        </>
    );
};

export default OTPVerification;

const styles = StyleSheet.create({
    bottomImageContainer: {
        alignItems: 'center',
      },
      bottomImage: {
        width: '100%',
        height: 184,
      },
    buttonDisabled: {
        opacity: 0.5,
    },
    bottomContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginTop: 20,
    },
    resendText: {
        fontSize: 15,
        fontWeight: 'bold',
        paddingRight: 2,
    },
    disabledText: {
        opacity: 0.5,
        textDecorationLine: 'none',
    },
    container:{
        flex: 1,
        height: '100%',
    },
    textForgotPassword:{
        fontSize: 24,
        fontWeight: 'bold'
    },
    textSubtitle:{
        paddingTop: 15,
        fontSize: 14,
    },
    textEmail:{
        fontSize: 14,
        fontWeight: 'bold'
    },
    logoEbook:{
        width: 62, 
        height: 62, 
        resizeMode:'stretch',
        alignSelf: 'center',
        marginRight: 10,
    },
    button: {
        backgroundColor: '#188cfd',
        padding: 15,
        borderRadius: 8,
        marginVertical: 11,
        width: '100%'
    },
    buttonText: {
        color: 'white',
        fontSize: 18, // equivalent to text-lg
        fontWeight: 'bold',
        textAlign: 'center',
    },
    endAlaing: {
        alignSelf: 'center',
        alignItems: 'center',
    },
    forgotPassword: {
        paddingLeft: 5,
        color: '#188cfd',
        marginBottom: 20,
        fontWeight:'bold',
        fontSize: 15,
        textDecorationLine: 'underline',
        textDecorationColor: '#188cfd',
    },
});