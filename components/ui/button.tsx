import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { ThemedText } from '../themed-text';
import { IconSymbol } from './icon-symbol';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    onPress?: () => void;
    title?: string;
    icon?: React.ComponentProps<typeof IconSymbol>['name'];
    variant?: ButtonVariant;
    size?: ButtonSize;
    style?: ViewStyle;
    loading?: boolean;
    disabled?: boolean;
    children?: React.ReactNode;
}

export function Button({
    onPress,
    title,
    icon,
    variant = 'primary',
    size = 'md',
    style,
    loading = false,
    disabled = false,
    children,
}: ButtonProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    // Theme colors
    const primaryColor = useThemeColor({}, 'tint');
    const errorColor = useThemeColor({}, 'error');
    const textColor = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');

    const handlePressIn = () => {
        if (disabled || loading) return;
        scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
        opacity.value = withTiming(0.8, { duration: 100 });
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handlePressOut = () => {
        if (disabled || loading) return;
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
        opacity.value = withTiming(1, { duration: 100 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const getBackgroundColor = () => {
        if (disabled) return Colors.light.tabIconDefault; // Disabled gray
        switch (variant) {
            case 'primary': return primaryColor;
            case 'secondary': return cardColor; // White/Dark surface
            case 'danger': return errorColor;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return primaryColor;
        }
    };

    const getTextColor = () => {
        if (disabled) return '#FFFFFF';
        switch (variant) {
            case 'primary': return '#FFFFFF';
            case 'secondary': return textColor;
            case 'danger': return '#FFFFFF';
            case 'outline': return primaryColor;
            case 'ghost': return primaryColor;
            default: return '#FFFFFF';
        }
    };

    const containerStyles = [
        styles.base,
        styles[size],
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && { borderWidth: 2, borderColor: primaryColor }, // Thicker border for premium feel
        disabled && styles.disabled,
        style,
    ];

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                style={containerStyles}
            >
                {loading ? (
                    <ActivityIndicator color={getTextColor()} />
                ) : (
                    <>
                        {icon && (
                            <IconSymbol
                                name={icon}
                                size={size === 'sm' ? 16 : 24}
                                color={getTextColor()}
                                style={title ? styles.iconRight : undefined}
                            />
                        )}
                        {title ? (
                            <ThemedText
                                type="defaultSemiBold"
                                style={{ color: getTextColor(), fontSize: size === 'lg' ? 18 : 16 }}
                            >
                                {title}
                            </ThemedText>
                        ) : children}
                    </>
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16, // Modern rounded corners
    },
    sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        height: 36,
    },
    md: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        height: 52,
    },
    lg: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        height: 64,
    },
    disabled: {
        opacity: 0.6,
    },
    iconRight: {
        marginRight: 8,
    },
});
