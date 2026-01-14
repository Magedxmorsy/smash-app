describe('Welcome Screen E2E Test', () => {
  beforeAll(async () => {
    // Launch the app
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  it('should show welcome screen and tap Get Started button', async () => {
    console.log('🚀 Starting E2E test - Welcome Screen');

    // Wait 2 seconds so you can see the initial screen
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ App launched - you should see the welcome screen');

    // Check if welcome screen is visible
    await expect(element(by.id('welcome-screen'))).toBeVisible();
    console.log('✅ Welcome screen is visible');

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if tagline is visible
    await expect(element(by.id('welcome-tagline'))).toBeVisible();
    console.log('✅ Tagline is visible');

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if Get Started button is visible
    await expect(element(by.id('get-started-button'))).toBeVisible();
    console.log('✅ Get Started button is visible');

    // Wait 2 seconds before tapping
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('👆 About to tap Get Started button...');

    // Tap the Get Started button
    await element(by.id('get-started-button')).tap();
    console.log('✅ Tapped Get Started button');

    // Wait 3 seconds to see the result
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Test completed!');
  });
});
