// This might be in App.js or index.js depending on your project structure
import { registerRootComponent } from 'expo';
import App from './App';

// Check for global error handler for uncaught errors
if (!global.ErrorUtils) {
  global.ErrorUtils = {
    setGlobalHandler: function(callback) {
      // Setup error handling
      ErrorUtils.setGlobalHandler(callback);
      console.log("Global error handler set");
    }
  };
}

// Add global error handling
global.ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log("Caught global error:");
  console.log(error);
  console.log("Is fatal:", isFatal);
});

// Register the app
registerRootComponent(App);
