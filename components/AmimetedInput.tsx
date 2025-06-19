import React, { useState, RefObject } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ColorValue, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

interface AnimatedInputProps extends Omit<TextInputProps, 'placeholderTextColor'> {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  inputRef?: RefObject<TextInput>;
  onFocus?: () => void;
  iconColor?: ColorValue;
  placeholderColor?: ColorValue;
  inputColor?: ColorValue;
  textColors?: ColorValue;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({ 
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType,
  inputRef,
  onFocus,
  iconColor = 'white',
  placeholderColor = 'white',
  inputColor = 'white',
  textColors = 'white',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const labelAnimation = useSharedValue<number>(0);

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            labelAnimation.value,
            [0, 1],
            [0, -25],
          ),
        },
        {
          scale: interpolate(
            labelAnimation.value,
            [0, 1],
            [1, 0.8],
          ),
        }
      ],
      color: placeholderColor as string,
    };
  });



  const handleFocus = (): void => {
    setIsFocused(true);
    labelAnimation.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
    onFocus?.();
  };

  const handleBlur = (): void => {
    setIsFocused(false);
    if (!value) {
      labelAnimation.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
    }
  };

  return (
    <View style={[{paddingTop: 20, width: '100%'}]}>
    <View style={[styles.inputContainer,{backgroundColor: inputColor}]}>
      <Ionicons 
        name={icon} 
        size={24} 
        color={iconColor} 
        style={styles.icon} 
      />
       <Text style={[{color: 'white', fontSize: 40, height: '100%' , width: 4.5, marginTop: -13, marginLeft: -12},Platform.OS === 'ios' ? { fontSize: 50, width: 4, marginTop: -8, marginLeft: -10 } : {}]}>|</Text>
      <Animated.Text 
        style={[
          styles.placeholder,
          animatedLabelStyle,
          isFocused || value ? styles.activePlaceholder : {},
          { color: placeholderColor },
          {backgroundColor: inputColor}
        ]}
      >
        {placeholder}
      </Animated.Text>
      <TextInput
        style={[styles.input, { color: textColors }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        ref={inputRef}
        placeholderTextColor="transparent"
        {...props}
      />
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    gap: 10,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 26,
    marginBottom: 15,
    position: 'relative',
  },
  icon: {
    padding: 5,
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
  },
  placeholder: {
    position: 'absolute',
    left: 50,
    paddingHorizontal: 5,
    fontSize: 14,
  },
  activePlaceholder: {
    fontSize: 16,
  },
});

export default AnimatedInput;