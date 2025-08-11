const icons = {
  // Navigation
  home: require('../assets/icons/home.png'),
  notification: require('../assets/icons/notification.png'),
  account: require('../assets/icons/account.png'),
  dashboard: require('../assets/icons/dashboard.png'),
  project: require('../assets/icons/project.png'),
  menu: require('../assets/icons/menu.png'),
  settings: require('../assets/icons/settings.png'),

  // Actions - TODO: Replace with proper icons
  add: require('../assets/icons/dashboard.png'), // TODO: Create add icon
  search: require('../assets/icons/dashboard.png'), // TODO: Create search icon
  edit: require('../assets/icons/settings.png'), // TODO: Create edit icon
  close: require('../assets/icons/notification.png'), // TODO: Create close icon
  back: require('../assets/icons/home.png'), // TODO: Create back icon
  check: require('../assets/icons/dashboard.png'), // TODO: Create check icon

  // Utilities
  status: require('../assets/icons/dashboard.png'),
  comment: require('../assets/icons/notification.png'),
  file: require('../assets/icons/project.png'),
  user: require('../assets/icons/account.png'),
  calendar: require('../assets/icons/dashboard.png'),
  time: require('../assets/icons/dashboard.png'),
  info: require('../assets/icons/notification.png'),
  priority: require('../assets/icons/notification.png'),
  logout: require('../assets/icons/settings.png'),

  // Social
  google: require('../assets/icons/google.png'),
} as const;

export type IconName = keyof typeof icons;
export default icons;
