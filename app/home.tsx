import React from 'react';
import { Audio } from 'expo-av';
import { Stack } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { MaterialIcons } from '@expo/vector-icons';
import { Image, Text, View, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, LayoutAnimation, Platform, UIManager } from 'react-native';

const Tags = ({ tags }: any) => {
  return (
    <View style={styles.tagsContainer}>
      {tags.map((tag: any, index: number) => (
        <View key={index} style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ))}
    </View>
  );
};

const SensorDataComponent = ({ data }: any) => {
  return (
    <View style={styles.sensorContainer}>
      <View style={styles.sensorDataRow}>
        <Text style={styles.sensorText}>X: {data.x.toFixed(2)}</Text>
        <Text style={styles.sensorText}>Y: {data.y.toFixed(2)}</Text>
        <Text style={styles.sensorText}>Z: {data.z.toFixed(2)}</Text>
      </View>
      <Text style={styles.sensorTitle}>Sensor Data</Text>
    </View>
  );
};

function HomeStack({ children }: any) {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          // https://reactnavigation.org/docs/headers#setting-the-header-title
          title: 'My home',
          // https://reactnavigation.org/docs/headers#adjusting-header-styles
          headerStyle: { backgroundColor: '#f4511e' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      {children}
    </View>
  );
}

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Home() {
  const [sound, setSound] = React.useState<any>();
  const [soundData, setSoundData] = React.useState<any>();
  const [loading, setLoading] = React.useState(false);
  const [musicList, setMusicList] = React.useState([]);
  const [playingId, setPlayingId] = React.useState("");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentRate, setCurrentRate] = React.useState(1.0);
  const [data, setData] = React.useState({ x: 0, y: 0, z: 0 });

  React.useEffect(() => {
    const subscription = Accelerometer.addListener(accelerometerData => {
      setData(accelerometerData);
    });
    Accelerometer.setUpdateInterval(100);
    return () => subscription && subscription.remove();
  }, []);

  React.useEffect(() => {
    let isRateAdjustmentNeeded = true;
  
    const adjustPlaybackRate = (accelerometerData: any) => {

      const targetRate = calculatePlaybackRate(accelerometerData);
  
      // Only adjust if the difference is significant to avoid minor fluctuations
      if (Math.abs(targetRate - currentRate) >= 0.1 && isRateAdjustmentNeeded) {
        setCurrentRate(targetRate);
        if (sound) {
          sound.setRateAsync(targetRate, true);
        }
        isRateAdjustmentNeeded = false; // Prevent further adjustments until the next significant data change
      }
    };
  
    // Throttle rate adjustments by resetting the flag every 500ms
    const rateAdjustmentThrottle = setInterval(() => {
      isRateAdjustmentNeeded = true;
    }, 500);
  
    // Listen to accelerometer data changes
    const dataListener = Accelerometer.addListener((accelerometerData) => {
      adjustPlaybackRate(accelerometerData);
    });
  
    return () => {
      dataListener && dataListener.remove();
      clearInterval(rateAdjustmentThrottle);
    };
  }, [sound]); // Depend only on sound to avoid re-execution due to currentRate or data changes

  React.useEffect(() => {
    const url = "https://freesound.org/apiv2/search/text/?query=beat&token=ZO8Ny9tMBLKCQw3DOAIhYD8glC9IUTkh8gnDGuQW";
    fetch(url)
      .then(response => response.json())
      .then(data => setMusicList(data.results))
      .catch(error => console.error('Error fetching music list:', error));
  }, []);

  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const calculatePlaybackRate = ({ x, y, z }: { x: number, y: number, z: number }) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    let rate = 1.0; // Normal speed

    if (magnitude > 1) {
      rate += magnitude * 0.1; // Increase rate based on magnitude
    }

    return Math.min(Math.max(rate, 0.5), 2.0); // Constrain rate between 0.5x and 2.0x
  };

  const handlePress = async (soundId: string) => {
    setLoading(true); // Start loading when a new sound is pressed
  
    try {
      if (sound && playingId === soundId) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        setLoading(false); // Stop loading since it's just play/pause toggle
        return; // Early return to avoid reloading the sound
      }
  
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);  
      setPlayingId(soundId);
      const apiUrl = `https://freesound.org/apiv2/sounds/${soundId}/?token=ZO8Ny9tMBLKCQw3DOAIhYD8glC9IUTkh8gnDGuQW`;
      const response = await fetch(apiUrl);
  
      if (!response.ok) {
        throw new Error('Failed to fetch sound details');
      }
  
      const _soundData = await response.json();
      setSoundData(_soundData)
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
  
      const { sound: music } = await Audio.Sound.createAsync(
        { uri: _soundData.previews['preview-lq-mp3'] },
        { shouldPlay: true, isLooping: true }
      );

      setSound(music);
      setIsPlaying(true); // Sound starts playing
      setCurrentRate(1.0); 
    } catch (error) {
      console.error('Error fetching or playing sound:', error);
    } finally {
      setLoading(false); // Stop loading after sound is loaded or if there's an error
    }
  };  

  const renderItem = ({ item }: any) => {
    const isExpanded = item.id === playingId;
    const isLoading = loading && item.id === playingId; // Check if this item is loading
    const isCurrentlyPlaying = isPlaying && item.id === playingId; // Check if this item is currently playing

    // Combine styles conditionally for the playing item
  const itemStyles = [
    styles.musicItem,
    isExpanded && styles.expandedItem,
    isCurrentlyPlaying && styles.playingItem, // Apply playingItem styles if the item is currently playing
  ];
    
  function formatArtistName(username: string) {
    // Check if the username already starts with '@'
    if (username.startsWith('@')) {
      return username; // If it does, return it as is
    } else {
      return `@${username}`; // If not, prepend '@' to the username
    }
  }
    
    function formatMusicName(music: string) {
      return music.split(" ").splice(1).join(" ")
    }
    
    const { name, username } = item;
    const musicName = formatMusicName(name);
    const artistname = formatArtistName(username)

    return (
      <>
        {isExpanded && soundData && (
          <View style={styles.expandedContent}>
            <Image source={{ uri: soundData.images.spectral_bw_l }} style={styles.musicImage} resizeMode="cover" />
          </View>
        )}
      <TouchableOpacity style={itemStyles} onPress={() => handlePress(item.id)}>
        <View style={styles.musicInfo}>
          <Text style={styles.musicTitle}>{musicName}</Text>
          <Text style={styles.musicArtist}>{artistname}</Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <MaterialIcons size={32} color="black" name={isCurrentlyPlaying ? "pause-circle-outline" : "play-circle-outline"} />
          )}
        </TouchableOpacity>
        </>
    );
  }

  return (
    <HomeStack>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>music.fy</Text>
            <Text style={styles.headerDescription}>music with fitness</Text>
          </View>
          <FlatList
            data={musicList}
            renderItem={renderItem}
            style={styles.musicList}
            keyExtractor={(item: any) => item.id.toString()}
          />
          <SensorDataComponent data={data} />
        </View>
      </SafeAreaView>
    </HomeStack>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  headerContainer: {
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4511e', // White color for the title text
  },
  headerDescription: {
    fontSize: 16,
    color: '#f4511e', // White color for the description text
    marginTop: 4, // Margin top for spacing between title and description
  },
  container: {
    flex: 1,
    padding: 16,
  },
  sensorContainer: {
    backgroundColor: '#ffffff', // White background for sensor data
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    borderBottomWidth: 2.5,
    borderBottomColor: '#f4511e'
  },
  sensorTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sensorDataRow: {
    flexDirection: 'row', // Align data horizontally
    justifyContent: 'space-evenly', // Evenly space data elements
  },
  sensorText: {
    fontSize: 16,
  },
  musicList: {
    flex: 1,
  },
  musicItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
  },
  expandedItem: {
    backgroundColor: '#e0e0e0', // Consistent with the playing item background
  },
  expandedContent: {
    flexDirection: 'column', // Arrange expanded content in a column
    alignItems: 'center', // Center items horizontally
    marginTop: 10, // Margin top for spacing from the item title and artist
  },
  musicImage: {
    width: '100%', // Set the width to 100% of its container
    height: 75, // Fixed height of 75
    resizeMode: 'cover', // Ensure the image covers the area, cropping as necessary
  },
  musicInfo: {
    flex: 1,
  },
  musicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  musicArtist: {
    fontSize: 14,
    color: '#666666', // Dark grey for artist text
  },
  playingItem: {
    borderBottomWidth: 2.5, // A stronger bottom border to highlight the playing item
    backgroundColor: '#e0e0e0', // A slightly darker background for the playing item
    borderBottomColor: '#f4511e', // Darker border color for emphasis
  },
  tagsContainer: {
    flexDirection: 'row', // Arrange tags in a row
    flexWrap: 'wrap', // Allow tags to wrap to the next line if space runs out
    marginTop: 10, // Margin top for spacing from the image or other content
  },
  tag: {
    backgroundColor: '#e0e0e0', // Light grey background for each tag
    borderRadius: 15, // Rounded corners for tag
    paddingHorizontal: 8, // Horizontal padding within the tag
    paddingVertical: 4, // Vertical padding within the tag
    marginRight: 8, // Margin right for spacing between tags
    marginBottom: 8, // Margin bottom for spacing between rows of tags
  },
  tagText: {
    fontSize: 14, // Font size for tag text
    color: '#333', // Dark grey color for tag text
  },
});
