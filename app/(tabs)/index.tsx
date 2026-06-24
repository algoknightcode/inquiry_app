import Banner2 from '@/components/Home/Bannee2';
import SellersByCityGrid from '@/components/Home/Cities';
import FaqSection from '@/components/Home/Faq';
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
import Sidebar from '@/components/ui/Sidebar';
import { userRole } from '@/utils/roleCache';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [renderBelowFold, setRenderBelowFold] = useState(false);

  // Progressive rendering: Load heavy below-the-fold components after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderBelowFold(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const sections = [
    { id: 'hero', render: () => <HeroBanner /> },
    { id: 'categories', render: () => <Main_Category /> },
    { id: 'banner2', render: () => <Banner2 /> },
    { id: 'industries', render: () => <Top_Industries /> },
    { id: 'trending', render: () => <HorizontalProductList /> },
    {
      id: 'belowFold',
      render: () =>
        renderBelowFold ? (
          <View>
            <NewOnes />
            <TrustedBy />
            <LeadGenCard />
            <IndustryTreeCarousel />
            <SellersByCityGrid />
            <TestimonialComponent />
            <FaqSection/>
            <Form2 />
          </View>
        ) : (
          <View style={{ height: 600 }} />
        ),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Navbar onMenuPress={() => setIsSidebarOpen(true)} />
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => item.render()}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={3}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="always"
      />
      <Sidebar 
        visible={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        currentRole={userRole}
      />
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
