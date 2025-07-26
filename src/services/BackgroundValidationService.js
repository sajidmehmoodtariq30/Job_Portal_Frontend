/**
 * Background Validation Service
 * Handles all validation tasks in the background without interrupting user workflow
 */

class BackgroundValidationService {
  constructor() {
    this.validationQueue = [];
    this.isProcessing = false;
    this.validationResults = new Map();
    this.lastValidationTimes = new Map();
    this.minValidationInterval = 300000; // 5 minutes minimum between validations
  }

  /**
   * Add a validation task to the background queue
   */
  queueValidation(validationType, validationFn, options = {}) {
    const now = Date.now();
    const lastValidation = this.lastValidationTimes.get(validationType);
    
    // Skip if validated recently (unless forced)
    if (!options.force && lastValidation && (now - lastValidation) < this.minValidationInterval) {
      console.log(`🔍 Skipping ${validationType} - validated recently`);
      return Promise.resolve(this.validationResults.get(validationType));
    }

    return new Promise((resolve, reject) => {
      this.validationQueue.push({
        type: validationType,
        fn: validationFn,
        options,
        resolve,
        reject,
        timestamp: now
      });

      this.processQueue();
    });
  }

  /**
   * Process validation queue in background
   */
  async processQueue() {
    if (this.isProcessing || this.validationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.validationQueue.length > 0) {
      const task = this.validationQueue.shift();
      
      try {
        console.log(`🔍 Background validation: ${task.type}`);
        const result = await task.fn();
        
        // Store result and timestamp
        this.validationResults.set(task.type, result);
        this.lastValidationTimes.set(task.type, Date.now());
        
        task.resolve(result);
      } catch (error) {
        console.error(`❌ Background validation failed: ${task.type}`, error);
        task.reject(error);
      }

      // Small delay between validations to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.isProcessing = false;
  }

  /**
   * Get cached validation result
   */
  getCachedResult(validationType) {
    return this.validationResults.get(validationType);
  }

  /**
   * Check if validation is recent
   */
  isValidationRecent(validationType, maxAge = this.minValidationInterval) {
    const lastValidation = this.lastValidationTimes.get(validationType);
    return lastValidation && (Date.now() - lastValidation) < maxAge;
  }

  /**
   * Clear cached results
   */
  clearCache(validationType = null) {
    if (validationType) {
      this.validationResults.delete(validationType);
      this.lastValidationTimes.delete(validationType);
    } else {
      this.validationResults.clear();
      this.lastValidationTimes.clear();
    }
  }
}

// Create singleton instance
const backgroundValidationService = new BackgroundValidationService();

export default backgroundValidationService;