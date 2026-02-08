import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

export default function Player({ firstName, lastName, avatarUri, align = 'left' }) {
  const isRTL = align === 'right';

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      <Avatar
        size="small"
        source={avatarUri}
        name={`${firstName} ${lastName}`}
      />
      <View style={[styles.nameContainer, isRTL && styles.nameContainerRTL]}>
        <Text
          style={[styles.firstName, isRTL && styles.nameRTL]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {firstName}
        </Text>
        <Text
          style={[styles.lastName, isRTL && styles.nameRTL]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {lastName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space2,
  },
  containerRTL: {
    flexDirection: 'row-reverse',
  },
  nameContainer: {
    flexDirection: 'column',
    gap: Spacing.space1,
    marginTop: 4,
  },
  nameContainerRTL: {
    alignItems: 'flex-end',
  },
  firstName: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    lineHeight: Typography.body200,
    maxWidth: 100,
  },
  lastName: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    lineHeight: Typography.body200,
    maxWidth: 100,
  },
  nameRTL: {
    textAlign: 'right',
  },
});
