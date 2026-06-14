import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

interface Props {
  label: string;
  required?: boolean;
  color?: string;
  optional?: boolean;
}

const FormLabel: React.FC<Props> = ({ label, required, color, optional }) => {
  return (
    <Text style={[styles.label, { color: color || '#1F2937' }]}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
      {optional && <Text style={styles.optionalText}> (Optional)</Text>}
    </Text>
  );
};

export default FormLabel;

const styles = StyleSheet.create({
  label: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    marginBottom: moderateScale(6),
  },
  required: {
    color: '#EF4444',
  },
   optionalText: {
    color: '#9CA3AF',
    fontWeight: '400',
    fontSize: moderateScale(12),
  },
});