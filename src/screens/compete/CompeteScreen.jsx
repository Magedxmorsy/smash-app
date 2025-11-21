import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

export default function CompeteScreen() {
  const handleCreateTournament = () => {
    console.log('Create tournament pressed');
    // Navigate to create tournament screen
  };

  return (
    <View style={styles.container}>
      <EmptyState
        headline="No tournaments yet"
        body="Create your first tournament and invite your friends to play!"
        button={
          <Button
            title="Create tournament"
            onPress={handleCreateTournament}
            variant="primary"
            fullWidth={false}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
