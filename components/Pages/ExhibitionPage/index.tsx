import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  background: '#0B1121', // Deep Navy Blue
  cardBackground: '#172136',
  cardBackgroundDarker: '#111827',
  primary: '#FF6D00', // Bright Orange
  textMain: '#FFFFFF',
  textMuted: '#9CA3AF',
  border: '#2A344A',
  oldWayBg: '#1C2333',
  newWayBg: '#2A1A12', // Subtle orange-brown tint
};

export default function InquiryBazaarLanding() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  // 1. Detect Device Characteristics
  const isTablet = screenWidth >= 768;
  const scale = isTablet ? 1.2 : Math.max(0.85, Math.min(1.15, screenWidth / 375));

  // 2. Responsive Constants
  const titleSize = 34 * scale;
  const sectionTitleSize = 28 * scale;
  const bodyTextSize = 15 * scale;
  const taglineSize = 11.5 * scale;
  
  const containerPadding = 20 * scale;
  const elementSpacing = 16 * scale;
  const sectionSpacing = 40 * scale;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 80 }} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- HERO SECTION --- */}
        <View style={[styles.heroSection, { paddingHorizontal: containerPadding, paddingTop: sectionSpacing }]}>
          <Text style={[styles.heroTitle, { fontSize: titleSize, lineHeight: titleSize * 1.2 }]}>
            Your Business,{'\n'}
            <Text style={{ color: COLORS.primary }}>Everywhere Online.</Text>{'\n'}
            Every Buyer. Every State.
          </Text>

          <View style={styles.taglineBox}>
            <MaterialCommunityIcons name="star-four-points" size={14 * scale} color="#EAB308" />
            <Text style={[styles.taglineText, { fontSize: taglineSize }]}>
              FROM EXHIBITIONS TO GOOGLE — YOU ARE EVERYWHERE
            </Text>
            <MaterialCommunityIcons name="star-four-points" size={14 * scale} color="#EAB308" />
          </View>

          <Text style={[styles.heroDescription, { fontSize: bodyTextSize, lineHeight: bodyTextSize * 1.5 }]}>
            Previously, suppliers traveled to different states and set up exhibitions to showcase their products. Now get that same visibility — without the stall, without the travel — right on Google, 24/7.
          </Text>

          {/* Action Buttons container with max-width constraints on Tablet */}
          <View style={[styles.actionBtnContainer, isTablet && styles.actionBtnContainerTablet]}>
            <TouchableOpacity 
              style={[styles.primaryBtn, { paddingVertical: 14 * scale }]}
              onPress={() => router.push('/HelpSupport')}
            >
              <Text style={[styles.primaryBtnText, { fontSize: 15 * scale }]}>Start Your Visibility</Text>
              <Feather name="arrow-right" size={18 * scale} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryBtn, { paddingVertical: 14 * scale }]}
              onPress={() => router.push('/HelpSupport')}
            >
              <Text style={[styles.secondaryBtnText, { fontSize: 15 * scale }]}>See How It Works</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Metrics */}
          <View style={[styles.heroMetricsContainer, { paddingVertical: 20 * scale }]}>
            <View style={styles.heroMetric}>
              <Text style={[styles.heroMetricValue, { fontSize: 26 * scale }]}>28+</Text>
              <Text style={[styles.heroMetricLabel, { fontSize: 11 * scale }]}>States Covered</Text>
            </View>
            <View style={[styles.heroMetric, styles.metricBorder]}>
              <Text style={[styles.heroMetricValue, { fontSize: 26 * scale }]}>10X</Text>
              <Text style={[styles.heroMetricLabel, { fontSize: 11 * scale }]}>More Visibility{'\n'}vs Exhibition</Text>
            </View>
            <View style={[styles.heroMetric, styles.metricBorder]}>
              <Text style={[styles.heroMetricValue, { fontSize: 26 * scale }]}>24/7</Text>
              <Text style={[styles.heroMetricLabel, { fontSize: 11 * scale }]}>Active on{'\n'}Google</Text>
            </View>
          </View>

          <View style={[styles.heroMetricFull, { paddingVertical: 16 * scale }]}>
            <Text style={[styles.heroMetricValue, { fontSize: 24 * scale }]}>100%</Text>
            <Text style={[styles.heroMetricLabel, { fontSize: 12 * scale }]}>Customised Inquiry Delivery</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- THE PROCESS SECTION --- */}
        <View style={[styles.section, { paddingHorizontal: containerPadding }]}>
          <Text style={[styles.sectionSubtitle, { fontSize: 12 * scale }]}>THE PROCESS</Text>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize, lineHeight: sectionTitleSize * 1.25 }]}>
            Budget of One Exhibition.{'\n'}
            <Text style={{ color: COLORS.primary }}>A Year-Long Presence on Google.</Text>
          </Text>
          <Text style={[styles.sectionDescription, { fontSize: bodyTextSize, lineHeight: bodyTextSize * 1.5 }]}>
            No stalls. No travel. No waiting. Just buyers who are actively looking for your product.
          </Text>

          <View style={styles.processCard}>
            <ProcessStep 
              number="01"
              icon="view-grid-outline"
              title="Choose Category"
              desc="Textile, Machinery, Agri, Pharma — run Google Ads specifically for that category."
              scale={scale}
              borderRight
              borderBottom
            />
            <ProcessStep 
              number="02"
              icon="check-decagram-outline"
              title="Top of Google"
              desc="When a buyer searches, your product appears first, like an exhibition stall."
              scale={scale}
              borderBottom
            />
            <ProcessStep 
              number="03"
              icon="map-marker-radius-outline"
              title="Filter by State"
              desc="Pan-India reach or specific states/cities. Connect with target buyers."
              scale={scale}
              borderRight
            />
            <ProcessStep 
              number="04"
              icon="message-draw"
              title="Custom Inquiries"
              desc="Only relevant inquiries. Direct phone & email for maximum conversion."
              scale={scale}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- THE SHIFT (COMPARISON) SECTION --- */}
        <View style={[styles.section, { paddingHorizontal: containerPadding }]}>
          <Text style={[styles.sectionSubtitle, { fontSize: 12 * scale }]}>THE SHIFT</Text>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize, lineHeight: sectionTitleSize * 1.25 }]}>
            Exhibition vs. <Text style={{ color: COLORS.primary }}>Inquiry Bazaar</Text>
          </Text>
          <Text style={[styles.sectionDescription, { fontSize: bodyTextSize, lineHeight: bodyTextSize * 1.5 }]}>
            A one-time event vs. 365 days of visibility. You decide.
          </Text>

          {/* Stacks vertically on mobile, renders side-by-side on tablet */}
          <View style={isTablet ? styles.comparisonContainerTablet : styles.comparisonContainer}>
            {/* The Old Way */}
            <View style={[styles.comparisonCardOld, isTablet && styles.comparisonCardTablet]}>
              <View style={styles.badgeOld}>
                <Feather name="x-circle" size={12 * scale} color="#9CA3AF" />
                <Text style={[styles.badgeTextOld, { fontSize: 11 * scale }]}>THE OLD WAY</Text>
              </View>
              <Text style={[styles.comparisonTitle, { fontSize: 20 * scale, lineHeight: 26 * scale }]}>Exhibition / Trade Fair</Text>
              
              <ComparisonItem icon="close-circle-outline" text="₹1.5L–₹15L for stall + travel + stay" old scale={scale} />
              <ComparisonItem icon="close-circle-outline" text="Only 3–5 days of visibility" old scale={scale} />
              <ComparisonItem icon="close-circle-outline" text="Limited geography — one city, one event" old scale={scale} />
              <ComparisonItem icon="close-circle-outline" text="Walk-in buyers — not everyone is interested" old scale={scale} />
              <ComparisonItem icon="close-circle-outline" text="No data — who visited, what they saw is unknown" old scale={scale} />
            </View>

            {/* The New Way */}
            <View style={[styles.comparisonCardNew, isTablet && styles.comparisonCardTablet]}>
              <View style={styles.badgeNew}>
                <Feather name="check-circle" size={12 * scale} color={COLORS.primary} />
                <Text style={[styles.badgeTextNew, { fontSize: 11 * scale }]}>INQUIRY BAZAAR WAY</Text>
              </View>
              <Text style={[styles.comparisonTitle, { fontSize: 20 * scale, lineHeight: 26 * scale }]}>
                Virtual Stall on Google —{'\n'}
                <Text style={{ color: COLORS.primary }}>365 Days, 24/7</Text>
              </Text>
              
              <ComparisonItem icon="check-circle-outline" text="Full year of Google visibility at a fraction of an exhibition's cost" scale={scale} />
              <ComparisonItem icon="check-circle-outline" text="365 days, 24/7 active — no breaks" scale={scale} />
              <ComparisonItem icon="check-circle-outline" text="Pan-India reach — or specific state/city filter" scale={scale} />
              <ComparisonItem icon="check-circle-outline" text="Only high-intent buyers — who actively search" scale={scale} />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- CTA SECTION --- */}
        <View style={[styles.section, { paddingHorizontal: containerPadding, alignItems: 'center' }]}>
          <Text style={[styles.sectionSubtitleOrange, { fontSize: 12 * scale }]}>READY TO GO DIGITAL?</Text>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize, lineHeight: sectionTitleSize * 1.25, textAlign: 'center' }]}>
            Don't Wait for the{'\n'}
            <Text style={{ color: COLORS.primary }}>Next Exhibition.</Text>
          </Text>
          <Text style={[styles.sectionDescription, { fontSize: bodyTextSize, lineHeight: bodyTextSize * 1.5, textAlign: 'center', marginBottom: 30 * scale }]}>
            Your virtual stall on Google can be live from today. Buyers are searching — are you visible?
          </Text>

          <View style={[styles.actionBtnContainer, isTablet && styles.actionBtnContainerTablet]}>
            <TouchableOpacity 
              style={[styles.primaryBtn, { paddingVertical: 14 * scale }]}
              onPress={() => router.push('/HelpSupport')}
            >
              <Text style={[styles.primaryBtnText, { fontSize: 15 * scale }]}>List My Business Now</Text>
              <Feather name="arrow-right" size={18 * scale} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryBtn, { paddingVertical: 14 * scale }]}
              onPress={() => router.push('/HelpSupport')}
            >
              <Text style={[styles.secondaryBtnText, { fontSize: 15 * scale }]}>Talk to Our Team</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.microCopy, { fontSize: 11 * scale, marginTop: 20 * scale }]}>
            ✦ Free listing available  ·  GST invoice provided  ·  Setup in 24 hours
          </Text>
        </View>

        <View style={styles.divider} />

        {/* --- METRICS & WHY US SECTION --- */}
        <View style={[styles.section, { paddingHorizontal: containerPadding }]}>
          <Text style={[styles.sectionSubtitleOrange, { fontSize: 12 * scale, textAlign: isTablet ? 'left' : 'center' }]}>WHY INQUIRY BAZAAR</Text>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize, lineHeight: sectionTitleSize * 1.25 }]}>
            Numbers That <Text style={{ color: COLORS.primary }}>Convince</Text>
          </Text>

          {/* Renders side-by-side on tablet, stacked on mobile */}
          <View style={isTablet ? styles.whyUsContainerTablet : styles.whyUsContainer}>
            <View style={[styles.metricsBox, isTablet && styles.metricsBoxTablet]}>
              <Text style={[styles.metricsBoxTitle, { fontSize: 11 * scale }]}>LIVE PERFORMANCE METRICS</Text>
              <MetricRow label="Google Search Position" value="#1–3" scale={scale} />
              <MetricRow label="Avg. Inquiries / Month" value="30–200+" scale={scale} />
              <MetricRow label="States Reachable" value="All 28" scale={scale} />
              <MetricRow label="Cost vs. Exhibition" value="80% Less" scale={scale} />
              <MetricRow label="Visibility Duration" value="365 Days" isLast scale={scale} />
            </View>

            <View style={[styles.featuresList, isTablet && styles.featuresListTablet]}>
              <FeatureItem 
                number="01"
                title="Transparency First"
                desc="India's first B2B marketplace where buyers get direct contact of suppliers. No paid unlocks."
                scale={scale}
              />
              <FeatureItem 
                number="02"
                title="Category-Specific Google Ads"
                desc="Not generic ads — targeted Google Ads for your exact product category."
                scale={scale}
              />
              <FeatureItem 
                number="03"
                title="Zero Middleman. Full Control."
                desc="Direct connection with the buyer. Deal directly when an inquiry comes."
                scale={scale}
              />
              <FeatureItem 
                number="04"
                title="MSME-Friendly Pricing"
                desc="Plans suited to your budget — a full year of visibility for the cost of one stall."
                scale={scale}
              />
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- SUB-COMPONENTS ---

