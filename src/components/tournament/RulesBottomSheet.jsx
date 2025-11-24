import React, { useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';

const RulesBottomSheet = forwardRef(({ initialRules, onSave }, ref) => {
  const [visible, setVisible] = useState(false);
  const [rules, setRules] = useState(initialRules || '');
  const slideAnim = useState(new Animated.Value(0))[0];
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    setRules(initialRules || '');
  }, [initialRules]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useImperativeHandle(ref, () => ({
    open: () => {
      console.log('RulesBottomSheet open() called');
      setRules(initialRules || '');
      setVisible(true);
    },
    close: () => {
      console.log('RulesBottomSheet close() called');
      setVisible(false);
    },
  }));

  const handleClose = () => {
    setVisible(false);
  };

  const handleSave = () => {
    Keyboard.dismiss();
    onSave(rules);
    setVisible(false);
  };

  const handleBackdropPress = () => {
    Keyboard.dismiss();
    handleClose();
  };

  if (!visible) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      />
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY }] }
        ]}
      >
        {/* Swipe Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Tournament rules</Text>

        {/* Content - Keyboard Aware Scrollable */}
        <KeyboardAwareScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={120}
          extraHeight={120}
          enableResetScrollToCoords={false}
        >
          <TextArea
            placeholder="Enter custom rules (optional)"
            value={rules}
            onChangeText={setRules}
            numberOfLines={4}
            maxLength={500}
            hint="Add any special rules for your tournament"
          />

          {/* Footer inside scroll to be accessible */}
          <View style={styles.footerInside}>
            <Button
              title="Save rules"
              onPress={handleSave}
              variant="primary"
            />
          </View>
        </KeyboardAwareScrollView>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.radius6,
    borderTopRightRadius: BorderRadius.radius6,
    maxHeight: '85%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.space2,
    paddingBottom: Spacing.space3,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    paddingHorizontal: Spacing.space4,
    marginBottom: Spacing.space3,
    lineHeight: Typography.headline100 * 1.18,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: Spacing.space4,
    paddingBottom: Spacing.space8,
    flexGrow: 1,
  },
  footerInside: {
    marginTop: Spacing.space4,
    paddingBottom: Spacing.space4,
  },
});

export default RulesBottomSheet;