import { Tabs } from 'expo-router';

import Entypo from '@expo/vector-icons/Entypo';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#90BE6D',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <Entypo name='map' color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, focused }) => (
            <Entypo name='user' color={color} size={24}/>
          ),
        }}
      />
      {/*<Tabs.Screen
        name="marker/[id]"
        options={{
          href: null, // Это скрывает маршрут из навигации
        }}
      />*/}
    </Tabs>
  );
}
