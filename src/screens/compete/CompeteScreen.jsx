import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import MobileHeader from '../../components/ui/MobileHeader';

export default function CompeteScreen() {
  const handleCreateTournament = () => {
    console.log('Create tournament pressed');
  };

  return (
    <View style={styles.container}>
      <MobileHeader 
        showLogo={true}
        rightIcon="plus"
        onRightPress={handleCreateTournament}
      />
      <View style={styles.content}>
        <EmptyState
          imageSource={require('../../../assets/empty-state-tournament.png')}
          headline="No tournaments yet"
          body="Create your first tournament or join one from friends"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});