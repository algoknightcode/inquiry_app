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
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, SafeAreaView, StyleSheet } from 'react-native';
// Added Reanimated imports
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

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
  const flatListRef = useRef<FlatList>(null);
  
  // 1. Replaced Animated.Value with Reanimated's useSharedValue
  const scrollY = useSharedValue(0);
  
  // 2. Track if user is currently scrolling (for pausing carousels)
  const isScrolling = useSharedValue(false);
  const scrollEndTimer = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setRenderBelowFold(true);
    }, 700); // Wait 700ms to let first frame paint smoothly
    return () => clearTimeout(timer);
  }, []);

  // Handler for Search Bar focus
  const handleSearchBarFocus = useCallback(() => {
    const scrollOffset = Platform.OS === 'ios' ? 120 : 60;
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: scrollOffset, animated: true });
    }, 150);
  }, []);

  // Data keys only - keeps the data array extremely lightweight and static
  const data = useMemo(() => {
    const list = [
      'marquee',
      'hero',
      'searchbar',
      'category',
      'banner2',
      'industries',
      'valueadds',
      'brands',
    ];
    if (renderBelowFold) {
      list.push(
        'products',
        'indusTree',
        'cities',
        'newones',
        'connect',
        'trusted',
        'moreForYou',
        'video',
        'leadform',
        'testimonials',
        'faq',
        'footer'
      );
    }
    return list;
  }, [renderBelowFold]);

  // Static renderer - ensures React.memo works perfectly because JSX elements are not re-allocated in values
  const renderItem = useCallback(({ item }: { item: string }) => {
    switch (item) {
      case 'marquee':
        return <MemoizedCategoryMarquee isScrolling={isScrolling} />;
      case 'hero':
        return <MemoizedHeroBanner />;
      case 'searchbar':
        return <MemoizedSearchBar onFocus={handleSearchBarFocus} />;
      case 'category':
        return <MemoizedMain_Category />;
      case 'banner2':
        return <MemoizedBanner2 />;
      case 'industries':
        return <MemoizedTop_Industries />;
      case 'valueadds':
        return <MemoizedMoreValueAdds />;
      case 'brands':
        return <MemoizedTrendingBrandsCarousel isScrolling={isScrolling} />;
      case 'products':
        return <MemoizedHorizontalProductList isScrolling={isScrolling} />;
      case 'indusTree':
        return <MemoizedIndustryTreeCarousel isScrolling={isScrolling} />;
      case 'cities':
        return <MemoizedSellersByCityGrid />;
      case 'newones':
        return <MemoizedNewOnes isScrolling={isScrolling} />;
      case 'connect':
        return <MemoizedWeConnectBuyerSeller />;
      case 'trusted':
        return <MemoizedTrustedBy isScrolling={isScrolling} />;
      case 'moreForYou':
        return <MemoizedMoreForYou isScrolling={isScrolling} />;
      case 'video':
        return <MemoizedVideoSection />;
      case 'leadform':
        return <MemoizedLeadGenCard />;
      case 'testimonials':
        return <MemoizedTestimonialComponent isScrolling={isScrolling} />;
      case 'faq':
        return <MemoizedFaqSection />;
      case 'footer':
        return (
          <MemoizedHomeFooterHelp
            facebookUrl="https://facebook.com/inquirybazaar"
            instagramUrl="https://instagram.com/inquirybazaar"
            linkedinUrl="https://linkedin.com/company/inquirybazaar"
            youtubeUrl="https://youtube.com/inquirybazaar"
          />
        );
      default:
        return null;
    }
  }, [handleSearchBarFocus, isScrolling]);

  const keyExtractor = useCallback((item: string) => item, []);

  // 3. Map standard scroll events directly to the UI thread using Reanimated
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      // Mark as scrolling
      isScrolling.value = true;
    },
    onEndDrag: () => {
      // Debounce scroll end - resume autoplay after 500ms of no scroll
      if (scrollEndTimer.current) {
        clearTimeout(scrollEndTimer.current);
      }
      scrollEndTimer.current = setTimeout(() => {
        isScrolling.value = false;
      }, 500);
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* 3. Pass the Reanimated SharedValue safely to the Navbar */}
      <Navbar onMenuPress={() => setIsSidebarOpen(true)} scrollY={scrollY} />

      <Animated.FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        // 4. Attach the Reanimated scroll handler instead of standard Animated.event
        onScroll={scrollHandler}
        scrollEventThrottle={32} // Reduce JS thread spam - fires at ~30fps while UI thread maintains 60fps via Reanimated
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={Platform.OS === 'android'}
        windowSize={15}
        maxToRenderPerBatch={5}
        initialNumToRender={8}
        updateCellsBatchingPeriod={50}
        overScrollMode="never"
        decelerationRate={Platform.OS === 'android' ? 'normal' : 'normal'}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

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