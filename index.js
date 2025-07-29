/**
 * @format
 */
import 'react-native-gesture-handler'; // if you use React Navigation
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initializeApp } from '@react-native-firebase/app';

// Initialize Firebase before rendering
initializeApp();

AppRegistry.registerComponent(appName, () => App);
