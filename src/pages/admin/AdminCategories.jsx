// src/pages/admin/AdminCategories.jsx
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card'
import { Input } from '@/components/UI/input'
import { Label } from '@/components/UI/label'
import { Badge } from '@/components/UI/badge'
import { Search, Settings, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/UI/skeleton'
import axios from 'axios'
import { API_URL } from '@/lib/apiConfig'

const AdminCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    // Search state
    const [searchQuery, setSearchQuery] = useState('')

    // Category types for display
    const categoryTypes = [
        { value: 'general', label: 'General', color: 'bg-blue-100 text-blue-800' },
        { value: 'maintenance', label: 'Maintenance', color: 'bg-green-100 text-green-800' },
        { value: 'project', label: 'Project', color: 'bg-purple-100 text-purple-800' }
    ]

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axios.get(`${API_URL}/api/categories`)
            setCategories(response.data)
        } catch (error) {
            console.error('Error fetching categories:', error)
            setError('Failed to fetch categories. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const getCategoryTypeInfo = (type) => {
        return categoryTypes.find(t => t.value === type) || categoryTypes[0]
    }

    // Apply search filter
    const filteredCategories = React.useMemo(() => {
        return categories.filter(category => {
            const matchesSearch = !searchQuery || 
                category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchQuery.toLowerCase())

            return matchesSearch
        })
    }, [categories, searchQuery])

    // Skeleton loading component
    const CategorySkeleton = () => (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-5 w-14 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    // Loading state with skeleton
    if (loading) {
        return (
            <div className="space-y-8 p-6">
                {/* Header Skeleton */}
                <div className="space-y-1">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>

                {/* Search Bar Skeleton */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="grid gap-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <CategorySkeleton key={index} />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Card className="w-96 border-red-200">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="font-medium text-lg mb-2 text-red-600">Error Loading Categories</h3>
                            <p className="text-muted-foreground mb-4">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }    return (
        <div className="space-y-8 p-6 admin-content">
            {/* Header Section */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
                <p className="text-muted-foreground">
                    View and manage job categories with role-based access permissions
                </p>
            </div>

            {/* Search Section */}
            <Card className="admin-card shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        <CardTitle className="text-lg">Search Categories</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Search Categories
                        </Label>
                        <Input
                            id="search"
                            placeholder="Search by name or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10"
                        />
                        {filteredCategories.length !== categories.length && (
                            <p className="text-sm text-muted-foreground mt-2">
                                Showing {filteredCategories.length} of {categories.length} categories
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Categories List */}
            <div className="space-y-4">
                {filteredCategories.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="pt-8 pb-8">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Settings className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-medium text-lg mb-2">
                                    {categories.length === 0 ? 'No Categories Yet' : 'No Categories Found'}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {categories.length === 0 
                                        ? "No categories have been configured yet. Please contact your administrator."
                                        : "Try adjusting your search to find what you're looking for"
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Results Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                {filteredCategories.length === 1 ? '1 Category' : `${filteredCategories.length} Categories`}
                            </h2>
                        </div>

                        {/* Categories Grid */}
                        <div className="grid gap-4">
                            {filteredCategories.map(category => {
                                const typeInfo = getCategoryTypeInfo(category.category_type)
                                return (
                                    <Card key={category.uuid} className="hover:shadow-md transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    {/* Category Header */}
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-xl font-semibold">{category.name}</h3>
                                                        <Badge 
                                                            variant="secondary" 
                                                            className={`${typeInfo.color} border-0`}
                                                        >
                                                            {typeInfo.label}
                                                        </Badge>
                                                    </div>
                                                    
                                                    {/* Description */}
                                                    {category.description && (
                                                        <p className="text-muted-foreground mb-4 leading-relaxed">
                                                            {category.description}
                                                        </p>
                                                    )}
                                                    
                                                    {/* Roles Section */}
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium text-muted-foreground">
                                                            Accessible by:
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(category.allowed_roles || []).map(role => (
                                                                <Badge 
                                                                    key={role} 
                                                                    variant="outline" 
                                                                    className="text-xs bg-primary/5 border-primary/20"
                                                                >
                                                                    {role}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AdminCategories