interface ProcessStepProps {
  number: string;
  icon: any;
  title: string;
  desc: string;
  scale: number;
  borderRight?: boolean;
  borderBottom?: boolean;
}

const ProcessStep = ({ number, icon, title, desc, scale, borderRight = false, borderBottom = false }: ProcessStepProps) => (
  <View style={[
    styles.processStep, 
    borderRight && { borderRightWidth: 1, borderColor: COLORS.border },
    borderBottom && { borderBottomWidth: 1, borderColor: COLORS.border },
  ]}>
    <Text style={[styles.processNumber, { fontSize: 32 * scale }]}>{number}</Text>
    <View style={[styles.processIconBox, { width: 34 * scale, height: 34 * scale, borderRadius: 6 * scale }]}>
      <MaterialCommunityIcons name={icon} size={18 * scale} color={COLORS.primary} />
    </View>
    <Text style={[styles.processTitle, { fontSize: 14 * scale }]} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
    <Text style={[styles.processDesc, { fontSize: 11.5 * scale, lineHeight: 15 * scale }]}>{desc}</Text>
  </View>
);

interface ComparisonItemProps {
  icon: any;
  text: string;
  old?: boolean;
  scale: number;
}

const ComparisonItem = ({ icon, text, old = false, scale }: ComparisonItemProps) => (
  <View style={styles.comparisonItem}>
    <MaterialCommunityIcons 
      name={icon} 
      size={18 * scale} 
      color={old ? '#9CA3AF' : COLORS.primary} 
      style={styles.comparisonIcon} 
    />
    <Text style={[styles.comparisonText, { fontSize: 14 * scale, lineHeight: 20 * scale }, old && { color: '#D1D5DB' }]}>{text}</Text>
  </View>
);

