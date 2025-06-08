// Create a new file: src/utils/authSetup.js

// Function to initialize Google SDK
export const initGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    // Load the Google SDK
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual client ID
        }).then(() => {
          resolve();
        }).catch(err => {
          reject(err);
        });
      });
    };
    script.onerror = (error) => {
      reject(new Error('Failed to load Google SDK'));
    };
    document.body.appendChild(script);
  });
};

// Function to initialize Facebook SDK
export const initFacebookAuth = () => {
  return new Promise((resolve, reject) => {
    // Load the Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: 'YOUR_FACEBOOK_APP_ID', // Replace with your actual app ID
        cookie: true,
        xfbml: true,
        version: 'v16.0' // Use the latest version
      });
      resolve();
    };
    
    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });
};

// Initialization function to be called when the app starts
export const initializeAuthProviders = async () => {
  try {
    await Promise.all([
      initGoogleAuth(),
      initFacebookAuth()
    ]);
    console.log('Auth providers initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize auth providers:', error);
    return false;
  }
};
