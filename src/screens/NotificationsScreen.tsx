import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Title, Card } from 'react-native-paper';
import { COLORS } from '../constants';

export const NotificationsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Notifications</Title>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              You'll be notified about tournament updates, match reminders, and results here
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyCard: {
    elevation: 1,
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
});
