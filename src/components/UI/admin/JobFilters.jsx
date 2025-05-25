// src/components/UI/admin/JobFilters.jsx
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select'
import { Input } from '@/components/UI/input'
import { Label } from '@/components/UI/label'
import { Badge } from '@/components/UI/badge'
import { Button } from '@/components/UI/button'
import { Filter, X } from 'lucide-react'
import axios from 'axios'
import { API_URL } from '@/lib/apiConfig'

const JobFilters = ({ 
    onFiltersChange, 
    currentFilters = {}, 
    userRole = 'Administrator',
    className = '' 
}) => {
    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        category: '',
        type: '',
        role: userRole,
        ...currentFilters
    })

    // Available job statuses
    const jobStatuses = [
        'Quote',
        'Work Order', 
        'In Progress',
        'Completed',
        'Cancelled'
    ]

    // Job types
    const jobTypes = [
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'project', label: 'Project' },
        { value: 'general', label: 'General' }
    ]

    // User roles for filtering (admin only)
    const userRoles = [
        'Administrator',
        'Office Manager',
        'Technician', 
        'Technician Apprentice',
        'Client Admin',
        'Client User'
    ]

    useEffect(() => {
        fetchCategoriesForRole(filters.role)
    }, [filters.role])

    useEffect(() => {
        // Notify parent component of filter changes
        onFiltersChange(filters)
    }, [filters, onFiltersChange])

    const fetchCategoriesForRole = async (role) => {
        try {
            setLoadingCategories(true)
            const response = await axios.get(`${API_URL}/fetch/jobs/categories/role/${role}`)
            setCategories(response.data)
        } catch (error) {
            console.error('Error fetching categories for role:', error)
            setCategories([])        } finally {
            setLoadingCategories(false)
        }
    }

    const updateFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            status: 'all',
            category: 'all',
            type: 'all',
            role: userRole
        })
    }

    const getActiveFiltersCount = () => {
        return Object.entries(filters).filter(([key, value]) => 
            value && value !== '' && value !== 'all' && key !== 'role'
        ).length
    }

    const isAdminOrManager = userRole === 'Administrator' || userRole === 'Office Manager'

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Job Filters
                        {getActiveFiltersCount() > 0 && (
                            <Badge variant="secondary">
                                {getActiveFiltersCount()} active
                            </Badge>
                        )}
                    </CardTitle>
                    {getActiveFiltersCount() > 0 && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    {/* Search */}
                    <div>
                        <Label htmlFor="search">Search Jobs</Label>
                        <Input
                            id="search"
                            placeholder="Search by description, address, or job details..."
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Role Filter (Admin only) */}
                        {isAdminOrManager && (
                            <div>
                                <Label htmlFor="role">View as Role</Label>
                                <Select value={filters.role} onValueChange={(value) => updateFilter('role', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {userRoles.map(role => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Status Filter */}
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    {jobStatuses.map(status => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select 
                                value={filters.category} 
                                onValueChange={(value) => updateFilter('category', value)}
                                disabled={loadingCategories}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingCategories ? "Loading..." : "All categories"} />
                                </SelectTrigger>                                <SelectContent>
                                    <SelectItem value="all">All categories</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category.uuid} value={category.uuid}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <Label htmlFor="type">Type</Label>
                            <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    {jobTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {getActiveFiltersCount() > 0 && (
                        <div>
                            <Label>Active Filters:</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {filters.search && (
                                    <Badge variant="outline" className="gap-1">
                                        Search: "{filters.search}"
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => updateFilter('search', '')}
                                        />
                                    </Badge>
                                )}                                {filters.status && filters.status !== 'all' && (
                                    <Badge variant="outline" className="gap-1">
                                        Status: {filters.status}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => updateFilter('status', 'all')}
                                        />
                                    </Badge>
                                )}
                                {filters.category && filters.category !== 'all' && (
                                    <Badge variant="outline" className="gap-1">
                                        Category: {categories.find(c => c.uuid === filters.category)?.name || 'Unknown'}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => updateFilter('category', 'all')}
                                        />
                                    </Badge>
                                )}
                                {filters.type && filters.type !== 'all' && (
                                    <Badge variant="outline" className="gap-1">
                                        Type: {jobTypes.find(t => t.value === filters.type)?.label || filters.type}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => updateFilter('type', 'all')}
                                        />
                                    </Badge>
                                )}
                                {filters.role !== userRole && (
                                    <Badge variant="outline" className="gap-1">
                                        View as: {filters.role}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => updateFilter('role', userRole)}
                                        />
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default JobFilters
