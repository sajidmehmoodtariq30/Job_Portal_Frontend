// src/components/UI/client/ClientJobFilters.jsx
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select'
import { Input } from '@/components/UI/input'
import { Label } from '@/components/UI/label'
import { Badge } from '@/components/UI/badge'
import { Button } from '@/components/UI/button'
import { Filter, X, RefreshCw, AlertCircle, Save, Trash2, Calendar } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/UI/alert'
import { Skeleton } from '@/components/UI/skeleton'
import axios from 'axios'
import { API_URL } from '@/lib/apiConfig'

const ClientJobFilters = ({ 
    onFiltersChange, 
    currentFilters = {}, 
    className = '',
    showSavedFilters = true 
}) => {
    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [categoryError, setCategoryError] = useState(null)
    const [savedFilters, setSavedFilters] = useState([])
    const [filterName, setFilterName] = useState('')
    const [savingFilter, setSavingFilter] = useState(false)
      const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        category: 'all',
        type: 'all',
        dateRange: 'all',
        priority: 'all',
        ...currentFilters
    })

    // Available job statuses for clients
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
        { value: 'general', label: 'General' },
        { value: 'emergency', label: 'Emergency' }
    ]

    // Date range options
    const dateRanges = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'quarter', label: 'This Quarter' },
        { value: 'year', label: 'This Year' }
    ]

    // Priority levels
    const priorityLevels = [        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    useEffect(() => {
        fetchCategories()
        loadSavedFilters()
    }, []);    useEffect(() => {
        // Debounce filter changes to prevent excessive API calls
        const timeoutId = setTimeout(() => {
            // Convert dateRange to actual dateFrom/dateTo values before sending
            const processedFilters = { ...filters }
            
            if (filters.dateRange) {
                const dateRangeValues = getDateRangeValues(filters.dateRange)
                processedFilters.dateFrom = dateRangeValues.from
                processedFilters.dateTo = dateRangeValues.to
            } else {
                // Clear date filters if no range selected
                delete processedFilters.dateFrom
                delete processedFilters.dateTo
            }
            
            onFiltersChange(processedFilters)
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [filters, onFiltersChange]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true)
            setCategoryError(null)
            
            // Get user info for client filtering
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            const role = userInfo.role || 'Client User'
            
            const response = await axios.get(`${API_URL}/api/categories/role/${role}`)
            setCategories(response.data)
        } catch (error) {
            console.error('Error fetching categories:', error)
            setCategoryError('Failed to load categories')
            setCategories([])
        } finally {
            setLoadingCategories(false)
        }
    }

    const loadSavedFilters = () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            const userId = userInfo.uuid || 'default'
            const saved = localStorage.getItem(`clientJobFilters_${userId}`)
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
            
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            const userId = userInfo.uuid || 'default'
            localStorage.setItem(`clientJobFilters_${userId}`, JSON.stringify(updatedSavedFilters))
            
            setFilterName('')
        } catch (error) {
            console.error('Error saving filter:', error)        } finally {
            setSavingFilter(false)
        }
    }

    const applySavedFilter = (savedFilter) => {
        setFilters(savedFilter.filters)
    }

    const deleteSavedFilter = (index) => {
        const updatedSavedFilters = savedFilters.filter((_, i) => i !== index)
        setSavedFilters(updatedSavedFilters)
        
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        const userId = userInfo.uuid || 'default'
        localStorage.setItem(`clientJobFilters_${userId}`, JSON.stringify(updatedSavedFilters))
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
            dateRange: 'all',
            priority: 'all'        })
    }

    const retryFetchCategories = () => {
        fetchCategories()
    }

    const getDateRangeValues = (dateRange) => {
        const today = new Date()
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

        switch (dateRange) {
            case 'today':
                return {
                    from: startOfToday.toISOString().split('T')[0],
                    to: endOfToday.toISOString().split('T')[0]
                }
            case 'week':
                const startOfWeek = new Date(today)
                startOfWeek.setDate(today.getDate() - today.getDay())
                return {
                    from: startOfWeek.toISOString().split('T')[0],
                    to: endOfToday.toISOString().split('T')[0]
                }
            case 'month':
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                return {
                    from: startOfMonth.toISOString().split('T')[0],
                    to: endOfToday.toISOString().split('T')[0]
                }
            case 'quarter':
                const quarterStart = Math.floor(today.getMonth() / 3) * 3
                const startOfQuarter = new Date(today.getFullYear(), quarterStart, 1)
                return {
                    from: startOfQuarter.toISOString().split('T')[0],
                    to: endOfToday.toISOString().split('T')[0]
                }
            case 'year':
                const startOfYear = new Date(today.getFullYear(), 0, 1)
                return {
                    from: startOfYear.toISOString().split('T')[0],
                    to: endOfToday.toISOString().split('T')[0]
                }
            default:
                return { from: null, to: null }
        }
    }

    const getActiveFiltersCount = () => {
        return Object.entries(filters).filter(([key, value]) => 
            value && value !== '' && value !== 'all'
        ).length
    }

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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                        {/* Date Range Filter */}
                        <div>
                            <Label htmlFor="dateRange">Date Range</Label>
                            <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All dates" />
                                </SelectTrigger>                                <SelectContent>
                                    <SelectItem value="all">All dates</SelectItem>
                                    {dateRanges.map(range => (
                                        <SelectItem key={range.value} value={range.value}>
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {range.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All priorities" />
                                </SelectTrigger>                                <SelectContent>
                                    <SelectItem value="all">All priorities</SelectItem>
                                    {priorityLevels.map(priority => (
                                        <SelectItem key={priority.value} value={priority.value}>
                                            {priority.label}
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
                                {filters.dateRange && filters.dateRange !== 'all' && (
                                    <Badge variant="outline" className="gap-1">
                                        Date: {dateRanges.find(d => d.value === filters.dateRange)?.label || filters.dateRange}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => updateFilter('dateRange', 'all')}
                                        />
                                    </Badge>
                                )}                                {filters.priority && filters.priority !== 'all' && (
                                    <Badge variant="outline" className="gap-1">
                                        Priority: {priorityLevels.find(p => p.value === filters.priority)?.label || filters.priority}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => updateFilter('priority', 'all')}
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

export default ClientJobFilters
