import { useState, useCallback } from 'react';
import { validatePassword, PasswordValidationResult } from '@/utils/validation';

export function usePasswordValidation() {
  const [validationResult, setValidationResult] = useState<PasswordValidationResult>({
    isValid: false,
    errors: [],
  });

  const validatePasswordInput = useCallback((password: string) => {
    const result = validatePassword(password);
    setValidationResult(result);
    return result;
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult({
      isValid: false,
      errors: [],
    });
  }, []);

  return {
    validationResult,
    validatePasswordInput,
    clearValidation,
  };
} 