// Client utility functions for handling UUID-to-name mapping
import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';

// Cache for client names to avoid repeated API calls
const clientNameCache = new Map();
const CLIENT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch client name by UUID from ServiceM8
 * @param {string} uuid - Client UUID
 * @returns {Promise<string>} Client name or fallback
 */
export const getClientNameByUuid = async (uuid) => {
  if (!uuid) {
    return 'Unknown Client';
  }

  // Handle known test UUIDs that don't exist in ServiceM8
  const testUuids = [
    'c8f65b08-532c-4b8f-a1b9-2e4232578f7a', // Known test UUID from user data
  ];
  
  if (testUuids.includes(uuid)) {
    return 'Test Client';
  }

  // Check cache first
  const cacheKey = uuid;
  const cached = clientNameCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CLIENT_CACHE_DURATION) {
    return cached.name;
  }try {
    // Fetch from ServiceM8 via our backend
    const response = await axios.get(`${API_URL}/fetch/clientLogin/${uuid}`);
    
    if (response.data.exists && response.data.client) {
      const clientName = response.data.client.name || 'Unnamed Client';
      
      // Cache the result
      clientNameCache.set(cacheKey, {
        name: clientName,
        timestamp: Date.now()
      });
      
      return clientName;
    }
  } catch (error) {
    // Handle 404 (client not found) as a normal case, not an error
    if (error.response?.status === 404) {
      console.info(`Client ${uuid} not found in ServiceM8 - using fallback name`);
    } else {
      console.warn('Error fetching client name:', error.message);
    }
    
    // Cache the fallback to avoid repeated failed requests
    clientNameCache.set(cacheKey, {
      name: 'Unknown Client',
      timestamp: Date.now()
    });
  }
  
  // Fallback for unknown clients
  return 'Unknown Client';
};

/**
 * Fetch and cache multiple client names
 * @param {string[]} uuids - Array of client UUIDs
 * @returns {Promise<Object>} Map of UUID -> client name
 */
export const getClientNamesByUuids = async (uuids) => {
  const results = {};
  const uncachedUuids = [];
  
  // Check cache for each UUID
  uuids.forEach(uuid => {
    if (!uuid) return;
    
    const cached = clientNameCache.get(uuid);
    if (cached && (Date.now() - cached.timestamp) < CLIENT_CACHE_DURATION) {
      results[uuid] = cached.name;
    } else {
      uncachedUuids.push(uuid);
    }
  });
    // Fetch uncached names
  if (uncachedUuids.length > 0) {    try {
      // Fetch all clients to get names for uncached UUIDs
      const response = await axios.get(`${API_URL}/fetch/clients`);
      const clients = Array.isArray(response.data) ? response.data : (response.data.data || []);
      
      uncachedUuids.forEach(uuid => {
        const client = clients.find(c => c.uuid === uuid);
        const clientName = client?.name || 'Unknown Client';
        
        // Cache the result
        clientNameCache.set(uuid, {
          name: clientName,
          timestamp: Date.now()
        });
        
        results[uuid] = clientName;
      });
    } catch (error) {
      console.error('Error fetching client names:', error);
      
      // Fallback for failed requests
      uncachedUuids.forEach(uuid => {
        results[uuid] = 'Unknown Client';
      });
    }
  }
  
  return results;
};

/**
 * Get welcome message with client name
 * @param {string} clientUuid - Client UUID from localStorage
 * @returns {Promise<string>} Welcome message with client name
 */
export const getWelcomeMessage = async (clientUuid) => {
  if (!clientUuid) {
    return 'Welcome back';
  }
  
  try {
    const clientName = await getClientNameByUuid(clientUuid);
    if (clientName === 'Unknown Client') {
      return 'Welcome back';
    }
    return `Welcome back, ${clientName}`;
  } catch (error) {
    console.error('Error getting welcome message:', error);
    return 'Welcome back';
  }
};

/**
 * Clear client name cache (useful for testing or after client updates)
 */
export const clearClientNameCache = () => {
  clientNameCache.clear();
};

/**
 * Get cached client name without making API call
 * @param {string} uuid - Client UUID
 * @returns {string|null} Cached client name or null if not cached
 */
export const getCachedClientName = (uuid) => {
  if (!uuid) return null;
  
  const cached = clientNameCache.get(uuid);
  if (cached && (Date.now() - cached.timestamp) < CLIENT_CACHE_DURATION) {
    return cached.name;
  }
  
  return null;
};
