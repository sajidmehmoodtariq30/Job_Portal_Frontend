// src/pages/admin/AdminCategories.jsx
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/UI/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog'
import { Input } from '@/components/UI/input'
import { Label } from '@/components/UI/label'
import { Textarea } from '@/components/UI/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select'
import { Badge } from '@/components/UI/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/UI/dropdown-menu'
import { Plus, Settings, Trash2, Edit, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import { API_URL } from '@/lib/apiConfig'

const AdminCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)
      // Form state
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: '',
        category_type: 'general',
        allowed_roles: ['Administrator', 'Office Manager', 'Technician']
    })
    
    // Filter state
    const [filterType, setFilterType] = useState('all')
    const [filterRole, setFilterRole] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Available roles for assignment
    const availableRoles = [
        'Administrator',
        'Office Manager', 
        'Technician',
        'Technician Apprentice',
        'Client Admin',
        'Client User'
    ]    // Category types
    const categoryTypes = [
        { value: 'general', label: 'General' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'project', label: 'Project' }
    ]

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${API_URL}/api/categories`)
            setCategories(response.data)
            setError(null)
        } catch (error) {
            console.error('Error fetching categories:', error)
            setError('Failed to fetch categories')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCategory = async () => {
        try {
            if (!newCategory.name.trim()) {
                alert('Category name is required')
                return
            }

            const response = await axios.post(`${API_URL}/api/categories`, newCategory)
            setCategories([...categories, response.data])
            setIsCreateDialogOpen(false)
            resetForm()
        } catch (error) {
            console.error('Error creating category:', error)
            alert('Failed to create category: ' + (error.response?.data?.details || error.message))
        }
    }

    const handleEditCategory = async () => {
        try {
            const response = await axios.put(
                `${API_URL}/api/categories/${selectedCategory.uuid}`, 
                newCategory
            )
            setCategories(categories.map(cat => 
                cat.uuid === selectedCategory.uuid ? response.data : cat
            ))
            setIsEditDialogOpen(false)
            resetForm()
        } catch (error) {
            console.error('Error updating category:', error)
            alert('Failed to update category: ' + (error.response?.data?.details || error.message))
        }
    }

    const handleDeleteCategory = async (categoryUuid) => {
        if (!confirm('Are you sure you want to archive this category? This action cannot be undone.')) {
            return
        }

        try {
            await axios.delete(`${API_URL}/api/categories/${categoryUuid}`)
            setCategories(categories.filter(cat => cat.uuid !== categoryUuid))
        } catch (error) {
            console.error('Error deleting category:', error)
            alert('Failed to delete category: ' + (error.response?.data?.details || error.message))
        }
    }

    const handleEditClick = (category) => {
        setSelectedCategory(category)
        setNewCategory({
            name: category.name,
            description: category.description || '',
            category_type: category.category_type || 'general',
            allowed_roles: category.allowed_roles || ['Administrator', 'Office Manager', 'Technician']
        })
        setIsEditDialogOpen(true)
    }

    const resetForm = () => {
        setNewCategory({
            name: '',
            description: '',
            category_type: 'general',
            allowed_roles: ['Administrator', 'Office Manager', 'Technician']
        })
        setSelectedCategory(null)
    }

    const toggleRole = (role) => {
        const currentRoles = newCategory.allowed_roles
        if (currentRoles.includes(role)) {
            setNewCategory({
                ...newCategory,
                allowed_roles: currentRoles.filter(r => r !== role)
            })
        } else {
            setNewCategory({
                ...newCategory,
                allowed_roles: [...currentRoles, role]
            })
        }
    }

    // Apply filters
    const filteredCategories = categories.filter(category => {
        const matchesType = filterType === 'all' || category.category_type === filterType
        const matchesRole = filterRole === 'all' || category.allowed_roles?.includes(filterRole)
        const matchesSearch = !searchQuery || 
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description?.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesType && matchesRole && matchesSearch
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading categories...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <Card className="w-96">
                    <CardContent className="pt-6">
                        <div className="text-center text-red-600">
                            <p className="font-medium">Error loading categories</p>
                            <p className="text-sm mt-1">{error}</p>
                            <Button onClick={fetchCategories} className="mt-4">
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Category Management</h1>
                    <p className="text-muted-foreground">Manage job categories and role-based access</p>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Category</DialogTitle>
                            <DialogDescription>
                                Add a new job category with role-based access controls.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Category Name</Label>
                                <Input
                                    id="name"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    placeholder="e.g., HVAC Maintenance"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                    placeholder="Brief description of this category"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="type">Category Type</Label>
                                <Select
                                    value={newCategory.category_type}
                                    onValueChange={(value) => setNewCategory({ ...newCategory, category_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Allowed Roles</Label>
                                <div className="flex flex-wrap gap-2">
                                    {availableRoles.map(role => (
                                        <Badge
                                            key={role}
                                            variant={newCategory.allowed_roles.includes(role) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => toggleRole(role)}
                                        >
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Click roles to toggle access permissions
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateCategory} disabled={!newCategory.name.trim()}>
                                Create Category
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="filterType">Type</Label>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    {categoryTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="filterRole">Role Access</Label>
                            <Select value={filterRole} onValueChange={setFilterRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>                                <SelectContent>
                                    <SelectItem value="all">All roles</SelectItem>
                                    {availableRoles.map(role => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Categories List */}
            <div className="grid gap-4">
                {filteredCategories.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center text-muted-foreground">
                                <p>No categories found</p>
                                <p className="text-sm mt-1">
                                    {categories.length === 0 
                                        ? "Create your first category to get started"
                                        : "Try adjusting your filters"
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredCategories.map(category => (
                        <Card key={category.uuid}>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold">{category.name}</h3>
                                            <Badge variant="outline">
                                                {categoryTypes.find(t => t.value === category.category_type)?.label || 'General'}
                                            </Badge>
                                        </div>
                                        
                                        {category.description && (
                                            <p className="text-muted-foreground mb-3">{category.description}</p>
                                        )}
                                        
                                        <div>
                                            <p className="text-sm font-medium mb-2">Accessible by:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {(category.allowed_roles || []).map(role => (
                                                    <Badge key={role} variant="secondary" className="text-xs">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditClick(category)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleDeleteCategory(category.uuid)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Archive
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update category details and access permissions.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Category Name</Label>
                            <Input
                                id="edit-name"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-type">Category Type</Label>
                            <Select
                                value={newCategory.category_type}
                                onValueChange={(value) => setNewCategory({ ...newCategory, category_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Allowed Roles</Label>
                            <div className="flex flex-wrap gap-2">
                                {availableRoles.map(role => (
                                    <Badge
                                        key={role}
                                        variant={newCategory.allowed_roles.includes(role) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => toggleRole(role)}
                                    >
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditCategory}>
                            Update Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AdminCategories
