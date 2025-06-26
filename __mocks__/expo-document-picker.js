module.exports = {
  getDocumentAsync: jest.fn().mockResolvedValue({ canceled: false, assets: [] }),
}; 