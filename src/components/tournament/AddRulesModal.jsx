import React, { useState } from 'react';
import BottomSheet from '../ui/BottomSheet';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';

export default function AddRulesModal({ visible, onClose, initialRules, onSave }) {
  const [rules, setRules] = useState(initialRules || '');

  const handleSave = () => {
    onSave(rules);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Tournament rules"
      footer={
        <Button
          title="Save rules"
          onPress={handleSave}
          variant="primary"
        />
      }
    >
      <TextArea
        placeholder="Enter custom rules (optional)"
        value={rules}
        onChangeText={setRules}
        numberOfLines={6}
        maxLength={500}
        hint="Add any special rules for your tournament"
      />
    </BottomSheet>
  );
}