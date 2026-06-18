import { Image } from "expo-image";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { CategoryImage } from "../../../assets/images";

type Category = {
  id: number;
  name: string;
};

const categories: Category[] = [
  {
    id: 1,
    name: "Health & Beauty",
  },
  {
    id: 2,
    name: "Apparel & Fashion",
  },
  {
    id: 3,
    name: "Chemicals",
  },
  {
    id: 4,
    name: "Nothing",
  },
    {
    id: 5,
    name: "Chemicals",
  },
  {
    id: 6,
    name: "Nothing",
  },
];

const Main_Category = () => {
  return (
    <View className={styles.container}>
      
      {/* Header Section */}
      <View className={styles.outer}>
        <View className={styles.left}>
          <Text className={styles.heading}>
            Top Categories
          </Text>
        </View>

        <Pressable 
          className={styles.viewAllBtn}
          hitSlop={8}
        >
          <Text className={styles.viewAllText}>
            View all
          </Text>
        </Pressable>
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className={styles.cardsContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((item) => (
          <Pressable
            key={item.id}
            className={styles.card}
          >
            <View className={styles.imageWrapper}>
              <Image
                source={CategoryImage}
                style={styles.image}
                contentFit="cover"
              />
            </View>

            {/* Typography Polish: Better contrast, tight letter spacing, crisp layout */}
            <Text 
              className={styles.cardText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

    </View>
  );
};

export default Main_Category;

const styles = {
  container: "mt-6", 

  outer: "flex flex-row justify-between items-center px-4",

  left: "",

  // Deep slate navy, extra bold tracking tight for that premium aesthetic
  heading: "text-[22px] font-jakarta-bold text-slate-900 tracking-tight", 

  // Clean interactive button capsule
  viewAllBtn: 
    "bg-slate-100/80 active:bg-slate-200 px-3.5 py-1.5 rounded-full active:scale-95 transition-all",

  // Using semibold dark blue color to give high contrast pop
  viewAllText: "text-slate-900 font-jakarta-semibold text-xs tracking-tight", 

  cardsContainer: "mt-3 pl-4",

  scrollContent: {
    paddingRight: 16, 
  },

  card: "mr-4 items-center w-[105px] active:scale-95 transition-all", 

  imageWrapper: 
    "w-[105px] h-[105px] bg-slate-50 border border-slate-100/80 rounded-2xl items-center justify-center p-2.5 overflow-hidden shadow-sm shadow-slate-100", 

  image: {
    width: "100%" as const,
    height: "100%" as const,
    borderRadius: 14, 
  },

  // Lifted the visual design: Using Slate-800 instead of harsh black, semibold weight, tight spacing, single row
  cardText:
    "text-center text-slate-800 font-jakarta-semibold text-[13px] mt-2.5 w-full tracking-tight px-1",
};