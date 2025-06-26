module.exports = {
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: false, assets: [] }),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}; 