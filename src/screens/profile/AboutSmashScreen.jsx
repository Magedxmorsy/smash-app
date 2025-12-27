import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import ChevronLeftIcon from '../../../assets/icons/chevronleft.svg';

export default function AboutSmashScreen({ navigation }) {
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

        <Text style={styles.headerTitle}>About Smash</Text>

        {/* Empty view to balance the layout */}
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.version}>Version 1.0.0</Text>

        <Text style={styles.sectionTitle}>Our Story</Text>
        <Text style={styles.paragraph}>
          Smash was born from a simple idea: competitive gaming with friends should be easy, organized, and fun.
        </Text>
        <Text style={styles.paragraph}>
          It all started during a weekend gaming session among friends. We were trying to organize a tournament, but keeping track of brackets, schedules, and scores turned into a chaotic mess of group chats and spreadsheets. We realized there had to be a better way.
        </Text>
        <Text style={styles.paragraph}>
          That's when we decided to build Smash—a platform designed specifically for friends who want to turn their casual game nights into epic tournaments. No corporate sponsors, no prize pools, just pure competition and bragging rights.
        </Text>

        <Text style={styles.sectionTitle}>What We Believe</Text>
        <Text style={styles.paragraph}>
          We believe that the best competitions happen between friends. Whether it's a fighting game showdown, a sports tournament, or any other head-to-head competition, organizing it shouldn't be harder than actually playing.
        </Text>
        <Text style={styles.paragraph}>
          Smash puts the power of tournament organization in your hands. Create brackets, track scores, schedule matches, and keep everyone in the loop—all in one place. We're not here to host tournaments for you; we're here to give you the tools to be the tournament master your friend group deserves.
        </Text>

        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.paragraph}>
          To make competitive gaming accessible and enjoyable for everyone. We're building tools that help friends create memorable moments, settle debates, and crown champions—one tournament at a time.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.paragraph}>
          Have feedback, suggestions, or just want to say hi? We'd love to hear from you!
        </Text>
        <Text style={styles.paragraph}>
          Email: info@getsmash.net
        </Text>

        <Text style={styles.sectionTitle}>Credits</Text>
        <Text style={styles.paragraph}>
          Made with ❤️ by gamers, for gamers.
        </Text>

        <Text style={styles.copyright}>
          © 2025 SmashApp. All rights reserved.
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
  version: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.neutral400,
    marginBottom: Spacing.space6,
    textAlign: 'center',
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
  copyright: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body300,
    color: Colors.neutral400,
    textAlign: 'center',
    marginTop: Spacing.space6,
  },
});
