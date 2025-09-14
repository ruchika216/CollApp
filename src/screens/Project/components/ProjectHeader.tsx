import React from 'react';
import { AppHeader } from '../../../components/common';

export type ProjectHeaderProps = React.ComponentProps<typeof AppHeader>;

const ProjectHeader: React.FC<ProjectHeaderProps> = props => {
  return <AppHeader {...props} />;
};

export default ProjectHeader;
