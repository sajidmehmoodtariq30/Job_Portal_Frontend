// src/pages/admin/settings/NotificationsSettings.jsx
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
import { Mail, Bell, MessageSquare, Calendar } from "lucide-react";

const NotificationsSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    reminderNotifications: true,
    quoteAcceptedNotifications: true,
    paymentReceivedNotifications: true,
    jobCompletedNotifications: true,
    appointmentReminders: true
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = () => {
    // Here you would save the settings to your backend
    alert('Notification settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notifications Settings</h1>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Configure how you'd like to receive notifications from the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <Switch 
              id="email-notifications" 
              checked={settings.emailNotifications} 
              onCheckedChange={() => handleToggle('emailNotifications')} 
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="push-notifications" className="text-base font-medium">Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
              </div>
            </div>
            <Switch 
              id="push-notifications" 
              checked={settings.pushNotifications} 
              onCheckedChange={() => handleToggle('pushNotifications')} 
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <MessageSquare className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="sms-notifications" className="text-base font-medium">SMS Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
            </div>
            <Switch 
              id="sms-notifications" 
              checked={settings.smsNotifications} 
              onCheckedChange={() => handleToggle('smsNotifications')} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Select which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label htmlFor="quote-accepted" className="text-base font-medium">Quote Accepted</Label>
              <p className="text-sm text-gray-500">When a client accepts a quote</p>
            </div>
            <Switch 
              id="quote-accepted" 
              checked={settings.quoteAcceptedNotifications} 
              onCheckedChange={() => handleToggle('quoteAcceptedNotifications')} 
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label htmlFor="payment-received" className="text-base font-medium">Payment Received</Label>
              <p className="text-sm text-gray-500">When a payment is received</p>
            </div>
            <Switch 
              id="payment-received" 
              checked={settings.paymentReceivedNotifications} 
              onCheckedChange={() => handleToggle('paymentReceivedNotifications')} 
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label htmlFor="job-completed" className="text-base font-medium">Job Completed</Label>
              <p className="text-sm text-gray-500">When a job is marked as completed</p>
            </div>
            <Switch 
              id="job-completed" 
              checked={settings.jobCompletedNotifications} 
              onCheckedChange={() => handleToggle('jobCompletedNotifications')} 
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="appointment-reminders" className="text-base font-medium">Appointment Reminders</Label>
                <p className="text-sm text-gray-500">Reminders for upcoming appointments</p>
              </div>
            </div>
            <Switch 
              id="appointment-reminders" 
              checked={settings.appointmentReminders} 
              onCheckedChange={() => handleToggle('appointmentReminders')} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsSettings;