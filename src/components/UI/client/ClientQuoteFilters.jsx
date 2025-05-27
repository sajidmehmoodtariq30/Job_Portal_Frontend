// src/components/UI/client/ClientQuoteFilters.jsx
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

const ClientQuoteFilters = ({ 
    onFiltersChange, 
    currentFilters = {}, 
    className = '',
    showSavedFilters = true 
}) => {
    const [savedFilters, setSavedFilters] = useState([])
    const [filterName, setFilterName] = useState('')
    const [savingFilter, setSavingFilter] = useState(false)
      const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        dateFrom: '',
        dateTo: '',
        amountMin: '',
        amountMax: '',
        ...currentFilters
    })    // Available quote statuses
    const quoteStatuses = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Accepted', label: 'Accepted' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Expired', label: 'Expired' },
        { value: 'Cancelled', label: 'Cancelled' }
    ]

    // Date range presets
    const dateRanges = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'quarter', label: 'This Quarter' },
        { value: 'year', label: 'This Year' },
        { value: 'custom', label: 'Custom Range' }
    ]

    // Load saved filters from localStorage on component mount
    useEffect(() => {
        const saved = localStorage.getItem('clientQuoteFilters')
        if (saved) {
            try {
                setSavedFilters(JSON.parse(saved))
            } catch (error) {
                console.error('Error loading saved filters:', error)
            }
        }
    }, [])

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        
        // Apply filters immediately
        if (onFiltersChange) {
            onFiltersChange(newFilters)
        }
    }    // Clear all filters
    const clearAllFilters = () => {
        const clearedFilters = {
            search: '',
            status: 'all',
            dateFrom: '',
            dateTo: '',
            amountMin: '',
            amountMax: ''
        }
        setFilters(clearedFilters)
        if (onFiltersChange) {
            onFiltersChange(clearedFilters)
        }
    }

    // Save current filter configuration
    const saveCurrentFilters = () => {
        if (!filterName.trim()) return

        setSavingFilter(true)
        try {
            const newSavedFilter = {
                id: Date.now(),
                name: filterName.trim(),
                filters: { ...filters },
                createdAt: new Date().toISOString()
            }

            const updatedSavedFilters = [...savedFilters, newSavedFilter]
            setSavedFilters(updatedSavedFilters)
            localStorage.setItem('clientQuoteFilters', JSON.stringify(updatedSavedFilters))
            setFilterName('')
        } catch (error) {
            console.error('Error saving filters:', error)
        } finally {
            setSavingFilter(false)
        }
    }

    // Load a saved filter configuration
    const loadSavedFilter = (savedFilter) => {
        setFilters(savedFilter.filters)
        if (onFiltersChange) {
            onFiltersChange(savedFilter.filters)
        }
    }

    // Delete a saved filter
    const deleteSavedFilter = (filterId) => {
        const updatedSavedFilters = savedFilters.filter(filter => filter.id !== filterId)
        setSavedFilters(updatedSavedFilters)
        localStorage.setItem('clientQuoteFilters', JSON.stringify(updatedSavedFilters))
    }    // Check if any filters are active
    const hasActiveFilters = Object.values(filters).some(value => 
        value && value.toString().trim() !== '' && value !== 'all'
    )

    // Get active filter count
    const activeFilterCount = Object.values(filters).filter(value => 
        value && value.toString().trim() !== '' && value !== 'all'
    ).length

    return (
        <Card className={`w-full ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Filter size={18} />
                    Quote Filters
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {activeFilterCount} active
                        </Badge>
                    )}
                </CardTitle>
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="flex items-center gap-1"
                    >
                        <X size={14} />
                        Clear All
                    </Button>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Search Filter */}
                <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <Input
                        id="search"
                        placeholder="Search quotes by ID, title, or description..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                        value={filters.status} 
                        onValueChange={(value) => handleFilterChange('status', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {quoteStatuses.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Range Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dateFrom">Date From</Label>
                        <Input
                            id="dateFrom"
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dateTo">Date To</Label>
                        <Input
                            id="dateTo"
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                        />
                    </div>
                </div>

                {/* Amount Range Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="amountMin">Min Amount ($)</Label>
                        <Input
                            id="amountMin"
                            type="number"
                            placeholder="0.00"
                            value={filters.amountMin}
                            onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amountMax">Max Amount ($)</Label>
                        <Input
                            id="amountMax"
                            type="number"
                            placeholder="999999.99"
                            value={filters.amountMax}
                            onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                        />
                    </div>
                </div>

                {/* Saved Filters Section */}
                {showSavedFilters && (
                    <div className="space-y-3 pt-4 border-t">
                        <Label>Saved Filters</Label>
                        
                        {/* Save Current Filter */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Filter name..."
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && saveCurrentFilters()}
                            />
                            <Button
                                onClick={saveCurrentFilters}
                                disabled={!filterName.trim() || savingFilter}
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Save size={14} />
                                {savingFilter ? 'Saving...' : 'Save'}
                            </Button>
                        </div>

                        {/* Saved Filters List */}
                        {savedFilters.length > 0 && (
                            <div className="space-y-2">
                                {savedFilters.map(savedFilter => (
                                    <div
                                        key={savedFilter.id}
                                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{savedFilter.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(savedFilter.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => loadSavedFilter(savedFilter)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <RefreshCw size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteSavedFilter(savedFilter.id)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default ClientQuoteFilters