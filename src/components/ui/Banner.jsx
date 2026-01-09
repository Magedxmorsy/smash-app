import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import SuccessIcon from '../../../assets/icons/success.svg';
import InfoIcon from '../../../assets/icons/infoicon.svg';
import ErrorIcon from '../../../assets/icons/error.svg';
import WarningIcon from '../../../assets/icons/warning.svg';
import CloseIcon from '../../../assets/icons/closeicon.svg';

export default function Banner({
  variant = 'info',
  message,
  onClose,
  dismissible = true
}) {
  const variantConfig = {
    success: {
      backgroundColor: Colors.successLight,
      borderColor: Colors.success,
      Icon: SuccessIcon,
    },
    info: {
      backgroundColor: Colors.infoLight,
      borderColor: Colors.info,
      Icon: InfoIcon,
    },
    error: {
      backgroundColor: Colors.errorLight,
      borderColor: Colors.error,
      Icon: ErrorIcon,
    },
    warning: {
      backgroundColor: Colors.warningLight,
      borderColor: Colors.warning,
      Icon: WarningIcon,
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.Icon;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        }
      ]}
    >
      <View style={styles.iconContainer}>
        <IconComponent width={32} height={32} />
      </View>
      <Text style={styles.message}>
        {message}
      </Text>
      {dismissible && (
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CloseIcon width={24} height={24} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.space3,
    paddingHorizontal: Spacing.space3,
    borderRadius: BorderRadius.radius4,
    borderWidth: 1,
    gap: Spacing.space2,
  },
  iconContainer: {
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    lineHeight: Typography.body200 * 1.5,
    flexWrap: 'wrap',
  },
  closeButton: {
    flexShrink: 0,
  },
});
