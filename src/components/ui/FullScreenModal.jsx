import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import CloseIcon from '../../../assets/icons/close.svg';

export default function FullScreenModal({
  visible,
  onClose,
  title,
  children,
  footer,
  rightIcon,
  onRightPress,
  modalStyle,
  overlay, // New prop for overlays like bottom sheets
  leftIcon, // Custom left icon (defaults to CloseIcon)
  scrollViewRef, // Ref for scroll control
}) {
  const screenHeight = Dimensions.get('window').height;
  const insets = useSafeAreaInsets();

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={[styles.modal, modalStyle]}
      propagateSwipe={true}
      avoidKeyboard={false}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={400}
      animationOutTiming={300}
      backdropTransitionInTiming={400}
      backdropTransitionOutTiming={300}
      useNativeDriver={true}
      useNativeDriverForBackdrop={true}
      hasBackdrop={true}
      backdropOpacity={0.4}
      statusBarTranslucent={true}
    >
      <View style={[styles.container, { height: screenHeight * 0.93, paddingTop: title ? insets.top : 0 }]}>
        {/* Swipe Handle - only show if title is provided */}
        {title && (
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
        )}

        {/* Header - only show if title is provided */}
        {title && (
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
              {leftIcon || <CloseIcon width={32} height={32} />}
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            {rightIcon ? (
              <TouchableOpacity onPress={onRightPress} style={styles.headerIcon}>
                {rightIcon}
              </TouchableOpacity>
            ) : (
              <View style={styles.headerIcon} />
            )}
          </View>
        )}

        {/* Body - use ScrollView only if title is provided, otherwise render children directly (for navigators) */}
        {title ? (
          <KeyboardAwareScrollView
            ref={scrollViewRef}
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            enableAutomaticScroll={false}
            extraScrollHeight={0}
            extraHeight={0}
            enableResetScrollToCoords={false}
          >
            {children}
          </KeyboardAwareScrollView>
        ) : (
          <View style={styles.body}>
            {children}
          </View>
        )}

        {/* Footer */}
        {footer && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.space4 }]}>
            {footer}
          </View>
        )}

        {/* Overlay content - renders on top of everything */}
        {overlay}
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
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.space2,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body100,
    color: Colors.primary300,
    lineHeight: 24,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space2,
  },
  footer: {
    padding: Spacing.space4,
    paddingBottom: Spacing.space4 + 20,
    gap: Spacing.space2,
  },
});