interface MetricRowProps {
  label: string;
  value: string;
  isLast?: boolean;
  scale: number;
}

const MetricRow = ({ label, value, isLast = false, scale }: MetricRowProps) => (
  <View style={[styles.metricRow, !isLast && styles.metricRowBorder]}>
    <Text style={[styles.metricRowLabel, { fontSize: 14 * scale }]}>{label}</Text>
    <Text style={[styles.metricRowValue, { fontSize: 16 * scale }]}>{value}</Text>
  </View>
);

interface FeatureItemProps {
  number: string;
  title: string;
  desc: string;
  scale: number;
}

const FeatureItem = ({ number, title, desc, scale }: FeatureItemProps) => (
  <View style={styles.featureItem}>
    <Text style={[styles.featureNumber, { fontSize: 28 * scale, marginRight: 12 * scale }]}>{number}</Text>
    <View style={styles.featureContent}>
      <Text style={[styles.featureTitle, { fontSize: 16 * scale }]}>{title}</Text>
      <Text style={[styles.featureDesc, { fontSize: 14 * scale, lineHeight: 20 * scale }]}>{desc}</Text>
    </View>
  </View>
);

// --- STYLES ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 40,
    marginHorizontal: 20,
  },
  
  // Hero
  heroSection: {
    alignItems: 'center',
  },
  heroTitle: {
    fontWeight: '800',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 20,
  },
  taglineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  taglineText: {
    color: '#EAB308',
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  heroDescription: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  actionBtnContainer: {
    width: '100%',
  },
  actionBtnContainerTablet: {
    maxWidth: 420,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  primaryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    marginRight: 8,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    marginBottom: 40,
  },
  secondaryBtnText: {
    color: COLORS.textMain,
    fontWeight: '600',
  },
  
  // Metrics Grid
  heroMetricsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  heroMetric: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricBorder: {
    borderLeftWidth: 1,
    borderColor: COLORS.border,
  },
  heroMetricValue: {
    color: COLORS.primary,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroMetricLabel: {
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  heroMetricFull: {
    alignItems: 'center',
    width: '100%',
  },

  // Generic Sections
  section: {
    width: '100%',
  },
  sectionSubtitle: {
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionSubtitleOrange: {
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 16,
  },
  sectionDescription: {
    color: COLORS.textMuted,
    marginBottom: 32,
  },

  // Process Card
  processCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  processCardTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  processStep: {
    padding: 16,
    width: '50%',
  },
  processStepTablet: {
    width: '50%',
  },
  processStepBorder: {
    // handled dynamically
  },
  processNumber: {
    fontWeight: '900',
    color: COLORS.background, // Creates a cutout/shadow effect
    textShadowColor: COLORS.border,
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
    marginBottom: 12,
  },
  processIconBox: {
    backgroundColor: 'rgba(255, 109, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  processTitle: {
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  processDesc: {
    color: COLORS.textMuted,
  },

  // Comparison
  comparisonContainer: {
    width: '100%',
  },
  comparisonContainerTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  comparisonCardOld: {
    backgroundColor: COLORS.oldWayBg,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    width: '100%',
  },
  comparisonCardNew: {
    backgroundColor: COLORS.newWayBg,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
    width: '100%',
  },
  comparisonCardTablet: {
    width: '48.5%',
    marginBottom: 0,
  },
  badgeOld: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 109, 0, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeTextOld: {
    color: '#9CA3AF',
    fontWeight: '700',
    marginLeft: 6,
  },
  badgeTextNew: {
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 6,
  },
  comparisonTitle: {
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 24,
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  comparisonIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  comparisonText: {
    flex: 1,
    color: COLORS.textMain,
  },

  // Microcopy
  microCopy: {
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Why Us layout
  whyUsContainer: {
    width: '100%',
  },
  whyUsContainerTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  metricsBox: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 40,
    width: '100%',
  },
  metricsBoxTablet: {
    width: '45%',
    marginBottom: 0,
    alignSelf: 'flex-start',
  },
  metricsBoxTitle: {
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackgroundDarker,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  metricRowBorder: {
    // keeping spacing intact
  },
  metricRowLabel: {
    color: COLORS.textMuted,
  },
  metricRowValue: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  // Features List
  featuresList: {
    width: '100%',
  },
  featuresListTablet: {
    width: '50%',
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  featureNumber: {
    fontWeight: '900',
    color: '#4B3F35', // Dark brownish
    lineHeight: 36,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  featureDesc: {
    color: COLORS.textMuted,
  },
});
