import { View, StyleSheet, Modal, Platform } from 'react-native';
import { TournamentFormProvider } from '../../contexts/TournamentFormContext';
import { Colors } from '../../constants/Colors';
import { BorderRadius } from '../../constants/Spacing';
import TournamentFormNavigator from '../../navigation/TournamentFormNavigator';

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
      <View style={styles.modalWrapper}>
        <View style={styles.container}>
          <TournamentFormProvider initialData={tournament}>
            <TournamentFormNavigator
              editMode={editMode}
              onSave={onTournamentCreated}
              onClose={onClose}
              tournament={tournament}
              showHandle={true}
            />
          </TournamentFormProvider>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    ...Platform.select({
      android: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent backdrop
        justifyContent: 'flex-end',
      },
    }),
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    ...Platform.select({
      android: {
        borderTopLeftRadius: BorderRadius.radius6,
        borderTopRightRadius: BorderRadius.radius6,
        overflow: 'hidden',
      },
    }),
  },
});
