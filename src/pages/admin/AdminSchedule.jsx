// src/pages/admin/AdminSchedule.jsx
import React, { useState } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns'
import { Button } from '@/components/UI/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog'
import { Input } from '@/components/UI/input'
import { Label } from '@/components/UI/label'
import { useNavigate } from 'react-router-dom'

const AdminSchedule = () => {
    const navigate = useNavigate()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isScheduleEventOpen, setIsScheduleEventOpen] = useState(false)
    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'job',
        assignee: '',
        client: '',
        startTime: '09:00',
        endTime: '10:00',
        notes: ''
    })

    // Mock data for team members and clients
    const teamMembers = [
        { id: 1, name: 'John Smith' },
        { id: 2, name: 'Emma Wilson' },
        { id: 3, name: 'Michael Brown' },
        { id: 4, name: 'Sarah Davis' },
    ]

    const clients = [
        { id: 101, name: 'Acme Corporation' },
        { id: 102, name: 'Globex Industries' },
        { id: 103, name: 'Smith & Partners' },
        { id: 104, name: 'Johnson Family' },
    ]

    // Mock schedule events for demonstration
    const [scheduleEvents, setScheduleEvents] = useState([
        {
            id: 1,
            title: 'AC Repair',
            type: 'job',
            date: '2025-04-10',
            startTime: '09:00',
            endTime: '11:00',
            assignee: 'John Smith',
            client: 'Acme Corporation',
            notes: 'Bring replacement parts'
        },
        {
            id: 2,
            title: 'Quote - New Installation',
            type: 'quote',
            date: '2025-04-10',
            startTime: '13:00',
            endTime: '14:00',
            assignee: 'Emma Wilson',
            client: 'Johnson Family',
            notes: 'First time client'
        },
        {
            id: 3,
            title: 'Plumbing Maintenance',
            type: 'job',
            date: '2025-04-11',
            startTime: '10:00',
            endTime: '12:00',
            assignee: 'Michael Brown',
            client: 'Globex Industries',
            notes: ''
        },
        {
            id: 4,
            title: 'Team Meeting',
            type: 'meeting',
            date: '2025-04-12',
            startTime: '15:00',
            endTime: '16:00',
            assignee: '',
            client: '',
            notes: 'Weekly sync'
        }
    ])

    const moveToToday = () => {
        setCurrentDate(new Date())
        setSelectedDate(new Date())
    }

    const moveWeek = (direction) => {
        if (direction === 'prev') {
            setCurrentDate(subWeeks(currentDate, 1))
        } else {
            setCurrentDate(addWeeks(currentDate, 1))
        }
    }

    const handleDateClick = (date) => {
        setSelectedDate(date)
    }

    const handleCreateEvent = () => {
        const newScheduleEvent = {
            id: Date.now(),
            ...newEvent,
            date: format(selectedDate, 'yyyy-MM-dd')
        }

        setScheduleEvents([...scheduleEvents, newScheduleEvent])
        setIsScheduleEventOpen(false)

        // Reset form
        setNewEvent({
            title: '',
            type: 'job',
            assignee: '',
            client: '',
            startTime: '09:00',
            endTime: '10:00',
            notes: ''
        })
    }

    const handleEventClick = (eventId) => {
        // In a real app, this would navigate to the job or open a detailed view
        if (newEvent.type === 'job') {
            navigate(`/admin/jobs/${eventId}`)
        }
    }

    // Generate days of the week from current date
    const generateWeekDays = () => {
        const startDay = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start from Monday
        const days = []

        for (let i = 0; i < 7; i++) {
            const day = addDays(startDay, i)
            days.push(day)
        }

        return days
    }

    const weekDays = generateWeekDays()

    // Generate time slots for the day
    const generateTimeSlots = () => {
        const slots = []
        for (let hour = 8; hour < 18; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`)
            slots.push(`${hour.toString().padStart(2, '0')}:30`)
        }
        return slots
    }

    const timeSlots = generateTimeSlots()

    // Filter events for the selected day
    const getDayEvents = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd')
        return scheduleEvents.filter(event => event.date === formattedDate)
    }

    // Calculate event position and height based on time
    const getEventStyle = (event) => {
        const [startHour, startMinute] = event.startTime.split(':').map(Number)
        const [endHour, endMinute] = event.endTime.split(':').map(Number)

        const startPosition = (startHour - 8) * 60 + startMinute
        const endPosition = (endHour - 8) * 60 + endMinute
        const height = endPosition - startPosition

        return {
            top: `${startPosition}px`,
            height: `${height}px`
        }
    }

    // Get background color based on event type
    const getEventColor = (type) => {
        switch (type) {
            case 'job':
                return 'bg-blue-100 border-blue-400 text-blue-800'
            case 'quote':
                return 'bg-green-100 border-green-400 text-green-800'
            case 'meeting':
                return 'bg-purple-100 border-purple-400 text-purple-800'
            default:
                return 'bg-gray-100 border-gray-400 text-gray-800'
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">Schedule</h1>
                    <p className="text-muted-foreground">Manage team schedules and appointments</p>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => moveWeek('prev')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </Button>

                    <Button variant="outline" onClick={moveToToday}>
                        Today
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => moveWeek('next')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </Button>

                    <span className="font-medium ml-2">
                        {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
                    </span>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle>Weekly Calendar</CardTitle>
                        <Dialog open={isScheduleEventOpen} onOpenChange={setIsScheduleEventOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                                        <path d="M5 12h14" />
                                        <path d="M12 5v14" />
                                    </svg>
                                    Add Event
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Schedule New Event</DialogTitle>
                                    <DialogDescription>
                                        Create a new event for {format(selectedDate, 'MMMM d, yyyy')}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={newEvent.title}
                                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                            placeholder="Event title"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Event Type</Label>
                                        <Select
                                            value={newEvent.type}
                                            onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                                        >
                                            <SelectTrigger id="type">
                                                <SelectValue placeholder="Select event type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="job">Job</SelectItem>
                                                <SelectItem value="quote">Quote</SelectItem>
                                                <SelectItem value="meeting">Meeting</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {(newEvent.type === 'job' || newEvent.type === 'quote') && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="client">Client</Label>
                                            <Select
                                                value={newEvent.client}
                                                onValueChange={(value) => setNewEvent({ ...newEvent, client: value })}
                                            >
                                                <SelectTrigger id="client">
                                                    <SelectValue placeholder="Select client" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clients.map(client => (
                                                        <SelectItem key={client.id} value={client.name}>
                                                            {client.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label htmlFor="assignee">Assignee</Label>
                                        <Select
                                            value={newEvent.assignee}
                                            onValueChange={(value) => setNewEvent({ ...newEvent, assignee: value })}
                                        >
                                            <SelectTrigger id="assignee">
                                                <SelectValue placeholder="Select team member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teamMembers.map(member => (
                                                    <SelectItem key={member.id} value={member.name}>
                                                        {member.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="startTime">Start Time</Label>
                                            <Input
                                                id="startTime"
                                                type="time"
                                                value={newEvent.startTime}
                                                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="endTime">End Time</Label>
                                            <Input
                                                id="endTime"
                                                type="time"
                                                value={newEvent.endTime}
                                                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Input
                                            id="notes"
                                            value={newEvent.notes}
                                            onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                                            placeholder="Additional details"
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="submit" onClick={handleCreateEvent}>
                                        Create Event
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Calendar Header */}
                            <div className="grid grid-cols-8 border-b">
                                <div className="p-2 text-center font-medium text-muted-foreground border-r">Time</div>
                                {weekDays.map((day, index) => (
                                    <div
                                        key={index}
                                        className={`p-2 text-center font-medium ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''
                                            } ${isSameDay(day, selectedDate) ? 'bg-blue-100' : ''
                                            }`}
                                        onClick={() => handleDateClick(day)}
                                    >
                                        <div>{format(day, 'EEE')}</div>
                                        <div className={`text-sm ${isSameDay(day, new Date()) ? 'text-blue-600 font-bold' : ''}`}>
                                            {format(day, 'd')}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Body */}
                            <div className="grid grid-cols-8 relative">
                                {/* Time slots */}
                                <div className="border-r">
                                    {timeSlots.map((time, index) => (
                                        <div
                                            key={index}
                                            className={`h-8 text-xs text-right pr-2 ${index % 2 === 0 ? 'border-t font-medium' : ''
                                                }`}
                                        >
                                            {index % 2 === 0 ? time : ''}
                                        </div>
                                    ))}
                                </div>

                                {/* Days columns */}
                                {weekDays.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className={`relative ${dayIndex < 6 ? 'border-r' : ''} ${isSameDay(day, selectedDate) ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        {timeSlots.map((time, timeIndex) => (
                                            <div
                                                key={timeIndex}
                                                className={`h-8 ${timeIndex % 2 === 0 ? 'border-t' : ''
                                                    }`}
                                            />
                                        ))}

                                        {/* Events for this day */}
                                        {getDayEvents(day).map((event) => (
                                            <div
                                                key={event.id}
                                                className={`absolute w-[95%] mx-[2.5%] px-2 py-1 border rounded text-xs overflow-hidden cursor-pointer hover:opacity-90 ${getEventColor(event.type)}`}
                                                style={getEventStyle(event)}
                                                onClick={() => handleEventClick(event.id)}
                                            >
                                                <div className="font-medium truncate">{event.title}</div>
                                                <div className="truncate">{event.startTime} - {event.endTime}</div>
                                                {event.assignee && <div className="truncate">{event.assignee}</div>}
                                                {event.client && <div className="truncate">{event.client}</div>}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Daily Schedule View */}
            <Card>
                <CardHeader>
                    <CardTitle>Schedule for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {getDayEvents(selectedDate).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No events scheduled for this day
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {getDayEvents(selectedDate).map((event) => (
                                <div
                                    key={event.id}
                                    className={`p-4 border rounded-md ${getEventColor(event.type)}`}
                                    onClick={() => handleEventClick(event.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-lg">{event.title}</h3>
                                            <p className="text-sm">{event.startTime} - {event.endTime}</p>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-50">
                                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                        </span>
                                    </div>

                                    {(event.assignee || event.client) && (
                                        <div className="mt-2">
                                            {event.assignee && (
                                                <p className="text-sm">
                                                    <span className="font-medium">Assignee:</span> {event.assignee}
                                                </p>
                                            )}
                                            {event.client && (
                                                <p className="text-sm">
                                                    <span className="font-medium">Client:</span> {event.client}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {event.notes && (
                                        <div className="mt-2 text-sm">
                                            <p className="font-medium">Notes:</p>
                                            <p>{event.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminSchedule