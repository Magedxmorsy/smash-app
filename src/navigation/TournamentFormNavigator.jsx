import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import MainFormScreen from '../screens/tournament/MainFormScreen';
import RulesFormScreen from '../screens/tournament/RulesFormScreen';
import CourtsFormScreen from '../screens/tournament/CourtsFormScreen';
import FormatFormScreen from '../screens/tournament/FormatFormScreen';
import ChevronLeftIcon from '../../assets/icons/chevronleft.svg';
import CloseIcon from '../../assets/icons/close.svg';
import CheckIcon from '../../assets/icons/check.svg';

export default function TournamentFormNavigator({ editMode, onSave, onClose, tournament, showHandle = true }) {
  const [currentPage, setCurrentPage] = useState('main');
  const [pageHistory, setPageHistory] = useState(['main']);
  const rulesFormSaveRef = useRef(null);
  const courtsFormSaveRef = useRef(null);
  const formatFormSaveRef = useRef(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;

  const navigateToPage = (pageName, direction = 'forward') => {
    console.log(`🔄 Navigating to ${pageName}`, {
      currentPage,
      pageHistory,
      newHistory: [...pageHistory, pageName],
      direction
    });

    if (direction === 'back') {
      // Use back animation (slide right)
      Animated.timing(slideAnim, {
        toValue: 1, // Slide out to the right
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPage(pageName);
        const newHistory = pageHistory.slice(0, -1);
        setPageHistory(newHistory);

        // Reset position to left (off-screen)
        slideAnim.setValue(-1);

        // Slide previous page in from the left
        Animated.timing(slideAnim, {
          toValue: 0, // Slide to center
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Use forward animation (slide left)
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -1, // Slide current page out to the left
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update the page
        setCurrentPage(pageName);
        setPageHistory([...pageHistory, pageName]);

        // Reset position to right (off-screen)
        slideAnim.setValue(1);

        // Slide new page in from the right
        Animated.timing(slideAnim, {
          toValue: 0, // Slide to center
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const goBack = () => {
    if (pageHistory.length > 1) {
      // Slide current page out to the right
      Animated.timing(slideAnim, {
        toValue: 1, // Slide out to the right
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        const newHistory = pageHistory.slice(0, -1);
        setPageHistory(newHistory);
        setCurrentPage(newHistory[newHistory.length - 1]);

        // Reset position to left (off-screen)
        slideAnim.setValue(-1);

        // Slide previous page in from the left
        Animated.timing(slideAnim, {
          toValue: 0, // Slide to center
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const canGoBack = pageHistory.length > 1;
  const pageTitle =
    currentPage === 'main' ? (editMode ? 'Edit tournament' : 'Create tournament') :
    currentPage === 'rules' ? 'Tournament rules' :
    currentPage === 'format' ? 'Tournament format' :
    currentPage === 'courts' ? (editMode ? 'Edit courts' : 'Add courts') :
    'Add courts';

  return (
    <View style={styles.container}>
      {/* Modal Handle - only show if requested (for navigation-based modals) */}
      {showHandle && (
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
      )}

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            console.log(canGoBack ? '🔙 Back button pressed' : '❌ Close button pressed');
            canGoBack ? goBack() : onClose();
          }}
          style={styles.headerButton}
        >
          {canGoBack ? (
            <ChevronLeftIcon width={24} height={24} />
          ) : (
            <CloseIcon width={32} height={32} />
          )}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pageTitle}</Text>
        {(currentPage === 'rules' || currentPage === 'courts' || currentPage === 'format') ? (
          <TouchableOpacity
            onPress={() => {
              console.log('✅ Checkmark pressed on', currentPage);
              if (currentPage === 'rules' && rulesFormSaveRef.current) {
                rulesFormSaveRef.current();
              } else if (currentPage === 'courts' && courtsFormSaveRef.current) {
                courtsFormSaveRef.current();
              } else if (currentPage === 'format' && formatFormSaveRef.current) {
                formatFormSaveRef.current();
              } else {
                goBack();
              }
            }}
            style={styles.headerButton}
          >
            <CheckIcon width={24} height={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>

      {/* Page Content */}
      <Animated.View
        style={[
          styles.pageContainer,
          {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [-400, 0, 400], // Slide from/to 400px off-screen
                }),
              },
            ],
          },
        ]}
      >
        {(() => {
          console.log('📄 Rendering page:', currentPage);
          return null;
        })()}
        {currentPage === 'main' && (
          <MainFormScreen
            onNavigate={navigateToPage}
            editMode={editMode}
            onSave={onSave}
            onClose={onClose}
            tournament={tournament}
          />
        )}
        {currentPage === 'rules' && <RulesFormScreen onNavigate={navigateToPage} onSave={(fn) => { rulesFormSaveRef.current = fn; }} />}
        {currentPage === 'courts' && <CourtsFormScreen onNavigate={navigateToPage} editMode={editMode} onSave={(fn) => { courtsFormSaveRef.current = fn; }} />}
        {currentPage === 'format' && <FormatFormScreen onNavigate={navigateToPage} onSave={(fn) => { formatFormSaveRef.current = fn; }} />}
      </Animated.View>
    </View>
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
    borderRadius: 2,
    backgroundColor: Colors.neutral300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space2,
    paddingTop: Spacing.space1,
    paddingBottom: Spacing.space2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral200,
  },
  headerTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body100,
    color: Colors.primary300,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerActionText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  headerActionTextDisabled: {
    color: Colors.neutral300,
  },
  pageContainer: {
    flex: 1,
  },
});
