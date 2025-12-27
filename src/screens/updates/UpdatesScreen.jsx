import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import MobileHeader from '../../components/ui/MobileHeader';

export default function UpdatesScreen() {
  // Empty array to show empty state - change to add notifications
  const notifications = [];

  return (
    <View style={styles.container}>
      <MobileHeader
        title="Updates"
        rightIcon={false}
      />

      {notifications.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateContent}>
            <Image
              source={require('../../../assets/noupdates.png')}
              style={styles.emptyStateImage}
            />

            <Text style={styles.emptyStateTitle}>No updates yet</Text>
            <Text style={styles.emptyStateDescription}>
              You'll see notifications about tournaments, matches, and team updates here
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: 60 + Spacing.space4 }]}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((notification) => (
            <View
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.read && styles.notificationUnread,
              ]}
            >
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              {!notification.read && <View style={styles.unreadDot} />}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.space4,
  },
  notificationItem: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing.space4,
    marginBottom: Spacing.space3,
    position: 'relative',
  },
  notificationUnread: {
    backgroundColor: Colors.accent100,
    borderWidth: 1,
    borderColor: Colors.accent300,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.space2,
  },
  notificationTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body100,
    color: Colors.primary300,
    flex: 1,
    marginRight: Spacing.space2,
  },
  notificationTime: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body300,
    color: Colors.neutral400,
  },
  notificationMessage: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.neutral500,
    lineHeight: Typography.body200 * 1.4,
  },
  unreadDot: {
    position: 'absolute',
    top: Spacing.space4,
    right: Spacing.space4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent300,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.space8,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emptyStateImage: {
    width: 214,
    height: 214,
    resizeMode: 'contain',
  },
  emptyStateTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    marginTop: Spacing.space8,
    marginBottom: Spacing.space2,
    textAlign: 'center',
    lineHeight: Typography.headline100 * 1.18,
  },
  emptyStateDescription: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    textAlign: 'center',
    maxWidth: 252,
    lineHeight: Typography.body200 * 1.5,
  },
});
