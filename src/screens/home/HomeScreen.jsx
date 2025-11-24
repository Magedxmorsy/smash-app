import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import MobileHeader from '../../components/ui/MobileHeader';
import CreateTournamentModal from '../../components/tournament/CreateTournamentModal';

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateTournament = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
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

      <CreateTournamentModal 
        visible={modalVisible}
        onClose={handleCloseModal}
      />
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