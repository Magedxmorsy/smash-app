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

        <Text style={styles.headerTitle}>About smash</Text>

        {/* Empty view to balance the layout */}
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
    

        <Text style={styles.sectionTitle}>The origin story</Text>
        <Text style={styles.paragraph}>
          Picture this: It's Saturday night. Your crew is ready to settle who's actually the best at Padel.
        </Text>
        <Text style={styles.paragraph}>
          Fast forward 30 minutes: You're drowning in a WhatsApp group chat with 47 unread messages, someone's Excel bracket looks like abstract art, and nobody knows who's playing who or when. Sound familiar?
        </Text>
        <Text style={styles.paragraph}>
          That's when we said "screw it" and built Smash. Because organizing a tournament with friends shouldn't require a PhD in spreadsheets or the patience of a saint.
        </Text>

        <Text style={styles.sectionTitle}>What we're about</Text>
        <Text style={styles.paragraph}>
          Smash isn't for esports pros or wannabe streamers. It's for you and your chaotic friend group who just want to know: who's actually better?
        </Text>
        <Text style={styles.paragraph}>
          We're talking real stakes here. Bragging rights. Eternal glory. That one friend who won't shut up about their win until next year's rematch.
        </Text>
        <Text style={styles.paragraph}>
          No sponsors. No prize pools. No BS. Just you, your friends, and the pure, unfiltered competition that settles arguments and creates legends.
        </Text>

        <Text style={styles.sectionTitle}>The mission (if you want to call it that)</Text>
        <Text style={styles.paragraph}>
          Make tournament organization so stupid-simple that you spend less time managing brackets and more time trash-talking your opponents.
        </Text>
        <Text style={styles.paragraph}>
          Because at the end of the day, the best tournaments are the ones where everyone's having too much fun to care that it's 3 AM and you're still going.
        </Text>

        <Text style={styles.sectionTitle}>Hit us up</Text>
        <Text style={styles.paragraph}>
          Got feedback? Found a bug? Want to tell us your tournament victory story? We're all ears.
        </Text>
        <Text style={styles.paragraph}>
          Email: hello@getsmash.net
        </Text>
        <Text style={styles.paragraph}>
          (We actually read these. No robots. Promise.)
        </Text>

        <Text style={styles.sectionTitle}>The fine print</Text>
        <Text style={styles.paragraph}>
          Crafted with caffeine and questionable decisions in Amsterdam.
        </Text>
<Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.copyright}>
          © 2025 SmashApp. All rights reserved. Now go organize something.
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
