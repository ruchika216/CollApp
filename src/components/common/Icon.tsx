import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

export type IconName =
  | 'account'
  | 'dashboard'
  | 'google'
  | 'home'
  | 'menu'
  | 'notification'
  | 'project'
  | 'settings'
  | 'add'
  | 'edit'
  | 'delete'
  | 'back'
  | 'arrow-left'
  | 'left-arrow'
  | 'arrow-right'
  | 'arrow-down'
  | 'arrow-up'
  | 'up-arrow'
  | 'logout'
  | 'search'
  | 'filter'
  | 'calendar'
  | 'file'
  | 'comment'
  | 'status'
  | 'user'
  | 'team'
  | 'priority'
  | 'close'
  | 'check'
  | 'star'
  | 'clock'
  | 'time'
  | 'assign'
  | 'info'
  | 'chat'
  | 'cancel'
  | 'theme'
  | 'help'
  | 'privacy';

const iconSources: Record<IconName, any> = {
  account: require('../../assets/icons/account.png'),
  dashboard: require('../../assets/icons/dashboard.png'),
  google: require('../../assets/icons/google.png'),
  home: require('../../assets/icons/home.png'),
  menu: require('../../assets/icons/menu.png'),
  notification: require('../../assets/icons/notification.png'),
  project: require('../../assets/icons/project.png'),
  settings: require('../../assets/icons/settings.png'),
  chat: require('../../assets/icons/chat.png'),

  // Action icons
  add: require('../../assets/icons/add.png'),
  edit: require('../../assets/icons/edit.png'),
  delete: require('../../assets/icons/delete.png'),
  cancel: require('../../assets/icons/cancel.png'),

  // Navigation icons
  back: require('../../assets/icons/left.png'),
  'arrow-left': require('../../assets/icons/left-arrow.png'),
  'left-arrow': require('../../assets/icons/left-arrow.png'),
  'arrow-right': require('../../assets/icons/left-arrow.png'), // mirror left arrow
  'arrow-down': require('../../assets/icons/down-arrow.png'),
  'arrow-up': require('../../assets/icons/down-arrow.png'), // mirror down arrow
  'up-arrow': require('../../assets/icons/down-arrow.png'), // mirror down arrow

  // Other icons
  logout: require('../../assets/icons/account.png'),
  search: require('../../assets/icons/notification.png'),
  filter: require('../../assets/icons/settings.png'),
  calendar: require('../../assets/icons/dashboard.png'),
  file: require('../../assets/icons/project.png'),
  comment: require('../../assets/icons/chat.png'),
  status: require('../../assets/icons/dashboard.png'),
  user: require('../../assets/icons/account.png'),
  team: require('../../assets/icons/dashboard.png'),
  priority: require('../../assets/icons/settings.png'),
  close: require('../../assets/icons/cancel.png'),
  check: require('../../assets/icons/notification.png'),
  star: require('../../assets/icons/project.png'),
  // clock/time icons use the same placeholder for now
  clock: require('../../assets/icons/dashboard.png'),
  time: require('../../assets/icons/dashboard.png'),
  assign: require('../../assets/icons/account.png'),
  info: require('../../assets/icons/notification.png'),
  theme: require('../../assets/icons/settings.png'),
  help: require('../../assets/icons/notification.png'),
  privacy: require('../../assets/icons/settings.png'),
};

interface IconProps {
  name: IconName;
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  style?: StyleProp<ImageStyle>;
  tintColor?: string;
  color?: string; // Alias for tintColor
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  style,
  tintColor,
  color,
}) => {
  const source = iconSources[name];

  if (!source) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  // Handle size prop - can be number or string
  const getIconSize = (sizeValue: number | string): number => {
    if (typeof sizeValue === 'number') return sizeValue;

    const sizeMap = {
      xs: 12,
      sm: 16,
      md: 20,
      lg: 24,
      xl: 28,
      xxl: 32,
    };

    return sizeMap[sizeValue as keyof typeof sizeMap] || 20;
  };

  const iconSize = getIconSize(size);
  const iconColor = color || tintColor;

  return (
    <Image
      source={source}
      style={[
        {
          width: iconSize,
          height: iconSize,
          tintColor: iconColor,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};

export default Icon;
