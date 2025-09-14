import React from 'react';
import { AppHeader } from '../common';
import type { IconName } from '../common/Icon';

export interface HeaderAction {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  badge?: boolean;
}

export interface TaskListHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightActions?: HeaderAction[];
  backgroundColor?: string;
}

const TaskListHeader: React.FC<TaskListHeaderProps> = ({
  title = 'Tasks',
  subtitle,
  onBack,
  rightActions,
  backgroundColor,
}) => {
  return (
    <AppHeader
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      rightActions={rightActions}
      backgroundColor={backgroundColor}
    />
  );
};

export default TaskListHeader;
