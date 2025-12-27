import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';

export default function TermsOfServiceScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeftIcon width={32} height={32} color={Colors.primary300} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Terms of Service</Text>

        {/* Empty view to balance the layout */}
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: December 17, 2025</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using Smash, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our service.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          Smash is a tournament management platform operated by SmashApp. We provide tools and services to help users organize, manage, and participate in tournaments with friends.
        </Text>
        <Text style={styles.paragraph}>
          Important: SmashApp is not a tournament organizer or host. We are a technology platform that enables users to create and manage their own tournaments. We do not organize, host, or oversee tournaments created by our users.
        </Text>

        <Text style={styles.sectionTitle}>3. Age Requirements</Text>
        <Text style={styles.paragraph}>
          You must be at least 13 years of age to use Smash. By using our service, you represent and warrant that you meet this age requirement.
        </Text>

        <Text style={styles.sectionTitle}>4. User Accounts</Text>
        <Text style={styles.paragraph}>
          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
        </Text>

        <Text style={styles.sectionTitle}>5. User Conduct</Text>
        <Text style={styles.paragraph}>You agree to use Smash in accordance with the following guidelines:</Text>
        <Text style={styles.bulletPoint}>• Be respectful and courteous to other users</Text>
        <Text style={styles.bulletPoint}>• Do not engage in cheating or unfair play</Text>
        <Text style={styles.bulletPoint}>• Do not harass, abuse, or threaten other users</Text>
        <Text style={styles.bulletPoint}>• Do not use the service for any illegal purposes</Text>
        <Text style={styles.bulletPoint}>• Do not impersonate others or create fake accounts</Text>
        <Text style={styles.bulletPoint}>• Do not post offensive, inappropriate, or harmful content</Text>

        <Text style={styles.sectionTitle}>6. Tournament Hosting</Text>
        <Text style={styles.paragraph}>
          As a tournament host, you are solely responsible for organizing, managing, and conducting your tournament. SmashApp is not responsible for any disputes, issues, or outcomes related to tournaments created on our platform.
        </Text>

        <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          The Smash service, including its original content, features, and functionality, is owned by SmashApp and is protected by international copyright, trademark, and other intellectual property laws.
        </Text>

        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          SmashApp shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. We provide the service "as is" without warranties of any kind.
        </Text>

        <Text style={styles.sectionTitle}>9. Termination</Text>
        <Text style={styles.paragraph}>
          We reserve the right to terminate or suspend your account at any time, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these terms at any time. We will notify users of any material changes by updating the "Last Updated" date. Your continued use of Smash after changes constitutes acceptance of the new terms.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms of Service, please contact us at info@getsmash.net
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space2,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space8,
  },
  lastUpdated: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body300,
    color: Colors.neutral400,
    marginBottom: Spacing.space6,
  },
  sectionTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
    marginTop: Spacing.space5,
    marginBottom: Spacing.space3,
  },
  paragraph: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body200,
    color: Colors.primary300,
    lineHeight: Typography.body200 * 1.5,
    marginBottom: Spacing.space3,
  },
  bulletPoint: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body200,
    color: Colors.primary300,
    lineHeight: Typography.body200 * 1.5,
    marginBottom: Spacing.space2,
    paddingLeft: Spacing.space3,
  },
});
