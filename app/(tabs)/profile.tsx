import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { homeStyles } from '../../assets/styles/home.styles';

export default function ProfileScreen() {
  return (
    <View style={[homeStyles.container, { padding: 20 }] }>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 16, color: '#007AFF' }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Profile</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={{ marginTop: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>User Profile</Text>
        <Text style={{ marginTop: 8, color: '#666' }}>- Add profile details here -</Text>
      </View>
    </View>
  );
}
