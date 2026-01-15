import React from 'react';
import { View, StyleSheet } from 'react-native';
import Player from './Player';
import { Spacing } from '../../constants/Spacing';

export default function Team({ player1, player2, align = 'left' }) {
  // Add defensive checks for missing player data
  if (!player1 || !player2) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Player
        firstName={player1.firstName}
        lastName={player1.lastName}
        avatarUri={player1.avatarUri}
        align={align}
      />
      <Player
        firstName={player2.firstName}
        lastName={player2.lastName}
        avatarUri={player2.avatarUri}
        align={align}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: Spacing.space3, // 12px
  },
});
