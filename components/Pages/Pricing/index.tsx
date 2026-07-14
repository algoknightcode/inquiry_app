import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { StorageAccessFramework } from 'expo-file-system/legacy';

// The complete dataset extracted from the pricing table images
const featuresData = [
  // --- LISTING & VISIBILITY ---
  { isSection: true, title: 'LISTING & VISIBILITY' },
  { feature: 'Product categories', starter: '2 categories', growth: '5 categories', pro: '15 categories', elite: 'All categories' },
  { feature: 'Catalog / Website', starter: 'Static', growth: 'Dynamic (Own Website)', pro: 'Dynamic Customised (Own Website)', elite: 'Fully Customised (Own Website)' },
  { feature: 'Product listings', starter: 'Up to 12', growth: 'Up to 50', pro: 'Up to 150', elite: 'Up to 400' },
  { feature: 'Direct phone visible', starter: 'YES', growth: 'YES', pro: 'YES', elite: 'YES' },
  { feature: 'Direct email visible', starter: 'YES', growth: 'YES', pro: 'YES', elite: 'YES' },
  { feature: 'Supplier profile page', starter: 'Standard', growth: 'Enhanced', pro: 'Premium + badge', elite: 'Premium + Badge + video' },
  { feature: 'Trust badge', starter: '-', growth: '-', pro: 'YES', elite: 'YES' },
  { feature: 'Video profile', starter: '-', growth: '-', pro: 'YES', elite: 'YES' },
  { feature: 'Homepage banner', starter: '-', growth: 'YES', pro: 'YES', elite: 'YES' },
  { feature: 'Search result position', starter: 'Standard', growth: 'Featured in category', pro: 'Top featured', elite: 'Homepage + #1 search' },

  // --- INQUIRIES & LEADS ---
  { isSection: true, title: 'INQUIRIES & LEADS' },
  { feature: 'Buyer inquiries / month', starter: 'Up to 50', growth: 'Up to 100', pro: 'Up to 150', elite: 'Unlimited + filtered' },
  { feature: 'WhatsApp alerts', starter: 'YES', growth: 'YES', pro: 'YES', elite: 'YES' },
  { feature: 'SMS alerts', starter: '-', growth: '-', pro: '-', elite: 'YES' },
  { feature: 'Email alerts', starter: 'YES', growth: 'YES', pro: 'YES', elite: 'YES' },
  { feature: 'Lead quality filter', starter: '-', growth: '-', pro: '-', elite: 'YES' },
  { feature: 'Live inquiry dashboard', starter: '-', growth: 'Basic', pro: 'Basic', elite: 'Full analytics' },

  // --- MARKETING & PROMOTION ---
  { isSection: true, title: 'MARKETING & PROMOTION' },
  { feature: 'Social media posts/month', starter: '-', growth: '8 posts', pro: '12 posts + 1 reels', elite: '15 posts + 2 reels' },
  { feature: 'WhatsApp Business link', starter: 'YES', growth: 'YES', pro: 'YES', elite: 'YES' },
  { feature: 'Product catalogue PDF', starter: 'YES', growth: 'YES', pro: 'YES', elite: 'YES' },
  { feature: 'Weekly business report', starter: '-', growth: '-', pro: 'YES', elite: 'YES' },
  { feature: 'Monthly Business report', starter: 'YES', growth: 'YES', pro: 'YES', elite: 'YES' },

  // --- SUPPORT ---
  { isSection: true, title: 'SUPPORT' },
  { feature: 'Onboarding support', starter: 'Yes', growth: 'Yes', pro: 'Priority (within 15 days)', elite: 'Dedicated (10 days)' },
  { feature: 'Account manager', starter: '-', growth: '-', pro: 'YES', elite: 'YES' },
  { feature: 'GST invoice (input credit)', starter: 'YES', growth: 'YES', pro: 'YES', elite: 'YES' },
  { feature: 'Profile photoshoot voucher', starter: '-', growth: '-', pro: '-', elite: '-' },
];

