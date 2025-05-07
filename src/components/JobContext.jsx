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

  // Reset jobs when tab/status changes
  const resetJobs = () => {
    setJobs([]);
    setLastFetchedPage(0);
  };

  return (
    <JobContext.Provider value={{ jobs, totalJobs, loading, fetchJobs, resetJobs, lastFetchedPage, activeTab, setActiveTab }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => useContext(JobContext);
