import React from 'react';
import Icon, { IconName } from './Icon';

type CustomIconName =
  | 'folder-plus'
  | 'refresh-cw'
  | 'message-circle'
  | 'user-plus'
  | 'paperclip'
  | 'check-circle'
  | 'activity'
  | string; // allow unknowns, fallback below

export interface CustomIconProps {
  name: CustomIconName;
  size?: number;
  color?: string;
  style?: any;
}

// Map common Feather-like names to our local IconName set
const iconMap: Record<string, IconName> = {
  'folder-plus': 'project',
  'refresh-cw': 'status',
  'message-circle': 'comment',
  'user-plus': 'user',
  paperclip: 'file',
  'check-circle': 'check',
  activity: 'status',
};

const CustomIcon: React.FC<CustomIconProps> = ({
  name,
  size = 20,
  color,
  style,
}) => {
  const mapped: IconName = (iconMap[name] as IconName) || 'info';
  return <Icon name={mapped} size={size} tintColor={color} style={style} />;
};

export default CustomIcon;
