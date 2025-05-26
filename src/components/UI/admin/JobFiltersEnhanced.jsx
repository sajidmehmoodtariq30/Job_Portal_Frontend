// src/components/UI/admin/JobFilters.jsx
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select'
import { Input } from '@/components/UI/input'
import { Label } from '@/components/UI/label'
import { Badge } from '@/components/UI/badge'
import { Button } from '@/components/UI/button'
import { Filter, X, RefreshCw, AlertCircle, Save, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/UI/alert'
import { Skeleton } from '@/components/UI/skeleton'
import axios from 'axios'
import { API_URL } from '@/lib/apiConfig'

const JobFilters = ({ 
    onFiltersChange, 
    currentFilters = {}, 
    userRole = 'Administrator',
    className = '',
    showSavedFilters = true 
}) => {
    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [categoryError, setCategoryError] = useState(null)
    const [savedFilters, setSavedFilters] = useState([])
    const [filterName, setFilterName] = useState('')
    const [savingFilter, setSavingFilter] = useState(false)
    const [lastFilterUpdate, setLastFilterUpdate] = useState(Date.now())
    
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

    useEffect(() => {        fetchCategoriesForRole(filters.role)
        loadSavedFilters()
    }, [filters.role]);

    useEffect(() => {
        // Debounce filter changes to prevent excessive API calls
        const timeoutId = setTimeout(() => {
            onFiltersChange(filters)
            setLastFilterUpdate(Date.now())
        }, 300);

        return () => clearTimeout(timeoutId)
    }, [filters, onFiltersChange]);

    const fetchCategoriesForRole = async (role) => {
        try {
            setLoadingCategories(true)
            setCategoryError(null)
            
            const response = await axios.get(`${API_URL}/api/categories/role/${role}`)
            setCategories(response.data)
        } catch (error) {
            console.error('Error fetching categories for role:', error)
            setCategoryError('Failed to load categories')
            setCategories([])
        } finally {
            setLoadingCategories(false)
        }
    }

    const loadSavedFilters = () => {
        try {
            const saved = localStorage.getItem(`jobFilters_${userRole}`)
            if (saved) {
                setSavedFilters(JSON.parse(saved))
            }
        } catch (error) {
            console.error('Error loading saved filters:', error)
        }
    }

    const saveCurrentFilter = async () => {
        if (!filterName.trim()) return

        try {
            setSavingFilter(true)
            
            const filterToSave = {
                name: filterName,
                filters: { ...filters },
                createdAt: new Date().toISOString()
            }

            const updatedSavedFilters = [...savedFilters, filterToSave]
            setSavedFilters(updatedSavedFilters)
            localStorage.setItem(`jobFilters_${userRole}`, JSON.stringify(updatedSavedFilters))
            
            setFilterName('')
        } catch (error) {
            console.error('Error saving filter:', error)
        } finally {
            setSavingFilter(false)
        }
    }

    const applySavedFilter = (savedFilter) => {
        setFilters(savedFilter.filters)
    }

    const deleteSavedFilter = (index) => {
        const updatedSavedFilters = savedFilters.filter((_, i) => i !== index)
        setSavedFilters(updatedSavedFilters)
        localStorage.setItem(`jobFilters_${userRole}`, JSON.stringify(updatedSavedFilters))
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
            status: '',
            category: '',
            type: '',
            role: userRole
        })
    }

    const retryFetchCategories = () => {
        fetchCategoriesForRole(filters.role)
    }

    const getActiveFiltersCount = () => {
        return Object.entries(filters).filter(([key, value]) => 
            value && value !== '' && key !== 'role'
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
                    <div className="flex items-center gap-2">
                        {getActiveFiltersCount() > 0 && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                <X className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                        )}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={retryFetchCategories}
                            disabled={loadingCategories}
                        >
                            <RefreshCw className={`h-4 w-4 ${loadingCategories ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    {/* Category Loading Error Alert */}
                    {categoryError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {categoryError}. 
                                <Button 
                                    variant="link" 
                                    className="p-0 h-auto font-normal underline ml-1"
                                    onClick={retryFetchCategories}
                                >
                                    Try again
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

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
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All statuses</SelectItem>
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
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All categories</SelectItem>
                                    {loadingCategories ? (
                                        <div className="p-2">
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    ) : (
                                        categories.map(category => (
                                            <SelectItem key={category.uuid} value={category.uuid}>
                                                {category.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <Label htmlFor="type">Type</Label>
                            <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All types</SelectItem>
                                    {jobTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Save Filter Section */}
                    {showSavedFilters && getActiveFiltersCount() > 0 && (
                        <div className="border-t pt-4">
                            <Label>Save Current Filter</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    placeholder="Filter name..."
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    className="flex-1"
                                />
                                <Button 
                                    onClick={saveCurrentFilter}
                                    disabled={!filterName.trim() || savingFilter}
                                    size="sm"
                                >
                                    <Save className="h-4 w-4 mr-1" />
                                    {savingFilter ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Saved Filters */}
                    {showSavedFilters && savedFilters.length > 0 && (
                        <div className="border-t pt-4">
                            <Label>Saved Filters</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {savedFilters.map((savedFilter, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => applySavedFilter(savedFilter)}
                                        >
                                            {savedFilter.name}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteSavedFilter(index)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Filters Display */}
                    {getActiveFiltersCount() > 0 && (
                        <div className="border-t pt-4">
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
                                )}
                                {filters.status && (
                                    <Badge variant="outline" className="gap-1">
                                        Status: {filters.status}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => updateFilter('status', '')}
                                        />
                                    </Badge>
                                )}
                                {filters.category && (
                                    <Badge variant="outline" className="gap-1">
                                        Category: {categories.find(c => c.uuid === filters.category)?.name || 'Unknown'}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => updateFilter('category', '')}
                                        />
                                    </Badge>
                                )}
                                {filters.type && (
                                    <Badge variant="outline" className="gap-1">
                                        Type: {jobTypes.find(t => t.value === filters.type)?.label || filters.type}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => updateFilter('type', '')}
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
