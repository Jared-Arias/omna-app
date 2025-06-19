import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RouteType, Routes } from '@/services/auth/type/routes';

interface HeaderIcon {
    name:  keyof typeof Ionicons.glyphMap;  
    onPress: () => void; 
    color?: string; 
    size?: number; 
}

interface HeaderProps {
    welcomeText: string; 
    icons: HeaderIcon[]; 
    backRoute?: RouteType | Routes ;
}



const HeaderEbookAccount: React.FC<HeaderProps> = ({ welcomeText, icons, backRoute  }) => {
    return (
        <View style={styles.headerContainer}>
            <View style= {{flexDirection: 'row'}}>
            <TouchableOpacity
            onPress={() => backRoute? router.replace(backRoute) : router.back()}
                >
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.textHeader} numberOfLines={1} ellipsizeMode='tail'>{welcomeText}</Text>
            </View>
            <View style={styles.iconsContainer}>
                {icons.map((icon, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.containerTouch} 
                        onPress={icon.onPress}
                    >
                        <View style={styles.containerIcon}>
                            <Ionicons 
                                name={icon.name} 
                                size={icon.size || 20} 
                                color={icon.color || 'red'} 
                            />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        padding: 10,
        backgroundColor: 'black',
        flexDirection: 'row',
        marginHorizontal: 5,
        justifyContent: 'space-between'
    },
    textHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        alignSelf: 'flex-start',
        paddingHorizontal: 10
    },
    iconsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginRight: 10
    },
    containerTouch: {
        marginLeft: 10,
    },
    containerIcon: {
        backgroundColor: 'black',
        padding: 3,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: 'red',
    },
});

export default HeaderEbookAccount;
