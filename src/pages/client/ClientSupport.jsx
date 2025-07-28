import React, { useState, useRef } from 'react';
import { LifeBuoy, Mail, MessageSquare, MapPin, Phone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';
import logo from '@/assets/logo.png';

const SUPPORT_EMAIL = 'assist@gcce.com.au';
const SUPPORT_PHONE = '07 5573 2111';
const COMPANY_ADDRESS = 'Gold Coast, Australia';

// reCAPTCHA site key from environment variables
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test key for development

const ClientSupport = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate reCAPTCHA
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Get client information from localStorage
      const clientData = localStorage.getItem('user_data');
      const clientInfo = clientData ? JSON.parse(clientData) : null;
      const clientId = clientInfo?.assignedClientUuid || clientInfo?.uuid || localStorage.getItem('client_id');
      
      // Send support email to assist@gcce.com.au + all verified client emails in Upstash
      const response = await axios.post(`${API_URL}/api/support/client-feedback`, {
        name: form.name,
        email: form.email,
        message: form.message,
        clientId: clientId,
        clientInfo: clientInfo,
        primaryRecipient: SUPPORT_EMAIL, // assist@gcce.com.au
        recaptchaToken: recaptchaToken // Include reCAPTCHA token for backend verification
      });
      
      if (response.status === 200) {
        setSubmitted(true);
        setForm({ name: '', email: '', message: '' });
        setRecaptchaToken(null);
        // Reset reCAPTCHA
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      } else {
        setError('There was a problem sending your message. Please try again.');
      }
    } catch (err) {
      console.error('Error sending feedback:', err);
      if (err.response?.status === 400 && err.response?.data?.error?.includes('reCAPTCHA')) {
        setError('reCAPTCHA verification failed. Please try again.');
        // Reset reCAPTCHA on verification failure
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setRecaptchaToken(null);
      } else {
        setError('There was a problem sending your message. Please try again later.');
      }
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

      <p className="text-muted-foreground mb-6">Need help? Submit a request below. We aim to respond within 1-2 business days.</p>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Reach us through any of these channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Email contact removed as requested */}
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
              <Button 
                onClick={() => setSubmitted(false)} 
                variant="outline" 
                className="mt-4"
              >
                Send Another Message
              </Button>
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
              
              {/* reCAPTCHA */}
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                  onExpired={handleRecaptchaExpired}
                  theme="light"
                />
              </div>
              
              {error && (
                <div className="p-3 text-sm bg-red-50 text-red-700 rounded border border-red-200">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={submitting || !recaptchaToken}>
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