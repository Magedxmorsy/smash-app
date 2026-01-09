import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
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
import { useTournamentForm } from '../contexts/TournamentFormContext';

export default function TournamentFormNavigator({ editMode, onSave, onClose, tournament, showHandle = true }) {
  const [currentPage, setCurrentPage] = useState('main');
  const [pageHistory, setPageHistory] = useState(['main']);

  const navigateToPage = (pageName) => {
    console.log(`🔄 Navigating to ${pageName}`);
    setCurrentPage(pageName);
    setPageHistory([...pageHistory, pageName]);
  };

  const goBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = pageHistory.slice(0, -1);
      setPageHistory(newHistory);
      setCurrentPage(newHistory[newHistory.length - 1]);
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
            onPress={() => goBack()}
            style={styles.headerButton}
          >
            <CheckIcon width={24} height={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>

      {/* Page Content */}
      <View style={styles.pageContainer}>
        {currentPage === 'main' && (
          <MainFormScreen
            onNavigate={navigateToPage}
            editMode={editMode}
            onSave={onSave}
            onClose={onClose}
            tournament={tournament}
          />
        )}
        {currentPage === 'rules' && <RulesFormScreen onNavigate={navigateToPage} />}
        {currentPage === 'courts' && <CourtsFormScreen onNavigate={navigateToPage} editMode={editMode} />}
        {currentPage === 'format' && <FormatFormScreen onNavigate={navigateToPage} />}
      </View>
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
  pageContainer: {
    flex: 1,
  },
});
