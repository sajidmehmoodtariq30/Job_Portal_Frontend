import React, { useState } from 'react';
import { LifeBuoy, Mail, MessageSquare, MapPin, Phone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';
import logo from '@/assets/logo.png';

const SUPPORT_EMAIL = 'Support@mygcce.com.au';
const SUPPORT_PHONE = '07 5573 2111';
const COMPANY_ADDRESS = 'Gold Coast, Australia';

const ClientSupport = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // Send feedback email to ibitbytesoft@gmail.com
      const response = await axios.post(`${API_URL}/api/support/feedback`, {
        name: form.name,
        email: form.email,
        message: form.message,
        recipient: SUPPORT_EMAIL
      });
      
      if (response.status === 200) {
        setSubmitted(true);
        setForm({ name: '', email: '', message: '' });
      } else {
        setError('There was a problem sending your message. Please try again.');
      }
    } catch (err) {
      console.error('Error sending feedback:', err);
      setError('There was a problem sending your message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <LifeBuoy className="text-blue-600" size={28} />
        <h1 className="text-3xl font-bold">Support</h1>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <img src={logo} alt="Commercial Electricians Australia" className="h-12 w-auto" />
        <div>
          <h2 className="text-xl font-semibold">Commercial Electricians Australia</h2>
          <p className="text-muted-foreground">Your trusted electrical solutions partner</p>
        </div>
      </div>

      <p className="text-muted-foreground mb-6">Need help? Contact our support team or submit a request below. We aim to respond within 1 business day.</p>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Reach us through any of these channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="text-blue-500" size={18} />
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:underline">{SUPPORT_EMAIL}</a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="text-blue-500" size={18} />
              <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`} className="hover:underline">{SUPPORT_PHONE}</a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="text-blue-500" size={18} />
              <span>{COMPANY_ADDRESS}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Request</CardTitle>
          <CardDescription>Fill out the form and our team will get back to you</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="py-8 text-center">
              <MessageSquare className="mx-auto mb-3 text-green-500" size={36} />
              <div className="text-lg font-medium mb-1">Thank you!</div>
              <div className="text-muted-foreground">Your message has been sent. Our support team will contact you soon.</div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} required disabled={submitting} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required disabled={submitting} />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                <Textarea id="message" name="message" rows={5} value={form.message} onChange={handleChange} required disabled={submitting} />
              </div>
              {error && (
                <div className="p-3 text-sm bg-red-50 text-red-700 rounded border border-red-200">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSupport;