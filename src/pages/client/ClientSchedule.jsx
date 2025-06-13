import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Calendar, Clock, MapPin } from 'lucide-react';

const ClientSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Schedule</h1>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No appointments scheduled</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSchedule;
