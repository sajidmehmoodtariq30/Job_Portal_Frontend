import React, { useState } from 'react';
import { LifeBuoy, Mail, Phone, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';

const SUPPORT_EMAIL = 'support@mhitsolutions.com';
const SUPPORT_PHONE = '+61 2 1234 5678';

const ClientSupport = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <LifeBuoy className="text-blue-600" size={28} />
        <h1 className="text-3xl font-bold">Support</h1>
      </div>
      <p className="text-muted-foreground mb-6">Need help? Contact our support team or submit a request below. We aim to respond within 1 business day.</p>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Reach us directly by email or phone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="text-blue-500" size={18} />
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:underline">{SUPPORT_EMAIL}</a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="text-blue-500" size={18} />
              <a href={`tel:${SUPPORT_PHONE}`} className="hover:underline">{SUPPORT_PHONE}</a>
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