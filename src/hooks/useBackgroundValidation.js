import { useState, useEffect, useCallback } from 'react';
import backgroundValidationService from '@/services/BackgroundValidationService';

/**
 * Hook to manage background validation state and provide non-blocking validation
 */
export const useBackgroundValidation = () => {
    const [validationStates, setValidationStates] = useState(new Map());

    // Update validation state
    const updateValidationState = useCallback((type, state) => {
        setValidationStates(prev => new Map(prev.set(type, state)));
    }, []);

    // Queue a validation task
    const queueValidation = useCallback(async (type, validationFn, options = {}) => {
        updateValidationState(type, { isValidating: true, error: null });

        try {
            const result = await backgroundValidationService.queueValidation(type, validationFn, options);
            updateValidationState(type, {
                isValidating: false,
                result,
                error: null,
                lastValidated: Date.now()
            });
            return result;
        } catch (error) {
            updateValidationState(type, {
                isValidating: false,
                result: null,
                error,
                lastValidated: Date.now()
            });
            throw error;
        }
    }, [updateValidationState]);

    // Get validation state for a specific type
    const getValidationState = useCallback((type) => {
        return validationStates.get(type) || {
            isValidating: false,
            result: null,
            error: null,
            lastValidated: null
        };
    }, [validationStates]);

    // Check if validation is recent
    const isValidationRecent = useCallback((type, maxAge = 300000) => {
        return backgroundValidationService.isValidationRecent(type, maxAge);
    }, []);

    // Get cached result
    const getCachedResult = useCallback((type) => {
        return backgroundValidationService.getCachedResult(type);
    }, []);

    // Clear validation cache
    const clearValidationCache = useCallback((type = null) => {
        backgroundValidationService.clearCache(type);
        if (type) {
            setValidationStates(prev => {
                const newMap = new Map(prev);
                newMap.delete(type);
                return newMap;
            });
        } else {
            setValidationStates(new Map());
        }
    }, []);

    return {
        queueValidation,
        getValidationState,
        isValidationRecent,
        getCachedResult,
        clearValidationCache,
        validationStates: Object.fromEntries(validationStates)
    };
};

export default useBackgroundValidation;