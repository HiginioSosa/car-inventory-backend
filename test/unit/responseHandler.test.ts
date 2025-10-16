/**
 * Unit tests for Response Handler utility
 * @module test/unit/responseHandler
 */

import { Response } from 'express';
import { successResponse, errorResponse } from '../../src/utils/responseHandler';

describe('Response Handler Unit Tests', () => {
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    // Create fresh mocks before each test
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    // Make jsonMock return the mockResponse to enable chaining
    jsonMock.mockReturnValue(mockResponse);
  });

  describe('successResponse', () => {
    it('should send success response with data', () => {
      const testData = { id: '123', name: 'Test' };
      const statusCode = 200;
      const message = 'Operation successful';

      successResponse(mockResponse as Response, statusCode, message, testData);

      expect(statusMock).toHaveBeenCalledWith(statusCode);
      expect(jsonMock).toHaveBeenCalledWith({
        status: statusCode,
        message,
        data: testData,
      });
    });

    it('should send success response without data', () => {
      const statusCode = 204;
      const message = 'No content';

      successResponse(mockResponse as Response, statusCode, message);

      expect(statusMock).toHaveBeenCalledWith(statusCode);
      expect(jsonMock).toHaveBeenCalledWith({
        status: statusCode,
        message,
      });
    });

    it('should handle 200 OK status', () => {
      const data = { users: [] };
      successResponse(mockResponse as Response, 200, 'Success', data);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 200,
          message: 'Success',
        })
      );
    });

    it('should handle 201 Created status', () => {
      const data = { id: 'new-id' };
      successResponse(mockResponse as Response, 201, 'Created', data);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 201,
          message: 'Created',
        })
      );
    });

    it('should handle null data', () => {
      successResponse(mockResponse as Response, 200, 'Success', null);

      expect(jsonMock).toHaveBeenCalledWith({
        status: 200,
        message: 'Success',
        data: null,
      });
    });

    it('should handle undefined data (should not include data field)', () => {
      successResponse(mockResponse as Response, 200, 'Success', undefined);

      expect(jsonMock).toHaveBeenCalledWith({
        status: 200,
        message: 'Success',
      });
    });

    it('should handle empty object data', () => {
      const data = {};
      successResponse(mockResponse as Response, 200, 'Success', data);

      expect(jsonMock).toHaveBeenCalledWith({
        status: 200,
        message: 'Success',
        data: {},
      });
    });

    it('should handle array data', () => {
      const data = [1, 2, 3];
      successResponse(mockResponse as Response, 200, 'Success', data);

      expect(jsonMock).toHaveBeenCalledWith({
        status: 200,
        message: 'Success',
        data: [1, 2, 3],
      });
    });

    it('should handle string data', () => {
      const data = 'test string';
      successResponse(mockResponse as Response, 200, 'Success', data);

      expect(jsonMock).toHaveBeenCalledWith({
        status: 200,
        message: 'Success',
        data: 'test string',
      });
    });

    it('should handle number data', () => {
      const data = 42;
      successResponse(mockResponse as Response, 200, 'Success', data);

      expect(jsonMock).toHaveBeenCalledWith({
        status: 200,
        message: 'Success',
        data: 42,
      });
    });

    it('should handle boolean data', () => {
      const data = true;
      successResponse(mockResponse as Response, 200, 'Success', data);

      expect(jsonMock).toHaveBeenCalledWith({
        status: 200,
        message: 'Success',
        data: true,
      });
    });

    it('should handle complex nested data', () => {
      const data = {
        user: {
          id: '123',
          profile: {
            name: 'Test',
            settings: {
              theme: 'dark',
            },
          },
        },
        metadata: {
          timestamp: '2025-01-01',
        },
      };

      successResponse(mockResponse as Response, 200, 'Success', data);

      expect(jsonMock).toHaveBeenCalledWith({
        status: 200,
        message: 'Success',
        data,
      });
    });

    it('should return response object', () => {
      const result = successResponse(mockResponse as Response, 200, 'Success');

      expect(result).toBe(mockResponse);
    });
  });

  describe('errorResponse', () => {
    it('should send error response with all parameters', () => {
      const statusCode = 400;
      const name = 'Bad Request';
      const message = 'Invalid input';
      const customMessage = 'Entrada inválida';

      errorResponse(mockResponse as Response, statusCode, name, message, customMessage);

      expect(statusMock).toHaveBeenCalledWith(statusCode);
      expect(jsonMock).toHaveBeenCalledWith({
        status: statusCode,
        name,
        message,
        customMessage,
      });
    });

    it('should handle 400 Bad Request', () => {
      errorResponse(
        mockResponse as Response,
        400,
        'Bad Request',
        'Invalid data',
        'Datos inválidos'
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          name: 'Bad Request',
        })
      );
    });

    it('should handle 401 Unauthorized', () => {
      errorResponse(
        mockResponse as Response,
        401,
        'Unauthorized',
        'Not authenticated',
        'No autenticado'
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          name: 'Unauthorized',
        })
      );
    });

    it('should handle 403 Forbidden', () => {
      errorResponse(mockResponse as Response, 403, 'Forbidden', 'Access denied', 'Acceso denegado');

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          name: 'Forbidden',
        })
      );
    });

    it('should handle 404 Not Found', () => {
      errorResponse(
        mockResponse as Response,
        404,
        'Not Found',
        'Resource not found',
        'Recurso no encontrado'
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          name: 'Not Found',
        })
      );
    });

    it('should handle 409 Conflict', () => {
      errorResponse(
        mockResponse as Response,
        409,
        'Conflict',
        'Resource already exists',
        'Recurso ya existe'
      );

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 409,
          name: 'Conflict',
        })
      );
    });

    it('should handle 500 Internal Server Error', () => {
      errorResponse(
        mockResponse as Response,
        500,
        'Internal Server Error',
        'Something went wrong',
        'Algo salió mal'
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          name: 'Internal Server Error',
        })
      );
    });

    it('should include both English and Spanish messages', () => {
      const message = 'User not found';
      const customMessage = 'Usuario no encontrado';

      errorResponse(mockResponse as Response, 404, 'Not Found', message, customMessage);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message,
          customMessage,
        })
      );
    });

    it('should handle empty messages', () => {
      errorResponse(mockResponse as Response, 400, 'Bad Request', '', '');

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '',
          customMessage: '',
        })
      );
    });

    it('should handle long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const longCustomMessage = 'B'.repeat(1000);

      errorResponse(mockResponse as Response, 400, 'Bad Request', longMessage, longCustomMessage);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: longMessage,
          customMessage: longCustomMessage,
        })
      );
    });

    it('should handle special characters in messages', () => {
      const message = 'Error: <script>alert("xss")</script>';
      const customMessage = 'Error: ñáéíóú';

      errorResponse(mockResponse as Response, 400, 'Bad Request', message, customMessage);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message,
          customMessage,
        })
      );
    });

    it('should return response object', () => {
      const result = errorResponse(
        mockResponse as Response,
        400,
        'Bad Request',
        'Invalid data',
        'Datos inválidos'
      );

      expect(result).toBe(mockResponse);
    });

    it('should always include all four error properties', () => {
      errorResponse(mockResponse as Response, 404, 'Not Found', 'Not found', 'No encontrado');

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs).toHaveProperty('status');
      expect(callArgs).toHaveProperty('name');
      expect(callArgs).toHaveProperty('message');
      expect(callArgs).toHaveProperty('customMessage');
      expect(Object.keys(callArgs)).toHaveLength(4);
    });
  });

  describe('Response structure validation', () => {
    it('success response should not include error properties', () => {
      successResponse(mockResponse as Response, 200, 'Success', { data: 'test' });

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('name');
      expect(callArgs).not.toHaveProperty('customMessage');
    });

    it('error response should not include data property', () => {
      errorResponse(mockResponse as Response, 400, 'Bad Request', 'Error', 'Error');

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('data');
    });

    it('both responses should include status', () => {
      successResponse(mockResponse as Response, 200, 'Success');
      errorResponse(mockResponse as Response, 400, 'Bad Request', 'Error', 'Error');

      expect(jsonMock.mock.calls[0][0]).toHaveProperty('status', 200);
      expect(jsonMock.mock.calls[1][0]).toHaveProperty('status', 400);
    });

    it('success response should include message', () => {
      successResponse(mockResponse as Response, 200, 'Success message');

      expect(jsonMock.mock.calls[0][0]).toHaveProperty('message', 'Success message');
    });
  });

  describe('Edge cases', () => {
    it('should handle status code 0', () => {
      successResponse(mockResponse as Response, 0, 'Message');

      expect(statusMock).toHaveBeenCalledWith(0);
    });

    it('should handle very large status codes', () => {
      errorResponse(mockResponse as Response, 999, 'Unknown', 'Unknown error', 'Error desconocido');

      expect(statusMock).toHaveBeenCalledWith(999);
    });

    it('should chain properly', () => {
      const chainedResponse = successResponse(mockResponse as Response, 200, 'Success');

      expect(chainedResponse).toBe(mockResponse);
      expect(statusMock).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalled();
    });
  });
});
