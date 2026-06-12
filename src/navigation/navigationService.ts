import { navigationRef } from './appNav';

export function navigate(name: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name);
  }
}
