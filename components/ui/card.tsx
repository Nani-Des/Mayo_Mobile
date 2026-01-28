import { useThemeColor } from '@/hooks/use-theme-color';
import { Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { ThemedView } from '../themed-view';

export type CardProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'outlined' | 'elevated' | 'flat';
};

export function Card({ children, style, variant = 'elevated' }: CardProps) {
    const borderColor = useThemeColor({}, 'border');
    const shadowColor = useThemeColor({}, 'icon'); // Use icon color for subtle shadow
    const backgroundColor = useThemeColor({}, 'card');

    return (
        <ThemedView
            style={[
                styles.card,
                { backgroundColor },
                variant === 'elevated' && {
                    shadowColor,
                    ...styles.shadow,
                },
                variant === 'outlined' && {
                    borderWidth: 1,
                    borderColor,
                    backgroundColor: 'transparent',
                },
                variant === 'flat' && {
                    backgroundColor: 'transparent', // Or a subtle surface color
                },
                style,
            ]}
        >
            {children}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden', // Ensures inner content respects border radius
    },
    shadow: Platform.select({
        ios: {
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
        },
        android: {
            elevation: 4,
        },
        default: {
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
        },
    }),
});
