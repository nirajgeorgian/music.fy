import React from 'react';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const PlayerScreen = ({ ...props }: any) => {
  console.log('@@ props: ', props);
  // const { song } = route.params;
  // const [sound, setSound] = useState();
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [playbackPosition, setPlaybackPosition] = useState(0);
  // const [playbackDuration, setPlaybackDuration] = useState(0);

  // const loadSound = async () => {
  //   const { sound } = await Audio.Sound.createAsync(
  //     { uri: song.url }, // Replace 'song.url' with your actual song URL property
  //     {
  //       shouldPlay: isPlaying,
  //       isLooping: false,
  //     },
  //     updatePlaybackStatus,
  //   );
  //   // setSound(sound);
  // };

  // useEffect(() => {
  //   loadSound();
  //   return sound
  //     ? () => {
  //         sound.unloadAsync();
  //       }
  //     : undefined;
  // }, [song]);

  // const updatePlaybackStatus = (status) => {
  //   if (status.isLoaded) {
  //     setIsPlaying(status.isPlaying);
  //     setPlaybackPosition(status.positionMillis);
  //     setPlaybackDuration(status.durationMillis);
  //   }
  // };

  // const onPlayPausePress = async () => {
  //   if (sound) {
  //     if (isPlaying) {
  //       await sound.pauseAsync();
  //     } else {
  //       await sound.playAsync();
  //     }
  //   }
  // };

  return (
    <View style={styles.container}>
      {/* <Image source={{ uri: song.coverImage }} style={styles.coverImage} />
      <Text style={styles.title}>{song.title}</Text>
      <Text style={styles.artist}>{song.artist}</Text>

      <View style={styles.controls}>
        <TouchableOpacity onPress={onPlayPausePress}>
          <MaterialIcons name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'} size={48} color="#4F8EF7" />
        </TouchableOpacity>
      </View>

      <Slider
        style={styles.progressSlider}
        value={playbackPosition}
        minimumValue={0}
        maximumValue={playbackDuration}
        thumbTintColor="#4F8EF7"
        minimumTrackTintColor="#4F8EF7"
        maximumTrackTintColor="#000000"
        onSlidingComplete={async (value) => {
          if (sound) {
            await sound.setPositionAsync(value);
          }
        }}
      /> */}
      <Text>player details</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressSlider: {
    width: 300,
    height: 40,
  },
});

export default PlayerScreen;
