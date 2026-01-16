import { View, StyleSheet, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import TournamentFormNavigator from '../../navigation/TournamentFormNavigator';
import { TournamentFormProvider } from '../../contexts/TournamentFormContext';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/Spacing';

export default function CreateTournamentModal({
  visible,
  onClose,
  onTournamentCreated,
  editMode = false,
  tournament = null
}) {
  const screenHeight = Dimensions.get('window').height;

  console.log('🔧 [MODAL COMPONENT] CreateTournamentModal render', {
    visible,
    editMode,
    hasTournament: !!tournament,
    tournamentId: tournament?.id
  });

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => {}} // Disable backdrop press
      swipeDirection={null} // Disable swipe to dismiss
      style={styles.modal}
      propagateSwipe={false}
      avoidKeyboard={false}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      coverScreen={true}
      useNativeDriver={true}
      statusBarTranslucent={true}
      deviceHeight={screenHeight}
      backdropOpacity={0.5}
    >
      <View style={[styles.container, { height: screenHeight * 0.93 }]}>
        {/* Swipe Handle */}
        <View style={styles.handleContainer}>
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
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.radius6,
    borderTopRightRadius: BorderRadius.radius6,
    paddingTop: Spacing.space2,
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
