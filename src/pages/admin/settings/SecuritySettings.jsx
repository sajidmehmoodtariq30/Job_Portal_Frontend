// src/pages/admin/settings/SecuritySettings.jsx
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/UI/card";
import { Switch } from "@/components/UI/switch";
import { Label } from "@/components/UI/label";
import { Button } from "@/components/UI/button";
import { Shield, Lock, FileCheck, AlertTriangle, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    virusScan: true,
    fileSizeLimit: true,
    fileTypeRestriction: true,
    autoDeleteOldFiles: false,
    filePassword: false,
    auditLog: true,
    twoFactorAuth: false,
    maxFileSize: '25MB'
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSelectChange = (value) => {
    setSettings(prev => ({
      ...prev,
      maxFileSize: value
    }));
  };

  const handleSave = () => {
    // Here you would save the settings to your backend
    alert('Security settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Security of Files</h1>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Upload Security</CardTitle>
          <CardDescription>
            Configure security measures for file uploads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="virus-scan" className="text-base font-medium">Virus Scanning</Label>
                <p className="text-sm text-gray-500">Automatically scan all uploaded files for viruses</p>
              </div>
            </div>
            <Switch 
              id="virus-scan" 
              checked={settings.virusScan} 
              onCheckedChange={() => handleToggle('virusScan')} 
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Upload className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="file-size-limit" className="text-base font-medium">File Size Limitation</Label>
                <p className="text-sm text-gray-500">Restrict maximum file upload size</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="file-size-limit" 
                checked={settings.fileSizeLimit} 
                onCheckedChange={() => handleToggle('fileSizeLimit')} 
              />
              {settings.fileSizeLimit && (
                <Select 
                  value={settings.maxFileSize} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5MB">5 MB</SelectItem>
                    <SelectItem value="10MB">10 MB</SelectItem>
                    <SelectItem value="25MB">25 MB</SelectItem>
                    <SelectItem value="50MB">50 MB</SelectItem>
                    <SelectItem value="100MB">100 MB</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <FileCheck className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="file-type-restriction" className="text-base font-medium">File Type Restriction</Label>
                <p className="text-sm text-gray-500">Only allow safe file types (PDF, images, etc.)</p>
              </div>
            </div>
            <Switch 
              id="file-type-restriction" 
              checked={settings.fileTypeRestriction} 
              onCheckedChange={() => handleToggle('fileTypeRestriction')} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Access & Storage</CardTitle>
          <CardDescription>
            Configure how files are stored and accessed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="auto-delete" className="text-base font-medium">Auto-Delete Old Files</Label>
                <p className="text-sm text-gray-500">Automatically delete files older than 90 days</p>
              </div>
            </div>
            <Switch 
              id="auto-delete" 
              checked={settings.autoDeleteOldFiles} 
              onCheckedChange={() => handleToggle('autoDeleteOldFiles')} 
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Lock className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="file-password" className="text-base font-medium">File Password Protection</Label>
                <p className="text-sm text-gray-500">Enable password protection for sensitive files</p>
              </div>
            </div>
            <Switch 
              id="file-password" 
              checked={settings.filePassword} 
              onCheckedChange={() => handleToggle('filePassword')} 
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="audit-log" className="text-base font-medium">File Access Audit Log</Label>
                <p className="text-sm text-gray-500">Log all file access and downloads</p>
              </div>
            </div>
            <Switch 
              id="audit-log" 
              checked={settings.auditLog} 
              onCheckedChange={() => handleToggle('auditLog')} 
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Lock className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="two-factor" className="text-base font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Require 2FA for accessing sensitive files</p>
              </div>
            </div>
            <Switch 
              id="two-factor" 
              checked={settings.twoFactorAuth} 
              onCheckedChange={() => handleToggle('twoFactorAuth')} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;