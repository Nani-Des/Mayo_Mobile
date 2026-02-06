import { ScrollView, StyleSheet, View, RefreshControl, Text, TouchableOpacity, Modal } from "react-native";
import { homeStyles } from "../../assets/styles/home.styles";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {

  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // refresh work here (fetch, load, etc.)
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (



  //  <SafeAreaView style={{ flex: 1, }}>
    <View style={homeStyles.container}>

      {/* Top Nav */}
      <View style={homeStyles.header}>
        <TouchableOpacity style={homeStyles.headerRight} onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={28} color={"#333"} />
        </TouchableOpacity>
        <Text style={homeStyles.headerTitle}>Mayo Clinic</Text>
        <TouchableOpacity style={homeStyles.headerRight} onPress={() => router.push("/(tabs)/profile") }>
          <Ionicons name="person-circle-outline" size={28} color={"#333"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={homeStyles.scrollContent}
      >

        <Text >Which department are you visiting today ?</Text>
        {/* DEPARTMENT ICONS */}
        <View style={homeStyles.welcomeSection}>

        

          {/* FEATURED SECTION */}

          <TouchableOpacity
           style={homeStyles.featuredCard}
              activeOpacity={0.9}
              onPress={() => router.push("/(tabs)/notes")}
              >
                
          </TouchableOpacity>
          <Image
            source={require("../../assets/images/doc-consultant.png")}
            style={{ 
              width: 100, 
              height: 100,
            }}
          />
          <Image
            source={require("../../assets/images/blood-sample.png")}
            style={{ 
              width: 100, 
              height: 100,
            }}
          />
          <Image
            source={require("../../assets/images/microscope.png")}
            style={{ 
              width: 100, 
              height: 100,
            }}
          />
        </View>
      </ScrollView>

      {/* Menu Modal for quick tab navigation */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1}  onPress={() => setMenuVisible(false)}>
          <View style={homeStyles.menuContainer}>
            <TouchableOpacity onPress={() => { setMenuVisible(false); router.push("/(tabs)"); }} style={homeStyles.menuItem}>
              <Text style={homeStyles.menuItemText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMenuVisible(false); router.push("/(tabs)/share"); }} style={homeStyles.menuItem}>
              <Text style={homeStyles.menuItemText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMenuVisible(false); router.push("/(tabs)/notes"); }} style={homeStyles.menuItem}>
              <Text style={homeStyles.menuItemText}>Notes</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
   // </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
  },
});