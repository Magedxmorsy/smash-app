describe('User Signup Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display welcome screen on first launch', async () => {
    // Wait for welcome screen to load
    await waitFor(element(by.text('Welcome to Smash')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify key elements are present
    await expect(element(by.text('Welcome to Smash'))).toBeVisible();
  });

  it('should navigate to signup when Get Started is tapped', async () => {
    // Tap Get Started button
    await element(by.text('Get Started')).tap();

    // Should navigate to email input screen
    await waitFor(element(by.id('email-input')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should complete signup flow for new user', async () => {
    // Tap Get Started
    await element(by.text('Get Started')).tap();

    // Enter email
    const testEmail = `test${Date.now()}@example.com`;
    await element(by.id('email-input')).typeText(testEmail);
    await element(by.id('email-input')).tapReturnKey();

    // Wait for navigation to signup screen
    await waitFor(element(by.id('display-name-input')))
      .toBeVisible()
      .withTimeout(3000);

    // Enter display name
    await element(by.id('display-name-input')).typeText('Test User');
    await element(by.id('display-name-input')).tapReturnKey();

    // Enter password
    await element(by.id('password-input')).typeText('TestPassword123!');

    // Tap Create Account button
    await element(by.text('Create Account')).tap();

    // Should navigate to email verification screen
    await waitFor(element(by.text('Verify Your Email')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.text('Verify Your Email'))).toBeVisible();
  });

  it('should show password field for existing user', async () => {
    // Tap Get Started
    await element(by.text('Get Started')).tap();

    // Enter existing email
    await element(by.id('email-input')).typeText('existing@example.com');
    await element(by.id('email-input')).tapReturnKey();

    // Wait for password field to appear
    await waitFor(element(by.id('password-input')))
      .toBeVisible()
      .withTimeout(3000);

    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.text('Sign In'))).toBeVisible();
  });
});
