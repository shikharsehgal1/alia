import { AppRegistry } from 'react-native';
import { ExpoRoot } from 'expo-router';

// Must be exported or Fast Refresh won't update the context
export function App() {
  return <ExpoRoot context={require.context('./app')} />;
}

AppRegistry.registerComponent('main', () => App); 