import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastFetchedPage, setLastFetchedPage] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch jobs with lazy loading
  const fetchJobs = async (page, status = 'all', forceRefresh = false) => {
    if (loading && !forceRefresh) return; // Prevent multiple simultaneous fetches unless forced
    setLoading(true);
    try {
      console.log(`Fetching jobs with status: ${status}`);
      const response = await axios.get(API_ENDPOINTS.JOBS.FETCH_ALL, {
        params: { 
          timestamp: new Date().getTime() // Add timestamp to prevent caching
        }
      });
      
      const jobsData = Array.isArray(response.data) ? response.data : response.data.jobs;
      console.log(`Fetched ${jobsData.length} total jobs from API`);

      // Filter jobs by status if not 'all'
      let filteredJobs;
      if (status.toLowerCase() === 'all') {
        filteredJobs = jobsData;
      } else {
        filteredJobs = jobsData.filter(job => {
          const jobStatus = job.status?.toLowerCase() || '';
          const targetStatus = status.toLowerCase();
          return jobStatus === targetStatus;
        });
      }
      
      console.log(`After filtering by "${status}": ${filteredJobs.length} jobs`);
      
      setJobs(filteredJobs);
      setTotalJobs(filteredJobs.length);
      setLastFetchedPage(page);
      setActiveTab(status);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs for a specific client using server-side filtering (optimized for client portal)
  const fetchJobsByClient = async (clientUuid, status = 'all', forceRefresh = false) => {
    if (loading && !forceRefresh) return; // Prevent multiple simultaneous fetches unless forced
    if (!clientUuid) {
      console.error('Client UUID is required for fetchJobsByClient');
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Fetching jobs for client ${clientUuid} with status: ${status}`);
      const response = await axios.get(API_ENDPOINTS.JOBS.FETCH_BY_CLIENT(clientUuid), {
        params: { 
          timestamp: new Date().getTime() // Add timestamp to prevent caching
        }
      });
      
      const jobsData = Array.isArray(response.data) ? response.data : response.data.jobs;
      console.log(`Fetched ${jobsData.length} client-specific jobs from API`);

      // Filter jobs by status if not 'all'
      let filteredJobs;
      if (status.toLowerCase() === 'all') {
        filteredJobs = jobsData;
      } else {
        filteredJobs = jobsData.filter(job => {
          const jobStatus = job.status?.toLowerCase() || '';
          const targetStatus = status.toLowerCase();
          return jobStatus === targetStatus;
        });
      }
      
      console.log(`After filtering by "${status}": ${filteredJobs.length} jobs`);
      
      setJobs(filteredJobs);
      setTotalJobs(filteredJobs.length);
      setLastFetchedPage(1); // Always page 1 for client-specific fetches
      setActiveTab(status);
    } catch (error) {
      console.error('Error fetching client jobs:', error);
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }  };
  // Fetch jobs with role-based filtering
  const fetchJobsByRole = async (userRole, filters = {}, forceRefresh = false) => {
    if (loading && !forceRefresh) return;
    setLoading(true);
    
    try {
      console.log(`Fetching jobs for role: ${userRole} with filters:`, filters);
      
      const params = {
        timestamp: new Date().getTime(),
        ...filters // Include search, status, category_uuid, type filters
      };
      
      const response = await axios.get(API_ENDPOINTS.JOBS.FETCH_BY_ROLE(userRole), { params });
      
      const jobsData = Array.isArray(response.data) ? response.data : response.data.jobs || [];
      console.log(`Fetched ${jobsData.length} role-filtered jobs from API`);
      
      setJobs(jobsData);
      setTotalJobs(jobsData.length);
      setLastFetchedPage(1);
    } catch (error) {
      console.error('Error fetching role-based jobs:', error);
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };
  // Fetch categories available to a specific role
  const fetchCategoriesByRole = async (userRole) => {
    try {
      console.log(`Fetching categories for role: ${userRole}`);
      const response = await axios.get(API_ENDPOINTS.JOBS.FETCH_CATEGORIES_BY_ROLE(userRole), {
        params: { timestamp: new Date().getTime() }
      });
      
      return Array.isArray(response.data) ? response.data : response.data.categories || [];
    } catch (error) {
      console.error('Error fetching role-based categories:', error);
      return [];
    }
  };

  // Reset jobs when tab/status changes
  const resetJobs = () => {
    setJobs([]);
    setLastFetchedPage(0);
  };

  return (
    <JobContext.Provider value={{ 
      jobs, 
      totalJobs, 
      loading, 
      fetchJobs, 
      fetchJobsByClient, 
      fetchJobsByRole,
      fetchCategoriesByRole,
      resetJobs, 
      lastFetchedPage, 
      activeTab, 
      setActiveTab 
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => useContext(JobContext);
