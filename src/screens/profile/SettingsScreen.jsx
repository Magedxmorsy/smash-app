import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { useAuth } from '../../contexts/AuthContext';
import CardGroup from '../../components/ui/CardGroup';
import ListItem from '../../components/ui/ListItem';

// Icons
import UserIcon from '../../../assets/icons/user.svg';
import UpdatesIcon from '../../../assets/icons/updates.svg';
import TermsIcon from '../../../assets/icons/terms.svg';
import RulesIcon from '../../../assets/icons/rules.svg';
import InfoIcon from '../../../assets/icons/info.svg';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';

export default function SettingsScreen({ navigation }) {
  const { userData, logOut } = useAuth();

  const handleLogOut = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            const result = await logOut();
            if (result.error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAccount = () => {
    navigation.navigate('AccountSettings');
  };

  const handleNotifications = () => {
    navigation.navigate('NotificationsSettings');
  };

  const handleTerms = () => {
    navigation.navigate('TermsOfService');
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleAbout = () => {
    navigation.navigate('AboutSmash');
  };

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

        <Text style={styles.headerTitle}>Settings</Text>

        {/* Empty view to balance the layout */}
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Settings */}
        <CardGroup>
          <ListItem
            icon={<UserIcon width={24} height={24} />}
            value="Account"
            onPress={handleAccount}
            useChevronRight
          />
          <ListItem
            icon={<UpdatesIcon width={24} height={24} />}
            value="Notifications"
            onPress={handleNotifications}
            useChevronRight
          />
          <ListItem
            icon={<TermsIcon width={24} height={24} />}
            value="Terms of Service"
            onPress={handleTerms}
            useChevronRight
          />
          <ListItem
            icon={<RulesIcon width={24} height={24} />}
            value="Privacy Policy"
            onPress={handlePrivacyPolicy}
            useChevronRight
          />
          <ListItem
            icon={<InfoIcon width={24} height={24} />}
            value="About Smash"
            onPress={handleAbout}
            useChevronRight
          />
        </CardGroup>

        {/* Log Out Button */}
        <View style={styles.logOutContainer}>
          <TouchableOpacity
            style={styles.logOutButton}
            onPress={handleLogOut}
            activeOpacity={0.7}
          >
            <Text style={styles.logOutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
    gap: Spacing.space6,
  },
  logOutContainer: {
    marginTop: Spacing.space4,
  },
  logOutButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.radius4,
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Spacing.buttonHeightLarge,
  },
  logOutButtonText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.button,
    color: Colors.error,
    lineHeight: Typography.button,
  },
  versionText: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body300,
    color: Colors.neutral400,
    textAlign: 'center',
    marginTop: Spacing.space4,
  },
});
