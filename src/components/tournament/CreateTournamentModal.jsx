import { Modal, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TournamentFormNavigator from '../../navigation/TournamentFormNavigator';
import { TournamentFormProvider } from '../../contexts/TournamentFormContext';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';

export default function CreateTournamentModal({
  visible,
  onClose,
  onTournamentCreated,
  editMode = false,
  tournament = null
}) {
  console.log('🔧 [MODAL COMPONENT] CreateTournamentModal render', {
    visible,
    editMode,
    hasTournament: !!tournament,
    tournamentId: tournament?.id
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Swipe Handle */}
        <View style={styles.handleContainer} pointerEvents="none">
          <View style={styles.handle} />
        </View>

        <TournamentFormProvider initialData={tournament}>
          <TournamentFormNavigator
            editMode={editMode}
            onSave={onTournamentCreated}
            onClose={onClose}
            tournament={tournament}
          />
        </TournamentFormProvider>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.space2,
    paddingBottom: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
  },
});
