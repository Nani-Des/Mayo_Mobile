import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface TransferMethodCardProps {
  title: string;
  description: string;
  icon: any;
  onPress: () => void;
  disabled?: boolean;
  gradientColors?: [string, string];
}

export function TransferMethodCard({ 
  title, 
  description, 
  icon, 
  onPress, 
  disabled = false,
  gradientColors = ['#ffffff', '#f0f0f0']
}: TransferMethodCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradientContainer}
      >
        <IconSymbol name={icon} size={28} color="#000" style={styles.icon} />
        <ThemedView style={styles.textContainer}>
          <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.description}>{description}</ThemedText>
        </ThemedView>
        <IconSymbol name="chevron.right" size={20} color="#687076" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.6,
  },
  gradientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
  },
});