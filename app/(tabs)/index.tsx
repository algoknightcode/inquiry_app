import React, { useRef, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import Banner2 from '@/components/Home/Bannee2';
import CategoryMarquee from '@/components/Home/CategoryMarquee';
import SellersByCityGrid from '@/components/Home/Cities';
import FaqSection from '@/components/Home/Faq';
import HeroBanner from '@/components/Home/HeroBanner';
import HomeFooterHelp from '@/components/Home/HomeFooterHelp';
import IndustryTreeCarousel from '@/components/Home/IndusTreeCasaroul';
import Top_Industries from '@/components/Home/Industry';
import MoreForYou from '@/components/Home/MoreForYou';
import MoreValueAdds from '@/components/Home/MoreValueAdds';
import Navbar from '@/components/Home/Navbar';
import NewOnes from '@/components/Home/NewOnes';
import TestimonialComponent from '@/components/Home/Reviews';
import SearchBar from '@/components/Home/SearchBar';
import LeadGenCard from '@/components/Home/SmallForm';
import Main_Category from '@/components/Home/TopCategory';
import TrendingBrandsCarousel from '@/components/Home/TredingBrandsCasaroul';
import HorizontalProductList from '@/components/Home/Trending';
import TrustedBy from '@/components/Home/Trusted';
import VideoSection from '@/components/Home/Video_component';
import WeConnectBuyerSeller from '@/components/Home/WeConnect_BuyerSeller';
import Sidebar from '@/components/ui/Sidebar';
import { userRole } from '@/utils/roleCache';

// Memoize all home components to prevent unnecessary re-renders during scrolls
const MemoizedBanner2 = React.memo(Banner2);
const MemoizedCategoryMarquee = React.memo(CategoryMarquee);
const MemoizedSellersByCityGrid = React.memo(SellersByCityGrid);
const MemoizedFaqSection = React.memo(FaqSection);
const MemoizedHeroBanner = React.memo(HeroBanner);
const MemoizedHomeFooterHelp = React.memo(HomeFooterHelp);
const MemoizedIndustryTreeCarousel = React.memo(IndustryTreeCarousel);
const MemoizedTop_Industries = React.memo(Top_Industries);
const MemoizedMoreForYou = React.memo(MoreForYou);
const MemoizedMoreValueAdds = React.memo(MoreValueAdds);
const MemoizedNewOnes = React.memo(NewOnes);
const MemoizedTestimonialComponent = React.memo(TestimonialComponent);
const MemoizedSearchBar = React.memo(SearchBar);
const MemoizedLeadGenCard = React.memo(LeadGenCard);
const MemoizedMain_Category = React.memo(Main_Category);
const MemoizedTrendingBrandsCarousel = React.memo(TrendingBrandsCarousel);
const MemoizedHorizontalProductList = React.memo(HorizontalProductList);
const MemoizedTrustedBy = React.memo(TrustedBy);
const MemoizedVideoSection = React.memo(VideoSection);
const MemoizedWeConnectBuyerSeller = React.memo(WeConnectBuyerSeller);

export default function HomeScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [renderBelowFold, setRenderBelowFold] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setRenderBelowFold(true);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Navbar onMenuPress={() => setIsSidebarOpen(true)} />
      
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <MemoizedCategoryMarquee />
        <MemoizedHeroBanner />
        
        <MemoizedSearchBar
          onFocus={() => {
            const scrollOffset = Platform.OS === 'ios' ? 120 : 60;
            setTimeout(() => {
              scrollViewRef.current?.scrollTo({ y: scrollOffset, animated: true });
            }, 150);
          }}
        />

        <MemoizedMain_Category />
        <MemoizedBanner2 />
        <MemoizedTop_Industries />
        <MemoizedMoreValueAdds />
        <MemoizedTrendingBrandsCarousel />
        
        {renderBelowFold && (
          <>
            <MemoizedHorizontalProductList />
            <MemoizedIndustryTreeCarousel />
            <MemoizedSellersByCityGrid />
            <MemoizedNewOnes />
            <MemoizedWeConnectBuyerSeller />
            <MemoizedTrustedBy />
            <MemoizedMoreForYou />
            <MemoizedVideoSection />
            <MemoizedLeadGenCard />
            <MemoizedTestimonialComponent />
            <MemoizedFaqSection />
            
            <MemoizedHomeFooterHelp
              facebookUrl="https://facebook.com/inquirybazaar"
              instagramUrl="https://instagram.com/inquirybazaar"
              linkedinUrl="https://linkedin.com/company/inquirybazaar"
              youtubeUrl="https://youtube.com/inquirybazaar"
            />
          </>
        )}
      </ScrollView>

      <Sidebar 
        visible={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        currentRole={userRole}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
