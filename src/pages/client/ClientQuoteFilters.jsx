import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select'
import { Input } from '@/components/UI/input'
import { Label } from '@/components/UI/label'
import { Badge } from '@/components/UI/badge'
import { Button } from '@/components/UI/button'
import { Filter, X, RefreshCw, AlertCircle, Calendar, DollarSign } from 'lucide-react'
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
        dateRange: 'all',
        amountRange: 'all',
        dateFrom: '',
        dateTo: '',
        amountMin: '',
        amountMax: '',
        ...currentFilters
    })

    // Available quote statuses for clients
    const quoteStatuses = [
        'Pending',
        'Accepted',
        'Rejected',
        'Expired'
    ]

    // Date range options
    const dateRanges = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'quarter', label: 'This Quarter' },
        { value: 'year', label: 'This Year' }
    ]

    // Amount range options
    const amountRanges = [
        { value: '0-1000', label: '$0 - $1,000' },
        { value: '1000-5000', label: '$1,000 - $5,000' },
        { value: '5000-10000', label: '$5,000 - $10,000' },
        { value: '10000-50000', label: '$10,000 - $50,000' },
        { value: '50000+', label: '$50,000+' }
    ]

    useEffect(() => {
        loadSavedFilters()
    }, []);

    useEffect(() => {
        // Notify parent component of filter changes with debouncing
        const timeoutId = setTimeout(() => {
            onFiltersChange(filters)
        }, 300);

        return () => clearTimeout(timeoutId)
    }, [filters, onFiltersChange]);

    const loadSavedFilters = () => {
        try {
            const saved = localStorage.getItem('clientQuoteFilters')
            if (saved) {
                setSavedFilters(JSON.parse(saved))
            }
        } catch (error) {
            console.error('Error loading saved filters:', error)
        }
    }

    const saveCurrentFilter = () => {
        if (!filterName.trim()) return

        setSavingFilter(true)
        try {
            const filterToSave = {
                name: filterName.trim(),
                filters: { ...filters },
                savedAt: new Date().toISOString()
            }

            const updatedSavedFilters = [...savedFilters, filterToSave]
            setSavedFilters(updatedSavedFilters)
            localStorage.setItem('clientQuoteFilters', JSON.stringify(updatedSavedFilters))
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
        localStorage.setItem('clientQuoteFilters', JSON.stringify(updatedSavedFilters))
    }

    const updateFilter = (key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value }
            
            // Handle predefined date ranges
            if (key === 'dateRange' && value && value !== 'all') {
                const today = new Date()
                let fromDate = ''
                let toDate = today.toISOString().split('T')[0]
                
                switch (value) {
                    case 'today':
                        fromDate = today.toISOString().split('T')[0]
                        break
                    case 'week':
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                        fromDate = weekAgo.toISOString().split('T')[0]
                        break
                    case 'month':
                        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
                        fromDate = monthAgo.toISOString().split('T')[0]
                        break
                    case 'quarter':
                        const quarterAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
                        fromDate = quarterAgo.toISOString().split('T')[0]
                        break
                    case 'year':
                        const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
                        fromDate = yearAgo.toISOString().split('T')[0]
                        break
                }
                
                newFilters.dateFrom = fromDate
                newFilters.dateTo = toDate
            }
            
            // Handle predefined amount ranges
            if (key === 'amountRange') {
                if (value === 'all') {
                    newFilters.amountMin = ''
                    newFilters.amountMax = ''
                } else if (value) {
                    switch (value) {
                        case '0-1000':
                            newFilters.amountMin = '0'
                            newFilters.amountMax = '1000'
                            break
                        case '1000-5000':
                            newFilters.amountMin = '1000'
                            newFilters.amountMax = '5000'
                            break
                        case '5000-10000':
                            newFilters.amountMin = '5000'
                            newFilters.amountMax = '10000'
                            break
                        case '10000-50000':
                            newFilters.amountMin = '10000'
                            newFilters.amountMax = '50000'
                            break
                        case '50000+':
                            newFilters.amountMin = '50000'
                            newFilters.amountMax = ''
                            break
                    }
                }
            }

            // Clear predefined ranges if custom values are set
            if ((key === 'dateFrom' || key === 'dateTo') && value) {
                newFilters.dateRange = 'all'
            }
            
            if ((key === 'amountMin' || key === 'amountMax') && value) {
                newFilters.amountRange = 'all'
            }

            return newFilters
        })
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            status: 'all',
            dateRange: 'all',
            amountRange: 'all',
            dateFrom: '',
            dateTo: '',
            amountMin: '',
            amountMax: ''
        })
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
                        Quote Filters
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
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    {/* Search */}
                    <div>
                        <Label htmlFor="search">Search Quotes</Label>
                        <Input
                            id="search"
                            placeholder="Search by ID, title, description, or status..."
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
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    {quoteStatuses.map(status => (
                                        <SelectItem key={status} value={status}>
                                            {status}
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
                                </SelectTrigger>
                                <SelectContent>
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

                        {/* Amount Range Filter */}
                        <div>
                            <Label htmlFor="amountRange">Amount Range</Label>
                            <Select value={filters.amountRange} onValueChange={(value) => updateFilter('amountRange', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All amounts" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All amounts</SelectItem>
                                    {amountRanges.map(range => (
                                        <SelectItem key={range.value} value={range.value}>
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            {range.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="dateFrom">From Date</Label>
                            <Input
                                id="dateFrom"
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="dateTo">To Date</Label>
                            <Input
                                id="dateTo"
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => updateFilter('dateTo', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Custom Amount Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="amountMin">Min Amount ($)</Label>
                            <Input
                                id="amountMin"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={filters.amountMin}
                                onChange={(e) => updateFilter('amountMin', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="amountMax">Max Amount ($)</Label>
                            <Input
                                id="amountMax"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="No limit"
                                value={filters.amountMax}
                                onChange={(e) => updateFilter('amountMax', e.target.value)}
                            />
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
                                            <X className="h-3 w-3" />
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
                                {filters.status && filters.status !== 'all' && (
                                    <Badge variant="outline" className="gap-1">
                                        Status: {filters.status}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => updateFilter('status', 'all')}
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
                                )}
                                {(filters.dateFrom || filters.dateTo) && filters.dateRange === 'all' && (
                                    <Badge variant="outline" className="gap-1">
                                        Custom Date: {filters.dateFrom || 'Start'} - {filters.dateTo || 'End'}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => {
                                                updateFilter('dateFrom', '')
                                                updateFilter('dateTo', '')
                                            }}
                                        />
                                    </Badge>
                                )}
                                {filters.amountRange && filters.amountRange !== 'all' && (
                                    <Badge variant="outline" className="gap-1">
                                        Amount: {amountRanges.find(a => a.value === filters.amountRange)?.label || filters.amountRange}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => updateFilter('amountRange', 'all')}
                                        />
                                    </Badge>
                                )}
                                {(filters.amountMin || filters.amountMax) && filters.amountRange === 'all' && (
                                    <Badge variant="outline" className="gap-1">
                                        Custom Amount: ${filters.amountMin || '0'} - ${filters.amountMax || '∞'}
                                        <X 
                                            className="h-3 w-3 cursor-pointer" 
                                            onClick={() => {
                                                updateFilter('amountMin', '')
                                                updateFilter('amountMax', '')
                                            }}
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

export default ClientQuoteFilters