const investment6MonthData = [
  { plan: 'Starter', basePrice: '40,000', gstAmount: '7,200', totalPayable: '47,200', effectiveMonth: '6,667', annualRenewed: '72,000', savings: '8,000', bestFor: 'New suppliers', idealCustomer: 'Small traders, new to digital' },
  { plan: 'Growth', basePrice: '60,000', gstAmount: '10,800', totalPayable: '70,800', effectiveMonth: '10,000', annualRenewed: '94,500', savings: '10,500', bestFor: 'Growing businesses', idealCustomer: 'Active SMEs scaling up' },
  { plan: 'Pro', basePrice: '95,000', gstAmount: '17,100', totalPayable: '1,12,100', effectiveMonth: '15,833', annualRenewed: '1,62,000', savings: '18,000', bestFor: 'Established suppliers', idealCustomer: 'Mid-size manufacturers' },
  { plan: 'Elite', basePrice: '1,40,000', gstAmount: '25,200', totalPayable: '1,65,200', effectiveMonth: '23,333', annualRenewed: '2,34,000', savings: '26,000', bestFor: 'Exporters & top brands', idealCustomer: 'Large exporters, enterprise' },
];

const investment1YearData = [
  { plan: 'Starter', basePrice: '80,000', gstAmount: '14,400', totalPayable: '94,400', effectiveMonth: '6,667', saving2x: '72,000', savingsAnnual: '-8,000', bestFor: 'New suppliers', idealCustomer: 'Small traders, new to digital' },
  { plan: 'Growth', basePrice: '1,05,000', gstAmount: '18,900', totalPayable: '1,23,900', effectiveMonth: '8,750', saving2x: '94,500', savingsAnnual: '-10,500', bestFor: 'Growing businesses', idealCustomer: 'Active SMEs scaling up' },
  { plan: 'Pro', basePrice: '1,80,000', gstAmount: '32,400', totalPayable: '2,12,400', effectiveMonth: '15,000', saving2x: '1,62,000', savingsAnnual: '-18,000', bestFor: 'Established suppliers', idealCustomer: 'Mid-size manufacturers' },
  { plan: 'Elite', basePrice: '2,60,000', gstAmount: '46,800', totalPayable: '3,06,800', effectiveMonth: '21,667', saving2x: '2,34,000', savingsAnnual: '-26,000', bestFor: 'Exporters & top brands', idealCustomer: 'Large exporters, enterprise' },
];

