import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer } from "expo-video";
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
type props = {
    onFinish: (status: boolean) => void;
}
const { width, height } = Dimensions.get('window');
const SplashVideo = ({ onFinish }: props) => {
      const videoSource = Platform.OS? require('@/assets/animacion.mp4') : require('@/assets/animacion.mp4') ;
      const [videoEnded, setVideoEnded] = useState(false);
      const [isLoading, setIsLoading] = useState(true);
      // Configuración de buffer más adecuada para diferentes dispositivos
      const bufferConfig = Platform.select({
        android: {
          maxBufferBytes: 50 * 1024 * 1024, // 50MB como máximo de buffer
          minBufferForPlayback: 1000, // ms
          preferredForwardBufferDuration: 5000, // 5 segundos
        },
        ios: {
          maxBufferBytes: 50 * 1024 * 1024,
          minBufferForPlayback: 500,
          preferredForwardBufferDuration: 5000,
        },
        default: {
          maxBufferBytes: 50 * 1024 * 1024,
          minBufferForPlayback: 1000,
          preferredForwardBufferDuration: 5000,
        }
      });
     
     const player = useVideoPlayer(videoSource, (player) => {
       player.bufferOptions = bufferConfig;
     });
     
       useEffect(() => {
         let subscription;
         
         if ( player) {
           //player.play();
           
           subscription = player.addListener('statusChange', () => {
            setTimeout(() => {
             setIsLoading(false);
            }, 1000);
             setTimeout(() => {
               onFinish(true);  
             }, 7500);
           });
         }
         
     
         return () => {
           if (subscription) {
             subscription.remove();
           }
           if (player) {
             //player.pause();
           }
         };
       }, [player]);
     
   
     return (
               <SafeAreaView style={[styles.contentContainer, { backgroundColor: '#FAF6ED' }]}>
                <StatusBar backgroundColor="#FAF6ED" hidden={true} />
                {isLoading && (
                <View style={[styles.loadingContainer]}>
                </View>
            )}
            <Image
                source={require('@/assets/images/principal/logo-vertical.webp')}
                style={{ width: 300, height: 300, alignSelf: 'center' , resizeMode: 'contain'}}
            />
               {/* <VideoView
                   style={[styles.video, { backgroundColor: '#aaaaaa' }]}
                   player={player}
                   allowsFullscreen={false}
                   allowsPictureInPicture={false}
                   nativeControls={false}
                 /> */}
               </SafeAreaView>
     );
   }
   
   const styles = StyleSheet.create({
     contentContainer: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
       width: '100%',
       height: '90%',
       backgroundColor: '#FAF6ED',
     },
     video: {
       width: width,
       height: height,
       backgroundColor: '#FAF6ED'
     },
     loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      backgroundColor: '#FAF6ED',
  },
   });
export default SplashVideo