import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastFetchedPage, setLastFetchedPage] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch jobs with lazy loading
  const fetchJobs = async (page, status = 'all') => {
    if (loading) return; // Prevent multiple simultaneous fetches
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/fetch/jobs');
      const jobsData = Array.isArray(response.data) ? response.data : response.data.jobs;

      // Filter jobs by status if not 'all'
      const filteredJobs = status.toLowerCase() === 'all' 
        ? jobsData 
        : jobsData.filter(job => job.status.toLowerCase() === status.toLowerCase());

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
