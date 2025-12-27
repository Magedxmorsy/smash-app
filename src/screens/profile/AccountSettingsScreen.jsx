import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { useAuth } from '../../contexts/AuthContext';
import CardGroup from '../../components/ui/CardGroup';
import ListItem from '../../components/ui/ListItem';

// Icons
import EmailIcon from '../../../assets/icons/email.svg';
import LockIcon from '../../../assets/icons/lock.svg';
import InfoIcon from '../../../assets/icons/info.svg';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';

export default function AccountSettingsScreen({ navigation }) {
  const { userData } = useAuth();

  const handleEmailInfo = () => {
    Alert.alert(
      'Change Email',
      'To change your email address, please contact Smash support at info@getsmash.net',
      [{ text: 'OK' }]
    );
  };

  const handleChangePassword = () => {
    // TODO: Navigate to change password screen
    Alert.alert('Change Password', 'This feature is coming soon!');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Delete Account', 'This feature is coming soon!');
          },
        },
      ],
      { cancelable: true }
    );
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

        <Text style={styles.headerTitle}>Account</Text>

        {/* Empty view to balance the layout */}
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Account & Security */}
        <CardGroup>
          <ListItem
            icon={<EmailIcon width={24} height={24} />}
            value={userData?.email}
            showChevron={false}
            rightComponent={
              <TouchableOpacity onPress={handleEmailInfo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <InfoIcon width={24} height={24} />
              </TouchableOpacity>
            }
          />
          <ListItem
            icon={<LockIcon width={24} height={24} />}
            value="Change Password"
            onPress={handleChangePassword}
            useChevronRight
          />
        </CardGroup>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
        </TouchableOpacity>

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
  deleteAccountButton: {
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
  deleteAccountButtonText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.button,
    color: Colors.error,
    lineHeight: Typography.button,
  },
});
