import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';

export default function PrivacyPolicyScreen({ navigation }) {
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

        <Text style={styles.headerTitle}>Privacy Policy</Text>

        {/* Empty view to balance the layout */}
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: December 17, 2025</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          SmashApp ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Smash mobile application.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect the following types of information:
        </Text>
        <Text style={styles.bulletPoint}>• Email address (for account creation and authentication)</Text>
        <Text style={styles.bulletPoint}>• Name (first and last name)</Text>
        <Text style={styles.bulletPoint}>• Password (encrypted and securely stored)</Text>
        <Text style={styles.bulletPoint}>• Profile picture (optional)</Text>
        <Text style={styles.bulletPoint}>• Tournament data (tournaments you create or join)</Text>
        <Text style={styles.bulletPoint}>• Match details and scores</Text>
        <Text style={styles.bulletPoint}>• Team information</Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>We use your information to:</Text>
        <Text style={styles.bulletPoint}>• Create and manage your account</Text>
        <Text style={styles.bulletPoint}>• Enable tournament creation and participation</Text>
        <Text style={styles.bulletPoint}>• Track match results and tournament progress</Text>
        <Text style={styles.bulletPoint}>• Send notifications about tournaments and matches</Text>
        <Text style={styles.bulletPoint}>• Improve our service and user experience</Text>
        <Text style={styles.bulletPoint}>• Communicate with you about service updates</Text>

        <Text style={styles.sectionTitle}>4. Data Storage</Text>
        <Text style={styles.paragraph}>
          Your data is securely stored using Firebase, a cloud service provided by Google. Firebase employs industry-standard security measures to protect your information.
        </Text>

        <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          We use the following third-party services:
        </Text>
        <Text style={styles.bulletPoint}>• Firebase (Google) - for authentication and data storage</Text>
        <Text style={styles.paragraph}>
          We may use analytics services in the future (such as Google Analytics) to understand how users interact with our app and improve our service.
        </Text>

        <Text style={styles.sectionTitle}>6. Data Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell, trade, or otherwise transfer your personal information to third parties. Your tournament and match data may be visible to other participants in the same tournaments, as this is essential to the functionality of the service.
        </Text>

        <Text style={styles.sectionTitle}>7. Your Rights</Text>
        <Text style={styles.paragraph}>You have the right to:</Text>
        <Text style={styles.bulletPoint}>• Access your personal data</Text>
        <Text style={styles.bulletPoint}>• Request correction of inaccurate data</Text>
        <Text style={styles.bulletPoint}>• Request deletion of your data</Text>
        <Text style={styles.bulletPoint}>• Withdraw consent for data processing</Text>
        <Text style={styles.bulletPoint}>• Export your data</Text>

        <Text style={styles.sectionTitle}>8. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your personal information for as long as your account is active or as needed to provide you services. If you wish to delete your account, you can do so from the Account Settings page, which will permanently remove your data from our systems.
        </Text>

        <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our service is available to users aged 13 and older. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.
        </Text>

        <Text style={styles.sectionTitle}>10. International Data Transfers</Text>
        <Text style={styles.paragraph}>
          Smash is available to users worldwide. Your information may be transferred to and maintained on servers located outside of your country. By using Smash, you consent to the transfer of your information to countries that may have different data protection rules.
        </Text>

        <Text style={styles.sectionTitle}>11. Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
        </Text>

        <Text style={styles.sectionTitle}>12. Changes to Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
        </Text>

        <Text style={styles.sectionTitle}>13. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at info@getsmash.net
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
