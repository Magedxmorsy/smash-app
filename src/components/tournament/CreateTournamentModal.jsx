import { Modal, View, StyleSheet, Platform } from 'react-native';
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
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.backdrop} />
      <View style={styles.container}>
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
            showHandle={false}
          />
        </TournamentFormProvider>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
  },
});
