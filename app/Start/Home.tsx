import { useRouter } from "expo-router";
import { Pressable, Text, View, SafeAreaView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Home = () => {
  const router = useRouter();

  const handleMenuPress = () => {
    // Add logic for opening the menu (e.g., navigate to a menu screen or toggle a drawer)
    router.push('./components/Menu'); 
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header with Burger Menu */}
      <View className="flex-row justify-between items-center px-4 py-4 bg-gray-800">
        <Text className="text-white text-lg font-bold">Home</Text>
        <TouchableOpacity onPress={handleMenuPress}>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-4">
        <Text className="text-white text-lg">Page</Text>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "./Login",
            })
          }
        >
          <Text className="text-cyan-500 mt-4">Go to user 2</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Home;