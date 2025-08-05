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
  | 'time'
  | 'assign'
  | 'info';

const iconSources: Record<IconName, any> = {
  account: require('../../assets/icons/account.png'),
  dashboard: require('../../assets/icons/dashboard.png'),
  google: require('../../assets/icons/google.png'),
  home: require('../../assets/icons/home.png'),
  menu: require('../../assets/icons/menu.png'),
  notification: require('../../assets/icons/notification.png'),
  project: require('../../assets/icons/project.png'),
  settings: require('../../assets/icons/settings.png'),
  // Using existing icons as placeholders for missing ones
  add: require('../../assets/icons/project.png'),
  edit: require('../../assets/icons/settings.png'),
  delete: require('../../assets/icons/account.png'),
  back: require('../../assets/icons/menu.png'),
  logout: require('../../assets/icons/account.png'),
  search: require('../../assets/icons/notification.png'),
  filter: require('../../assets/icons/settings.png'),
  calendar: require('../../assets/icons/dashboard.png'),
  file: require('../../assets/icons/project.png'),
  comment: require('../../assets/icons/notification.png'),
  status: require('../../assets/icons/dashboard.png'),
  user: require('../../assets/icons/account.png'),
  team: require('../../assets/icons/dashboard.png'),
  priority: require('../../assets/icons/settings.png'),
  close: require('../../assets/icons/menu.png'),
  check: require('../../assets/icons/notification.png'),
  star: require('../../assets/icons/project.png'),
  time: require('../../assets/icons/dashboard.png'),
  assign: require('../../assets/icons/account.png'),
  info: require('../../assets/icons/notification.png'),
};

interface IconProps {
  name: IconName;
  size?: number;
  style?: StyleProp<ImageStyle>;
  tintColor?: string;
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  style, 
  tintColor 
}) => {
  const source = iconSources[name];
  
  if (!source) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <Image
      source={source}
      style={[
        {
          width: size,
          height: size,
          tintColor: tintColor,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};

export default Icon;