export default function PricingTable() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generatePDF = async () => {
    try {
      setIsGeneratingPdf(true);
      
      let featuresRowsHtml = '';
      featuresData.forEach(item => {
        if (item.isSection) {
          featuresRowsHtml += `
            <tr class="section-row">
              <td colspan="5" class="bold uppercase" style="background-color: #121A2F; color: white;">${item.title}</td>
            </tr>
          `;
        } else {
          featuresRowsHtml += `
            <tr>
              <td class="bold">${item.feature}</td>
              <td class="center">${item.starter}</td>
              <td class="center">${item.growth}</td>
              <td class="center">${item.pro}</td>
              <td class="center">${item.elite}</td>
            </tr>
          `;
        }
      });

      let investment6MonthRowsHtml = '';
      investment6MonthData.forEach(item => {
        investment6MonthRowsHtml += `
          <tr>
            <td class="bold">${item.plan}</td>
            <td class="center">${item.basePrice}</td>
            <td class="center">${item.gstAmount}</td>
            <td class="center">${item.totalPayable}</td>
            <td class="center">${item.effectiveMonth}</td>
            <td class="center">${item.annualRenewed}</td>
            <td class="center">${item.savings}</td>
            <td>${item.bestFor}</td>
            <td>${item.idealCustomer}</td>
          </tr>
        `;
      });

      let investment1YearRowsHtml = '';
      investment1YearData.forEach(item => {
        investment1YearRowsHtml += `
          <tr>
            <td class="bold">${item.plan}</td>
            <td class="center">${item.basePrice}</td>
            <td class="center">${item.gstAmount}</td>
            <td class="center">${item.totalPayable}</td>
            <td class="center">${item.effectiveMonth}</td>
            <td class="center">${item.saving2x}</td>
            <td class="center">${item.savingsAnnual}</td>
            <td>${item.bestFor}</td>
            <td>${item.idealCustomer}</td>
          </tr>
        `;
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Pricing & Packages</title>
            <style>
              body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #1A202C;
                background-color: #FFFFFF;
              }
              .header {
                background-color: #121A2F;
                color: #FFFFFF;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 18px;
                font-weight: bold;
              }
              .header p {
                margin: 5px 0 0 0;
                color: #A0AEC0;
                font-size: 11px;
              }
              .section-title {
                background-color: #121A2F;
                color: #FFFFFF;
                padding: 8px 12px;
                font-size: 13px;
                font-weight: bold;
                border-radius: 6px;
                margin-top: 25px;
                margin-bottom: 8px;
                text-align: center;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 10px;
              }
              th {
                background-color: #121A2F;
                color: #FFFFFF;
                font-weight: bold;
                padding: 8px;
                border: 1px solid #E2E8F0;
                text-align: left;
              }
              .investment-th {
                background-color: #EF4444;
              }
              td {
                padding: 8px;
                border: 1px solid #E2E8F0;
                vertical-align: middle;
              }
              tr:nth-child(even) {
                background-color: #F8F9FA;
              }
              .section-row {
                background-color: #121A2F !important;
              }
              .bold {
                font-weight: bold;
              }
              .center {
                text-align: center;
              }
              .uppercase {
                text-transform: uppercase;
              }
              .footer-note {
                font-size: 9px;
                color: #718096;
                font-style: italic;
                margin-top: 10px;
              }
              .page-break {
                page-break-before: always;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Subscription Module Packages</h1>
              <p>Pricing & Features (All prices exclusive of GST @ 18%)</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 28%;">Feature / Plan</th>
                  <th class="center" style="width: 18%;">Starter</th>
                  <th class="center" style="width: 18%;">Growth</th>
                  <th class="center" style="width: 18%;">Pro</th>
                  <th class="center" style="width: 18%;">Elite</th>
                </tr>
              </thead>
              <tbody>
                ${featuresRowsHtml}
              </tbody>
            </table>
            
            <div class="page-break"></div>
            
            <div class="header">
              <h1>Business Investment Plans with GST Breakdown</h1>
              <p>GST Rate: 18% | Input Tax Credit available for all registered MSME buyers</p>
            </div>
            
            <div class="section-title">6-MONTH PLANS</div>
            <table>
              <thead>
                <tr>
                  <th class="investment-th">Plan</th>
                  <th class="investment-th center">Base Price (₹)</th>
                  <th class="investment-th center">GST Amount (18%)</th>
                  <th class="investment-th center">Total Payable (₹)</th>
                  <th class="investment-th center">Effective / Month (₹)</th>
                  <th class="investment-th center">Annual if Renewed (₹)</th>
                  <th class="investment-th center">Savings vs Annual</th>
                  <th class="investment-th">Best For</th>
                  <th class="investment-th">Ideal Customer</th>
                </tr>
              </thead>
              <tbody>
                ${investment6MonthRowsHtml}
              </tbody>
            </table>
            
            <div class="section-title">1-YEAR PLANS (Save up to 10% vs renewing 2x 6-month)</div>
            <table>
              <thead>
                <tr>
                  <th class="investment-th">Plan</th>
                  <th class="investment-th center">Base Price (₹)</th>
                  <th class="investment-th center">GST Amount (18%)</th>
                  <th class="investment-th center">Total Payable (₹)</th>
                  <th class="investment-th center">Effective / Month (₹)</th>
                  <th class="investment-th center">Saving vs 2x 6-month (₹)</th>
                  <th class="investment-th center">Savings vs Annual</th>
                  <th class="investment-th">Best For</th>
                  <th class="investment-th">Ideal Customer</th>
                </tr>
              </thead>
              <tbody>
                ${investment1YearRowsHtml}
              </tbody>
            </table>
            
            <p class="footer-note">* Direct contact (phone + email) visibility is Inquiry Bazaar's core differentiator — included in ALL plans.</p>
            <p class="footer-note">* Annual plan subscribers receive: Priority onboarding within 48 hours + 1 month extended validity (13 months for price of 12).</p>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Rename the file so it has a clean name when shared
      const pdfName = 'Inquiry_Bazaar_Pricing_Plans.pdf';
      const newUri = `${FileSystem.cacheDirectory}${pdfName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newUri
      });

      await Sharing.shareAsync(newUri, { 
        mimeType: 'application/pdf', 
        dialogTitle: 'Save Pricing PDF', 
        UTI: 'com.adobe.pdf' 
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* --- CUSTOM HEADER --- */}
      <View style={styles.customHeader}>
        <Pressable 
          style={{ padding: 8 }}
          hitSlop={12}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </Pressable>
        
        <Text style={styles.customHeaderTitle} numberOfLines={1}>
          Membership Plans
        </Text>
        
        {/* Placeholder to balance the layout */}
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.verticalScroll} showsVerticalScrollIndicator={false}>
        
        {/* Main Title Section */}
        <View style={styles.headerContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[styles.mainTitle, { flex: 1, textAlign: 'left' }]}>Subscription Module Packages</Text>
            <Pressable 
              onPress={generatePDF} 
              disabled={isGeneratingPdf}
              style={({ pressed }) => [
                {
                  backgroundColor: isGeneratingPdf ? '#9CA3AF' : (pressed ? '#DC2626' : '#EF4444'),
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginLeft: 10,
                  shadowColor: '#EF4444',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 5,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  opacity: isGeneratingPdf ? 0.8 : 1,
                }
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {isGeneratingPdf ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', letterSpacing: 0.3 }}>Preparing...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-download" size={16} color="white" style={{ marginRight: 6 }} />
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', letterSpacing: 0.3 }}>Download PDF</Text>
                  </>
                )}
              </View>
            </Pressable>
          </View>
          <Text style={[styles.subTitle, { textAlign: 'left' }]}>Pricing & Features (All prices exclusive of GST @ 18%)</Text>
        </View>

        {/* Horizontal Scroll for the Table Matrix */}
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
          <View style={styles.table}>
            
            {/* Table Header Row */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.headerCell, styles.featureCol]}>
                <Text style={styles.headerText}>FEATURE / PLAN</Text>
              </View>
              <View style={[styles.cell, styles.tierHeaderCell, styles.colStarter]}>
                <Text style={styles.tierTitle}>Starter</Text>
                <Text style={styles.tierSubtitle}>Entry-level visibility</Text>
              </View>
              <View style={[styles.cell, styles.tierHeaderCell, styles.colGrowth]}>
                <Text style={styles.tierTitle}>Growth</Text>
                <Text style={styles.tierSubtitle}>Growth & leads</Text>
              </View>
              <View style={[styles.cell, styles.tierHeaderCell, styles.colPro]}>
                <Text style={styles.tierTitle}>Pro</Text>
                <Text style={styles.tierSubtitle}>Established businesses</Text>
              </View>
              <View style={[styles.cell, styles.tierHeaderCell, styles.colElite]}>
                <Text style={styles.tierTitle}>Elite</Text>
                <Text style={styles.tierSubtitle}>Exporters & top brands</Text>
              </View>
            </View>

            {/* Table Body - Mapping through all extracted text */}
            {featuresData.map((item, index) => {
              // Render Dark Section Headers
              if (item.isSection) {
                return (
                  <View key={index} style={styles.sectionRow}>
                    <Text style={styles.sectionText}>{item.title}</Text>
                  </View>
                );
              }

              // Render Standard Data Rows
              return (
                <View key={index} style={styles.row}>
                  <View style={[styles.cell, styles.featureCol]}>
                    <Text style={styles.cellText}>{item.feature}</Text>
                  </View>
                  <View style={[styles.cell, styles.colStarter]}>
                    <Text style={styles.cellTextCenter}>{item.starter}</Text>
                  </View>
                  <View style={[styles.cell, styles.colGrowth]}>
                    <Text style={styles.cellTextCenter}>{item.growth}</Text>
                  </View>
                  <View style={[styles.cell, styles.colPro]}>
                    <Text style={styles.cellTextCenter}>{item.pro}</Text>
                  </View>
                  <View style={[styles.cell, styles.colElite]}>
                    <Text style={styles.cellTextCenter}>{item.elite}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
        
        {/* Footer Note */}
        <Text style={styles.footerNote}>
          * Direct contact (phone + email) visibility is Inquiry Bazaar's core differentiator — included in ALL plans.
        </Text>

        {/* --- SECOND TABLE: BUSINESS INVESTMENT PLANS WITH GST BREAKDOWN --- */}
        <View style={[styles.headerContainer, { marginTop: 25 }]}>
          <Text style={styles.mainTitle}>Business Investment Plans with GST Breakdown</Text>
          <Text style={styles.subTitle}>GST Rate: 18% | Input Tax Credit available for all registered MSME buyers | Prices in INR (₹)</Text>
        </View>

        {/* 6-Month Plans Table */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitleText}>6-MONTH PLANS</Text>
        </View>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true} style={[styles.horizontalScroll, { marginBottom: 15 }]}>
          <View style={styles.table}>
            {/* Header Row */}
            <View style={styles.row}>
              <View style={[styles.investmentHeaderCell, { width: 90 }]}><Text style={styles.investmentHeaderText}>Plan</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 110 }]}><Text style={styles.investmentHeaderText}>Base Price (₹)</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 120 }]}><Text style={styles.investmentHeaderText}>GST Amount (18%)</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 120 }]}><Text style={styles.investmentHeaderText}>Total Payable (₹)</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 130 }]}><Text style={styles.investmentHeaderText}>Effective / Month (₹)</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 150 }]}><Text style={styles.investmentHeaderText}>Annual if Renewed (₹)</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 130 }]}><Text style={styles.investmentHeaderText}>Savings vs Annual</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 150 }]}><Text style={styles.investmentHeaderText}>Best For</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 180, borderRightWidth: 0 }]}><Text style={styles.investmentHeaderText}>Ideal Customer</Text></View>
            </View>

            {/* Data Rows */}
            {investment6MonthData.map((item, index) => (
              <View key={index} style={styles.row}>
                <View style={[styles.investmentCell, { width: 90, backgroundColor: '#F8F9FA' }]}><Text style={[styles.cellText, { fontWeight: 'bold' }]}>{item.plan}</Text></View>
                <View style={[styles.investmentCell, { width: 110 }]}><Text style={styles.cellTextCenter}>{item.basePrice}</Text></View>
                <View style={[styles.investmentCell, { width: 120 }]}><Text style={styles.cellTextCenter}>{item.gstAmount}</Text></View>
                <View style={[styles.investmentCell, { width: 120 }]}><Text style={styles.cellTextCenter}>{item.totalPayable}</Text></View>
                <View style={[styles.investmentCell, { width: 130 }]}><Text style={styles.cellTextCenter}>{item.effectiveMonth}</Text></View>
                <View style={[styles.investmentCell, { width: 150 }]}><Text style={styles.cellTextCenter}>{item.annualRenewed}</Text></View>
                <View style={[styles.investmentCell, { width: 130 }]}><Text style={styles.cellTextCenter}>{item.savings}</Text></View>
                <View style={[styles.investmentCell, { width: 150 }]}><Text style={styles.cellText}>{item.bestFor}</Text></View>
                <View style={[styles.investmentCell, { width: 180, borderRightWidth: 0 }]}><Text style={styles.cellText}>{item.idealCustomer}</Text></View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 1-Year Plans Table */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitleText}>1-YEAR PLANS (Save up to 10% vs renewing 2x 6-month)</Text>
        </View>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
          <View style={styles.table}>
            {/* Header Row */}
            <View style={styles.row}>
              <View style={[styles.investmentHeaderCell, { width: 90 }]}><Text style={styles.investmentHeaderText}>Plan</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 110 }]}><Text style={styles.investmentHeaderText}>Base Price (₹)</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 120 }]}><Text style={styles.investmentHeaderText}>GST Amount (18%)</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 120 }]}><Text style={styles.investmentHeaderText}>Total Payable (₹)</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 130 }]}><Text style={styles.investmentHeaderText}>Effective / Month (₹)</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 150 }]}><Text style={styles.investmentHeaderText}>Saving vs 2x 6-month (₹)</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 130 }]}><Text style={styles.investmentHeaderText}>Savings vs Annual</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 150 }]}><Text style={styles.investmentHeaderText}>Best For</Text></View>
              <View style={[styles.investmentHeaderCell, { width: 180, borderRightWidth: 0 }]}><Text style={styles.investmentHeaderText}>Ideal Customer</Text></View>
            </View>

            {/* Data Rows */}
            {investment1YearData.map((item, index) => (
              <View key={index} style={styles.row}>
                <View style={[styles.investmentCell, { width: 90, backgroundColor: '#F8F9FA' }]}><Text style={[styles.cellText, { fontWeight: 'bold' }]}>{item.plan}</Text></View>
                <View style={[styles.investmentCell, { width: 110 }]}><Text style={styles.cellTextCenter}>{item.basePrice}</Text></View>
                <View style={[styles.investmentCell, { width: 120 }]}><Text style={styles.cellTextCenter}>{item.gstAmount}</Text></View>
                <View style={[styles.investmentCell, { width: 120 }]}><Text style={styles.cellTextCenter}>{item.totalPayable}</Text></View>
                <View style={[styles.investmentCell, { width: 130 }]}><Text style={styles.cellTextCenter}>{item.effectiveMonth}</Text></View>
                <View style={[styles.investmentCell, { width: 150 }]}><Text style={styles.cellTextCenter}>{item.saving2x}</Text></View>
                <View style={[styles.investmentCell, { width: 130 }]}><Text style={styles.cellTextCenter}>{item.savingsAnnual}</Text></View>
                <View style={[styles.investmentCell, { width: 150 }]}><Text style={styles.cellText}>{item.bestFor}</Text></View>
                <View style={[styles.investmentCell, { width: 180, borderRightWidth: 0 }]}><Text style={styles.cellText}>{item.idealCustomer}</Text></View>
              </View>
            ))}
          </View>
        </ScrollView>

        <Text style={[styles.footerNote, { marginTop: 10, marginBottom: 15 }]}>
          * Annual plan subscribers receive: Priority onboarding within 48 hours + 1 month extended validity (13 months for price of 12).
        </Text>

      </ScrollView>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  customHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  verticalScroll: {
    padding: 10,
  },
  headerContainer: {
    backgroundColor: '#121A2F',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subTitle: {
    color: '#A0AEC0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  horizontalScroll: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  table: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionRow: {
    backgroundColor: '#121A2F',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sectionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  sectionTitleRow: {
    backgroundColor: '#121A2F',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 15,
  },
  sectionTitleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  investmentCell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  headerCell: {
    backgroundColor: '#121A2F',
  },
  investmentHeaderCell: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  tierHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  investmentHeaderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  tierTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1A202C',
    marginBottom: 4,
  },
  tierSubtitle: {
    fontSize: 10,
    color: '#4A5568',
    textAlign: 'center',
  },
  cellText: {
    fontSize: 12,
    color: '#2D3748',
  },
  cellTextCenter: {
    fontSize: 12,
    color: '#2D3748',
    textAlign: 'center',
  },
  footerNote: {
    marginTop: 15,
    fontSize: 11,
    color: '#718096',
    fontStyle: 'italic',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  
  // FIXED WIDTHS FOR HORIZONTAL SCROLLING
  featureCol: {
    width: 160, 
    backgroundColor: '#FFFFFF',
  },
  colStarter: {
    width: 140,
    backgroundColor: '#FFFFFF', 
  },
  colGrowth: {
    width: 140,
    backgroundColor: '#FEF9C3', // Light Yellow to match image
  },
  colPro: {
    width: 140,
    backgroundColor: '#DBEAFE', // Light Blue to match image
  },
  colElite: {
    width: 140,
    backgroundColor: '#F3E8FF', // Light Purple to match image
  },
});