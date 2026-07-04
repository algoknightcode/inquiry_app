import Banner2 from '@/components/Home/Bannee2';
import CategoryMarquee from '@/components/Home/CategoryMarquee';
import FaqSection from '@/components/Home/Faq';
import Form2 from '@/components/Home/Form2';
import HeroBanner from '@/components/Home/HeroBanner';
import IndustryTreeCarousel from '@/components/Home/IndusTreeCasaroul';
import Top_Industries from '@/components/Home/Industry';
import Navbar from '@/components/Home/Navbar';
import NewOnes from '@/components/Home/NewOnes';
import TestimonialComponent from '@/components/Home/Reviews';
import SearchBar from '@/components/Home/SearchBar';
import LeadGenCard from '@/components/Home/SmallForm';
import Main_Category from '@/components/Home/TopCategory';
import TrendingBrandsCarousel from '@/components/Home/TredingBrandsCasaroul';
import HorizontalProductList from '@/components/Home/Trending';
import TrustedBy from '@/components/Home/Trusted';
import Sidebar from '@/components/ui/Sidebar';
import { userRole } from '@/utils/roleCache';
import MoreValueAdds from '@/components/Home/MoreValueAdds';
import SellersByCityGrid from '@/components/Home/Cities';
import WeConnectBuyerSeller from '@/components/Home/WeConnect_BuyerSeller';
import HomeFooterHelp from '@/components/Home/HomeFooterHelp';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, View, Platform } from 'react-native';

// Memoize all home components to prevent unnecessary re-renders during scrolls
const MemoizedCategoryMarquee = React.memo(CategoryMarquee);
const MemoizedHeroBanner = React.memo(HeroBanner);
const MemoizedSearchBar = React.memo(SearchBar);
const MemoizedMainCategory = React.memo(Main_Category);
const MemoizedBanner2 = React.memo(Banner2);
const MemoizedTopIndustries = React.memo(Top_Industries);
const MemoizedHorizontalProductList = React.memo(HorizontalProductList);
const MemoizedNewOnes = React.memo(NewOnes);
const MemoizedTrustedBy = React.memo(TrustedBy);
const MemoizedTrendingBrandsCarousel = React.memo(TrendingBrandsCarousel);
const MemoizedLeadGenCard = React.memo(LeadGenCard);
const MemoizedIndustryTreeCarousel = React.memo(IndustryTreeCarousel);
const MemoizedTestimonialComponent = React.memo(TestimonialComponent);
const MemoizedFaqSection = React.memo(FaqSection);
const MemoizedForm2 = React.memo(Form2);
const MemoizedMoreValueAdds = React.memo(MoreValueAdds);
const MemoizedSellersByCityGrid = React.memo(SellersByCityGrid);
const MemoizedWeConnectBuyerSeller = React.memo(WeConnectBuyerSeller);
const MemoizedHomeFooterHelp = React.memo(HomeFooterHelp);

export default function HomeScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [renderBelowFold, setRenderBelowFold] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Progressive rendering: Load heavy below-the-fold components after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderBelowFold(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const sections = useMemo(() => {
    const base = [
      { id: 'marquee' },
      { id: 'hero' },
      { id: 'search' },
      { id: 'categories' },
      { id: 'cities' },
      { id: 'banner2' },
      { id: 'weConnect' },
      { id: 'moreValueAdds' },
      { id: 'industries' },
      { id: 'trending' },
    ];

    if (renderBelowFold) {
      base.push(
        { id: 'newOnes' },
        { id: 'trusted' },
        { id: 'trendingBrands' },
        { id: 'leadGen' },
        { id: 'industryTree' },
        { id: 'testimonials' },
        { id: 'footerHelp' },
        { id: 'faq' },
        { id: 'form2' }
      );
    } else {
      // Placeholder item to maintain scroll height/feel before loading below-fold content
      base.push({ id: 'belowFoldPlaceholder' });
    }

    return base;
  }, [renderBelowFold]);

  const renderItem = useCallback(({ item }: { item: { id: string } }) => {
    switch (item.id) {
      case 'marquee':
        return <MemoizedCategoryMarquee />;
      case 'hero':
        return <MemoizedHeroBanner />;
      case 'search':
        return (
          <MemoizedSearchBar
            onFocus={() => {
              const scrollOffset = Platform.OS === 'ios' ? 120 : 60;
              setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset: scrollOffset, animated: true });
              }, 150);
            }}
          />
        );
      case 'categories':
        return <MemoizedMainCategory />;
      case 'banner2':
        return <MemoizedBanner2 />;
      case 'industries':
        return <MemoizedTopIndustries />;
      case 'trending':
        return <MemoizedHorizontalProductList />;
      case 'newOnes':
        return <MemoizedNewOnes />;
      case 'trusted':
        return <MemoizedTrustedBy />;
      case 'trendingBrands':
        return <MemoizedTrendingBrandsCarousel />;
      case 'moreValueAdds':
        return <MemoizedMoreValueAdds />;
      case 'leadGen':
        return <MemoizedLeadGenCard />;
      case 'industryTree':
        return <MemoizedIndustryTreeCarousel />;
      case 'testimonials':
        return <MemoizedTestimonialComponent />;
      case 'footerHelp':
        return (
          <MemoizedHomeFooterHelp
            facebookUrl="https://facebook.com/inquirybazaar"
            instagramUrl="https://instagram.com/inquirybazaar"
            linkedinUrl="https://linkedin.com/company/inquirybazaar"
            youtubeUrl="https://youtube.com/inquirybazaar"
          />
        );
      case 'faq':
        return <MemoizedFaqSection />;
      case 'form2':
        return <MemoizedForm2 />;
      case 'cities':
        return <MemoizedSellersByCityGrid />;
      case 'weConnect':
        return <MemoizedWeConnectBuyerSeller />;
      case 'belowFoldPlaceholder':
        return <View style={{ height: 600 }} />;
      default:
        return null;
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Navbar onMenuPress={() => setIsSidebarOpen(true)} />
      <FlatList
        ref={flatListRef}
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="always"
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
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
