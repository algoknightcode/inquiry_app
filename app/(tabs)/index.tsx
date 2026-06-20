import Banner2 from '@/components/Home/Bannee2';
import SellersByCityGrid from '@/components/Home/Cities';
import CustomTabBar from '@/components/Home/Footer';
import Form2 from '@/components/Home/Form2';
import HeroBanner from '@/components/Home/HeroBanner';
import IndustryTreeCarousel from '@/components/Home/IndusTreeCasaroul';
import Top_Industries from '@/components/Home/Industry';
import Navbar from '@/components/Home/Navbar';
import NewOnes from '@/components/Home/NewOnes';
import TestimonialComponent from '@/components/Home/Reviews';
import LeadGenCard from '@/components/Home/SmallForm';
import Main_Category from '@/components/Home/TopCategory';
import HorizontalProductList from '@/components/Home/Trending';
import TrustedBy from '@/components/Home/Trusted';
import VideoSection from '@/components/Home/Video_component';
import Sidebar from '@/components/ui/Sidebar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Navbar onMenuPress={() => setIsSidebarOpen(true)} />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
        <HeroBanner />
        <Main_Category />
        <Banner2 />
        <Top_Industries />
        <HorizontalProductList/>
        <VideoSection />
        <NewOnes/>
        <TrustedBy/>
        <LeadGenCard/>
        <IndustryTreeCarousel/>
        <SellersByCityGrid/>
        <TestimonialComponent/>
        <Form2/>
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
