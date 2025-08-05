const icons = {
  // Navigation icons
  home: require('../assets/icons/home.png'),
  notification: require('../assets/icons/notification.png'),
  account: require('../assets/icons/account.png'),
  dashboard: require('../assets/icons/dashboard.png'),
  project: require('../assets/icons/project.png'),
  menu: require('../assets/icons/menu.png'),
  settings: require('../assets/icons/settings.png'),
  google: require('../assets/icons/google.png'),
  
  // Action icons - using existing icons as fallbacks
  add: require('../assets/icons/dashboard.png'), // fallback
  search: require('../assets/icons/dashboard.png'), // fallback
  edit: require('../assets/icons/settings.png'), // fallback
  close: require('../assets/icons/notification.png'), // fallback
  back: require('../assets/icons/home.png'), // fallback
  check: require('../assets/icons/dashboard.png'), // fallback
  
  // Status and utility icons - using existing icons as fallbacks
  status: require('../assets/icons/dashboard.png'), // fallback
  comment: require('../assets/icons/notification.png'), // fallback
  file: require('../assets/icons/project.png'), // fallback
  user: require('../assets/icons/account.png'), // fallback
  calendar: require('../assets/icons/dashboard.png'), // fallback
  time: require('../assets/icons/dashboard.png'), // fallback
  info: require('../assets/icons/notification.png'), // fallback
  priority: require('../assets/icons/notification.png'), // fallback
  logout: require('../assets/icons/settings.png'), // fallback
};

export default icons;
