// src/pages/admin/AdminTeam.jsx
import React, { useState } from 'react'
import { Button } from '@/components/UI/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog'
import { Input } from '@/components/UI/input'
import { Label } from '@/components/UI/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/UI/dropdown-menu'

const AdminTeam = () => {
    // Mock team members data
    const [teamMembers, setTeamMembers] = useState([
        {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '(555) 123-4567',
            role: 'Administrator',
            department: 'Management',
            status: 'active',
            avatar: null,
            skills: ['HVAC', 'Electrical', 'Plumbing'],
            hireDate: '2020-05-12',
            jobsCompleted: 142,
            efficiency: 94
        },
        {
            id: 2,
            name: 'Emma Wilson',
            email: 'emma.wilson@example.com',
            phone: '(555) 234-5678',
            role: 'Technician',
            department: 'Field Service',
            status: 'active',
            avatar: null,
            skills: ['Electrical', 'Installation'],
            hireDate: '2021-03-18',
            jobsCompleted: 89,
            efficiency: 87
        },
        {
            id: 3,
            name: 'Michael Brown',
            email: 'michael.brown@example.com',
            phone: '(555) 345-6789',
            role: 'Technician',
            department: 'Field Service',
            status: 'active',
            avatar: null,
            skills: ['Plumbing', 'HVAC'],
            hireDate: '2019-11-05',
            jobsCompleted: 211,
            efficiency: 91
        },
        {
            id: 4,
            name: 'Sarah Davis',
            email: 'sarah.davis@example.com',
            phone: '(555) 456-7890',
            role: 'Office Manager',
            department: 'Administration',
            status: 'active',
            avatar: null,
            skills: ['Customer Service', 'Scheduling'],
            hireDate: '2022-01-10',
            jobsCompleted: 0,
            efficiency: 98
        },
        {
            id: 5,
            name: 'Robert Johnson',
            email: 'robert.johnson@example.com',
            phone: '(555) 567-8901',
            role: 'Technician Apprentice',
            department: 'Field Service',
            status: 'active',
            avatar: null,
            skills: ['HVAC'],
            hireDate: '2023-06-22',
            jobsCompleted: 37,
            efficiency: 82
        }
    ])

    // State for new member form
    const [isAddingMember, setIsAddingMember] = useState(false)
    const [isViewingMember, setIsViewingMember] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)
    const [newMember, setNewMember] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        skills: [],
    })

    // State for filtering
    const [filterRole, setFilterRole] = useState('')
    const [filterDepartment, setFilterDepartment] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    const handleAddMember = () => {
        const member = {
            id: Date.now(),
            ...newMember,
            status: 'active',
            avatar: null,
            hireDate: new Date().toISOString().split('T')[0],
            jobsCompleted: 0,
            efficiency: 85
        }

        setTeamMembers([...teamMembers, member])
        setIsAddingMember(false)

        // Reset form
        setNewMember({
            name: '',
            email: '',
            phone: '',
            role: '',
            department: '',
            skills: [],
        })
    }

    const handleViewMember = (member) => {
        setSelectedMember(member)
        setIsViewingMember(true)
    }

    const handleDeactivateMember = (id) => {
        setTeamMembers(
            teamMembers.map(member =>
                member.id === id ? { ...member, status: 'inactive' } : member
            )
        )

        // Close dialog if it's the currently viewed member
        if (selectedMember && selectedMember.id === id) {
            setIsViewingMember(false)
        }
    }

    const handleFilterByRole = (value) => {
        setFilterRole(value)
    }

    const handleFilterByDepartment = (value) => {
        setFilterDepartment(value)
    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
    }

    // Apply filters
    const filteredTeamMembers = teamMembers.filter(member => {
        const matchesRole = !filterRole || member.role === filterRole
        const matchesDepartment = !filterDepartment || member.department === filterDepartment
        const matchesSearch = !searchQuery ||
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesRole && matchesDepartment && matchesSearch
    })

    // Extract unique roles and departments for filters
    const roles = [...new Set(teamMembers.map(member => member.role))]
    const departments = [...new Set(teamMembers.map(member => member.department))]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Team Management</h1>
                    <p className="text-muted-foreground">Manage your team members and their access</p>
                </div>

                <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                    <DialogTrigger asChild>
                        <Button>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M19 8l2 2"></path>
                                <path d="M21 10l-2 2"></path>
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M19 8l2 2"></path>
                                <path d="M21 10l-2 2"></path>
                            </svg>
                            Add Team Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add New Team Member</DialogTitle>
                            <DialogDescription>
                                Create a new account for a team member. They will receive an email invitation.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                    placeholder="John Smith"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newMember.email}
                                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                        placeholder="john.smith@example.com"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={newMember.phone}
                                        onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={newMember.role}
                                        onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                                    >
                                        <SelectTrigger id="role">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Administrator">Administrator</SelectItem>
                                            <SelectItem value="Office Manager">Office Manager</SelectItem>
                                            <SelectItem value="Technician">Technician</SelectItem>
                                            <SelectItem value="Technician Apprentice">Technician Apprentice</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        value={newMember.department}
                                        onValueChange={(value) => setNewMember({ ...newMember, department: value })}
                                    >
                                        <SelectTrigger id="department">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Management">Management</SelectItem>
                                            <SelectItem value="Administration">Administration</SelectItem>
                                            <SelectItem value="Field Service">Field Service</SelectItem>
                                            <SelectItem value="Customer Support">Customer Support</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="skills">Skills (comma separated)</Label>
                                <Input
                                    id="skills"
                                    placeholder="HVAC, Electrical, Plumbing"
                                    onChange={(e) => setNewMember({
                                        ...newMember,
                                        skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
                                    })}
                                />
                                <p className="text-sm text-muted-foreground">Enter skills separated by commas</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddingMember(false)}>Cancel</Button>
                            <Button onClick={handleAddMember} disabled={!newMember.name || !newMember.email || !newMember.role}>Add Member</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                placeholder="Search by name or email"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>

                        <div>
                            <Label htmlFor="filterRole">Filter by Role</Label>
                            <Select value={filterRole} onValueChange={handleFilterByRole}>
                                <SelectTrigger id="filterRole">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-roles">All Roles</SelectItem>
                                    {roles.map(role => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="filterDepartment">Filter by Department</Label>
                            <Select value={filterDepartment} onValueChange={handleFilterByDepartment}>
                                <SelectTrigger id="filterDepartment">
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-departments">All Departments</SelectItem>
                                    {departments.map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Team Member Listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeamMembers.length > 0 ? (
                    filteredTeamMembers.map((member) => (
                        <Card key={member.id} className={member.status === 'inactive' ? 'opacity-60' : ''}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarImage src={member.avatar} alt={member.name} />
                                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle>{member.name}</CardTitle>
                                            <CardDescription>{member.role}</CardDescription>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                                    <circle cx="12" cy="12" r="1"></circle>
                                                    <circle cx="12" cy="5" r="1"></circle>
                                                    <circle cx="12" cy="19" r="1"></circle>
                                                </svg>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleViewMember(member)}>
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeactivateMember(member.id)}>
                                                {member.status === 'active' ? 'Deactivate' : 'Reactivate'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Email:</span> {member.email}
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Department:</span> {member.department}
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Phone:</span> {member.phone}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {member.skills.map(skill => (
                                            <span key={skill} className="text-xs bg-muted px-2 py-1 rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">No team members found matching your criteria</p>
                    </div>
                )}
            </div>

            {/* Member Details Dialog */}
            <Dialog open={isViewingMember} onOpenChange={setIsViewingMember}>
                {selectedMember && (
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{selectedMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                {selectedMember.name}
                            </DialogTitle>
                            <DialogDescription>{selectedMember.role} • {selectedMember.department}</DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="details">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="performance">Performance</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Email</Label>
                                        <div className="mt-1">{selectedMember.email}</div>
                                    </div>
                                    <div>
                                        <Label>Phone</Label>
                                        <div className="mt-1">{selectedMember.phone}</div>
                                    </div>
                                    <div>
                                        <Label>Hire Date</Label>
                                        <div className="mt-1">{selectedMember.hireDate}</div>
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <div className="mt-1 capitalize">{selectedMember.status}</div>
                                    </div>
                                </div>

                                <div>
                                    <Label>Skills</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedMember.skills.map(skill => (
                                            <span key={skill} className="text-xs bg-muted px-2 py-1 rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="performance" className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">Jobs Completed</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold">{selectedMember.jobsCompleted}</div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">Efficiency</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold">{selectedMember.efficiency}%</div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm">
                                            Activity history will be displayed here in production version.
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsViewingMember(false)}>Close</Button>
                            <Button variant="destructive" onClick={() => {
                                handleDeactivateMember(selectedMember.id);
                                setIsViewingMember(false);
                            }}>
                                {selectedMember.status === 'active' ? 'Deactivate' : 'Reactivate'} User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    )
}

export default AdminTeam