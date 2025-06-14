import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Progress } from './progress';
import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';

const FileUpload = ({ jobId, onUploadComplete, userType = 'client', userName = '' }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Use a ref for the file input so we can programmatically clear it
  const fileInputRef = useRef(null);
  // Handle file selection
  const handleFileChange = (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    
    // Get the file from the event
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  // Clear selected file
  const clearFile = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setFile(null);
    setError(null);
    setSuccess(false);
    setProgress(0);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file upload
  const handleUpload = async (e) => {
    if (e) {
      e.preventDefault(); // Prevent form submission
      e.stopPropagation(); // Stop event bubbling
    }
    
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!jobId) {
      setError('No job selected. Please select a job first.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userType', userType);
    formData.append('userName', userName);

    try {
      const response = await axios.post(
        `${API_URL}/api/attachment/upload/${jobId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      setSuccess(true);
      setUploading(false);
      clearFile();
      
      // Call the callback with the uploaded file data
      if (onUploadComplete) {
        onUploadComplete(response.data.data);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      setError(`Upload failed: ${error.response?.data?.message || error.message}`);
      setUploading(false);
    }
  };

  // Handle file input click
  const handleFileInputClick = (e) => {
    e.stopPropagation(); // Stop event propagation to prevent form submission
  };

  // Handle label click
  const handleLabelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Trigger the file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="space-y-4">      {/* File Input */}
      <div className="flex items-center gap-2">
        <div
          onClick={handleLabelClick}
          className={`
            flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed
            rounded-lg cursor-pointer hover:bg-muted/50 transition-colors
            ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          `}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload size={24} className={file ? 'text-primary' : 'text-muted-foreground'} />
            {file ? (
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ) : (
              <div className="text-center">
                <span className="font-medium">Click to upload</span>
                <p className="text-xs text-muted-foreground">
                  SVG, PNG, JPG, or PDF (max. 10MB)
                </p>
              </div>
            )}
          </div>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            onClick={handleFileInputClick}
            ref={fileInputRef}
            accept=".pdf,.png,.jpg,.jpeg,.svg"
            style={{ display: 'none' }}
          />
        </div>

        {file && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearFile}
            disabled={uploading}
          >
            <X size={18} className="text-muted-foreground hover:text-red-600" />
            <span className="sr-only">Clear file</span>
          </Button>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && progress > 0 && (
        <div className="space-y-2">
          <Progress value={progress} />
          <span className="text-xs text-muted-foreground">
            Uploading... {progress}%
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-800 p-2 rounded-md text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 text-green-800 p-2 rounded-md text-sm flex items-center gap-2">
          <Check size={16} />
          <span>File uploaded successfully!</span>
        </div>
      )}      {/* Upload Button */}
      {file && !success && (
        <Button
          type="button"
          disabled={uploading || !file || !jobId}
          onClick={handleUpload}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
      )}
    </div>
  );
};

export default FileUpload;
