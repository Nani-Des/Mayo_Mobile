// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation & Home
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',

  // Connectivity
  'bluetooth': 'bluetooth',
  'wifi': 'wifi',
  'wifi.slash': 'wifi-off',
  'cable.connector': 'usb',

  // Documents & Files
  'doc.text': 'description',
  'doc.text.fill': 'description',
  'square.and.arrow.down': 'download',
  'arrow.down.circle': 'download',

  // Transfer & Sync
  'arrow.triangle.swap': 'swap-horiz',

  // Location & Calendar
  'location': 'place',
  'calendar': 'event',

  // User & Authentication
  'person.circle': 'account-circle',
  'person.crop.rectangle.fill': 'badge',
  'person.fill': 'person',
  'person': 'person',
  'envelope.fill': 'email',
  'lock.fill': 'lock',
  'lock': 'lock',

  // Actions & Status
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'qrcode': 'qr-code-2',
  'info.circle': 'info',
  'arrow.right.circle.fill': 'arrow-circle-right',
  'checkmark.circle.fill': 'check-circle',
} as unknown as IconMapping;

// Default fallback icon for unmapped symbols
const FALLBACK_ICON: ComponentProps<typeof MaterialIcons>['name'] = 'help-outline';

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name];

  // Warn in development if icon is not mapped
  if (__DEV__ && !iconName) {
    console.warn(`IconSymbol: No MaterialIcons mapping found for "${name}". Using fallback icon.`);
  }

  return <MaterialIcons color={color} size={size} name={iconName || FALLBACK_ICON} style={style} />;
}
