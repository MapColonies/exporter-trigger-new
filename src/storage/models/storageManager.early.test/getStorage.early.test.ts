// Unit tests for: getStorage

import { IStorageStatusResponse } from '../../../common/interfaces';
import { getStorageStatus } from '../../../common/utils';
import { StorageManager } from '../storageManager';

// Mocking the dependencies
interface MockLogger {
  debug: jest.Mock;
}

interface MockTracer {}

// jest.mock("../../../src/common/utils", () => ({
//   getStorageStatus: jest.fn(),
// }));

describe('StorageManager.getStorage() getStorage method', () => {
  let mockLogger: MockLogger;
  let mockTracer: MockTracer;
  let storageManager: StorageManager;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
    };

    mockTracer = {};

    storageManager = new StorageManager(mockLogger as any, mockTracer as any);
  });

  describe('Happy Paths', () => {
    it('should return correct storage status when getStorageStatus resolves successfully', async () => {
      // Arrange
      const expectedResponse: IStorageStatusResponse = { free: 100, size: 500 };
      jest.mocked(getStorageStatus).mockResolvedValue(expectedResponse as any as never);

      // Act
      const result = await storageManager.getStorage();

      // Assert
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Edge Cases', () => {
    it('should handle the case when getStorageStatus returns zero values', async () => {
      // Arrange
      const zeroResponse: IStorageStatusResponse = { free: 0, size: 0 };
      jest.mocked(getStorageStatus).mockResolvedValue(zeroResponse as any as never);

      // Act
      const result = await storageManager.getStorage();

      // Assert
      expect(result).toEqual(zeroResponse);
    });

    it('should handle the case when getStorageStatus throws an error', async () => {
      // Arrange
      jest.mocked(getStorageStatus).mockRejectedValue(new Error('Failed to get storage status') as never);

      // Act & Assert
      await expect(storageManager.getStorage()).rejects.toThrow('Failed to get storage status');
    });
  });
});

// End of unit tests for: getStorage
