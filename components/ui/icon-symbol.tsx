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
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'bluetooth': 'bluetooth',
  'wifi': 'wifi',
  'doc.text': 'description',
  'arrow.triangle.swap': 'swap_horiz',
  'location': 'location_on',
  'calendar': 'calendar_today',
  'heart': 'favorite',
  'heart.fill': 'favorite',
  'wifi.slash': 'wifi_off',
  'cable.connector': 'usb',
  'arrow.down.circle': 'file_download',
  'qrcode': 'qr_code_2',
  'square.and.arrow.down': 'file_download',
  'lock.fill': 'lock',
  'envelope.fill': 'email',
  'person.circle': 'account_circle',
  'info.circle': 'info',
  'person.crop.rectangle.fill': 'credit_card',
  'arrow.right.circle.fill': 'arrow_circle_right',
  'checkmark.circle.fill': 'check_circle',
  'doc.text.fill': 'description',
  'person.fill': 'person',
  'person': 'person',
  'lock': 'lock',
} as unknown as IconMapping;

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
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
