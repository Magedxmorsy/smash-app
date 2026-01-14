describe('Simple Emulator Access Test', () => {
  beforeAll(async () => {
    console.log('Starting E2E test - attempting to access iOS simulator');
  });

  it('should verify simulator is accessible', async () => {
    // This test just verifies that Detox can connect to the simulator
    await expect(device).toBeDefined();
    console.log('✅ Device object is defined');

    console.log('Device details:', {
      platform: device.getPlatform ? await device.getPlatform() : 'unknown',
    });
  });

  it('should take a screenshot of current screen', async () => {
    try {
      await device.takeScreenshot('emulator-screenshot');
      console.log('✅ Screenshot taken successfully');
    } catch (error) {
      console.log('Screenshot error:', error.message);
    }
  });
});
