import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

export default function RescheduleConfirmationDialog({
  visible,
  onConfirm,
  onCancel,
  changesDescription = 'tournament details',
}) {
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (visible && !hasShownRef.current) {
      hasShownRef.current = true;

      Alert.alert(
        'Reschedule matches?',
        `Changing ${changesDescription} will reschedule all tournament matches. Match times and court assignments will be updated based on your changes.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              hasShownRef.current = false;
              onCancel();
            },
          },
          {
            text: 'Confirm',
            style: 'default',
            onPress: () => {
              hasShownRef.current = false;
              onConfirm();
            },
          },
        ],
        { cancelable: false }
      );
    } else if (!visible) {
      hasShownRef.current = false;
    }
  }, [visible, changesDescription, onConfirm, onCancel]);

  return null;
}
