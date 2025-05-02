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
    // If jobs for this page are already loaded, do nothing
    if (page <= lastFetchedPage && activeTab === status) return;
    setLoading(true);
    try {
      const limit = page === 1 ? 20 : 10;
      let url = `http://localhost:5000/fetch/jobs?page=${page}&limit=${limit}`;
      if (status !== 'all') {
        url += `&status=${encodeURIComponent(status)}`;
      }
      const response = await axios.get(url);
      if (page === 1 || activeTab !== status) {
        setJobs(response.data.jobs);
      } else {
        setJobs(prev => [...prev, ...response.data.jobs]);
      }
      setTotalJobs(response.data.total);
      setLastFetchedPage(page);
      setActiveTab(status);
    } catch (error) {
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
