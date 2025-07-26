/**
 * Background Form Validation Utility
 * Provides non-blocking form validation that doesn't interrupt user input
 */

class BackgroundFormValidator {
  constructor() {
    this.validationTimers = new Map();
    this.validationResults = new Map();
    this.validationCallbacks = new Map();
  }

  /**
   * Validate field with debouncing to prevent interrupting user typing
   */
  validateField(fieldName, value, validationFn, options = {}) {
    const { 
      debounceMs = 500, 
      onValidation = null,
      immediate = false 
    } = options;

    // Clear existing timer
    if (this.validationTimers.has(fieldName)) {
      clearTimeout(this.validationTimers.get(fieldName));
    }

    // Store callback
    if (onValidation) {
      this.validationCallbacks.set(fieldName, onValidation);
    }

    const runValidation = async () => {
      try {
        const result = await validationFn(value);
        this.validationResults.set(fieldName, {
          isValid: result.isValid,
          error: result.error,
          timestamp: Date.now()
        });

        // Call callback if provided
        const callback = this.validationCallbacks.get(fieldName);
        if (callback) {
          callback(result);
        }

        return result;
      } catch (error) {
        const errorResult = {
          isValid: false,
          error: error.message || 'Validation error',
          timestamp: Date.now()
        };
        
        this.validationResults.set(fieldName, errorResult);
        
        const callback = this.validationCallbacks.get(fieldName);
        if (callback) {
          callback(errorResult);
        }
        
        return errorResult;
      }
    };

    if (immediate) {
      return runValidation();
    } else {
      // Set debounced timer
      const timer = setTimeout(runValidation, debounceMs);
      this.validationTimers.set(fieldName, timer);
    }
  }

  /**
   * Get validation result for a field
   */
  getValidationResult(fieldName) {
    return this.validationResults.get(fieldName) || {
      isValid: true,
      error: null,
      timestamp: null
    };
  }

  /**
   * Check if field is currently being validated
   */
  isValidating(fieldName) {
    return this.validationTimers.has(fieldName);
  }

  /**
   * Clear validation for a field
   */
  clearValidation(fieldName) {
    if (this.validationTimers.has(fieldName)) {
      clearTimeout(this.validationTimers.get(fieldName));
      this.validationTimers.delete(fieldName);
    }
    this.validationResults.delete(fieldName);
    this.validationCallbacks.delete(fieldName);
  }

  /**
   * Clear all validations
   */
  clearAll() {
    this.validationTimers.forEach(timer => clearTimeout(timer));
    this.validationTimers.clear();
    this.validationResults.clear();
    this.validationCallbacks.clear();
  }

  /**
   * Validate entire form without blocking UI
   */
  async validateForm(fields, validationRules) {
    const results = {};
    const validationPromises = [];

    for (const [fieldName, value] of Object.entries(fields)) {
      if (validationRules[fieldName]) {
        const promise = this.validateField(
          fieldName, 
          value, 
          validationRules[fieldName],
          { immediate: true }
        );
        validationPromises.push(promise.then(result => {
          results[fieldName] = result;
        }));
      }
    }

    await Promise.all(validationPromises);
    
    const isFormValid = Object.values(results).every(result => result.isValid);
    
    return {
      isValid: isFormValid,
      fields: results,
      errors: Object.entries(results)
        .filter(([_, result]) => !result.isValid)
        .reduce((acc, [field, result]) => {
          acc[field] = result.error;
          return acc;
        }, {})
    };
  }
}

// Create singleton instance
const backgroundFormValidator = new BackgroundFormValidator();

export default backgroundFormValidator;

/**
 * React hook for background form validation
 */
export const useBackgroundFormValidation = () => {
  const validateField = (fieldName, value, validationFn, options = {}) => {
    return backgroundFormValidator.validateField(fieldName, value, validationFn, options);
  };

  const getValidationResult = (fieldName) => {
    return backgroundFormValidator.getValidationResult(fieldName);
  };

  const isValidating = (fieldName) => {
    return backgroundFormValidator.isValidating(fieldName);
  };

  const clearValidation = (fieldName) => {
    backgroundFormValidator.clearValidation(fieldName);
  };

  const validateForm = (fields, validationRules) => {
    return backgroundFormValidator.validateForm(fields, validationRules);
  };

  return {
    validateField,
    getValidationResult,
    isValidating,
    clearValidation,
    validateForm
  };
};