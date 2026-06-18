import Banner2 from '@/components/Home/Bannee2';
import SellersByCityGrid from '@/components/Home/Cities';
import CustomTabBar from '@/components/Home/Footer';
import HeroBanner from '@/components/Home/HeroBanner';
import IndustryTreeCarousel from '@/components/Home/IndusTreeCasaroul';
import Top_Industries from '@/components/Home/Industry';
import Navbar from '@/components/Home/Navbar';
import NewOnes from '@/components/Home/NewOnes';
import Main_Category from '@/components/Home/TopCategory';
import HorizontalProductList from '@/components/Home/Trending';
import TrustedBy from '@/components/Home/Trusted';
import Sidebar from '@/components/ui/Sidebar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Navbar onMenuPress={() => setIsSidebarOpen(true)} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroBanner />
        <Main_Category />
        <Banner2 />
        <Top_Industries />
        <HorizontalProductList/>
        <NewOnes/>
        <TrustedBy/>
        <IndustryTreeCarousel/>
        <SellersByCityGrid/>
      </ScrollView>
      <Sidebar visible={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <CustomTabBar/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
