import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { FamilyMember } from '@/model/FamilyMember';
import { updateFamilyMember, addFamilyMember } from '@/lib/api/family-api';

interface EditMemberModalProps {
  visible: boolean;
  member: FamilyMember | null;
  familyId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Gender options
const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

// Relationship options
const RELATIONSHIP_OPTIONS = ['Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Grandchild', 'Other'];

// Blood type options
const BLOOD_TYPE_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  visible,
  member,
  familyId,
  onClose,
  onSuccess,
}) => {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const cardColor = useThemeColor({}, 'card');
  const backgroundColor = useThemeColor({}, 'background');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [relationship, setRelationship] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when member changes
  useEffect(() => {
    if (member) {
      setFirstName(member.firstName || '');
      setLastName(member.lastName || '');
      setDateOfBirth(member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '');
      setGender(member.gender || '');
      setRelationship(member.relationship || '');
      setEmail(member.email || '');
      setPhone(member.phone || '');
      setBloodType(member.bloodType || '');
      setMedicalNotes(member.medicalNotes || '');
    } else {
        // Reset for Add Mode
        setFirstName('');
        setLastName('');
        setDateOfBirth('');
        setGender('');
        setRelationship('');
        setEmail('');
        setPhone('');
        setBloodType('');
        setMedicalNotes('');
    }
    setErrors({});
    setError(null);
  }, [member, visible]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setGender('');
      setRelationship('');
      setEmail('');
      setPhone('');
      setBloodType('');
      setMedicalNotes('');
      setErrors({});
      setError(null);
    }
  }, [visible]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateOfBirth)) {
        newErrors.dateOfBirth = 'Invalid date format (use YYYY-MM-DD)';
      }
    }

    if (!relationship.trim()) {
      newErrors.relationship = 'Relationship is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        gender: gender || undefined,
        relationship: relationship.trim(),
        email: email.trim() || undefined,
        phoneNumber: phone.trim() || undefined,
      };

      if (member) {
        await updateFamilyMember(member.familyId, member.id, data);
      } else {
        if (!familyId) {
            throw new Error("No family ID found. Cannot add member.");
        }
        // Add new member
        // Need a default role, creating as MEMBER
        await addFamilyMember(familyId, {
            ...data,
            role: 'MEMBER'
        });
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save family member:', err);
      setError(err?.message || 'Failed to save member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    error?: string,
    options?: {
      placeholder?: string;
      keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
      multiline?: boolean;
      numberOfLines?: number;
    }
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: cardColor, 
            color: textColor,
            borderColor: error ? '#EF4444' : cardColor,
          },
          options?.multiline && styles.multilineInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={options?.placeholder}
        placeholderTextColor={textSecondaryColor}
        keyboardType={options?.keyboardType || 'default'}
        multiline={options?.multiline}
        numberOfLines={options?.numberOfLines || 1}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderOptionSelector = (
    label: string,
    value: string,
    options: string[],
    onSelect: (option: string) => void,
    error?: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              { 
                backgroundColor: value === option ? tintColor : cardColor,
                borderColor: value === option ? tintColor : textSecondaryColor,
              },
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.optionText,
                { color: value === option ? '#FFFFFF' : textColor },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor }]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: cardColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {member ? 'Edit Member' : 'Add Member'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <IconSymbol name="exclamationmark.triangle" size={20} color="#EF4444" />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderInputField(
            'First Name *',
            firstName,
            setFirstName,
            errors.firstName,
            { placeholder: 'Enter first name' }
          )}

          {renderInputField(
            'Last Name *',
            lastName,
            setLastName,
            errors.lastName,
            { placeholder: 'Enter last name' }
          )}

          {renderInputField(
            'Date of Birth *',
            dateOfBirth,
            setDateOfBirth,
            errors.dateOfBirth,
            { placeholder: 'YYYY-MM-DD' }
          )}

          {renderOptionSelector(
            'Gender',
            gender,
            GENDER_OPTIONS,
            setGender
          )}

          {renderInputField(
            'Relationship *',
            relationship,
            setRelationship,
            errors.relationship,
            { placeholder: 'e.g., Spouse, Child, Parent' }
          )}

          {renderInputField(
            'Email',
            email,
            setEmail,
            undefined,
            { 
              placeholder: 'email@example.com',
              keyboardType: 'email-address'
            }
          )}

          {renderInputField(
            'Phone',
            phone,
            setPhone,
            undefined,
            { 
              placeholder: '+1 234 567 8900',
              keyboardType: 'phone-pad'
            }
          )}

          {renderOptionSelector(
            'Blood Type',
            bloodType,
            BLOOD_TYPE_OPTIONS,
            setBloodType
          )}

          {renderInputField(
            'Medical Notes',
            medicalNotes,
            setMedicalNotes,
            undefined,
            { 
              placeholder: 'Any medical conditions, allergies, medications...',
              multiline: true,
              numberOfLines: 4
            }
          )}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: cardColor }]}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            style={styles.footerButton}
            disabled={isLoading}
          />
          <Button
            title="Save Changes"
            onPress={handleSave}
            style={styles.footerButton}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    gap: 8,
  },
  errorBannerText: {
    color: '#EF4444',
    flex: 1,
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
  },
});

export default EditMemberModal;
