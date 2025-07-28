import React, { useState, useEffect } from 'react'
import { Button } from "@/components/UI/button"
import { Input } from "@/components/UI/input"
import { Label } from "@/components/UI/label"
import { Switch } from "@/components/UI/switch"
import SearchableSelect from "@/components/UI/SearchableSelect"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/UI/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/UI/alert-dialog"
import { Eye, EyeOff, Loader2, Mail, UserPlus, Edit, Trash2, KeyRound, MapPin, Shield } from 'lucide-react'
import API_ENDPOINTS from "@/lib/apiConfig"
import UserPermissionManager from '@/components/admin/UserPermissionManager'
import { PERMISSIONS, PERMISSION_LABELS } from '@/context/PermissionsContext'
import { Badge } from '@/components/UI/badge'
import { Checkbox } from '@/components/UI/checkbox'
import { triggerRealTimeUpdate, NOTIFICATION_TYPES } from '@/utils/realTimeUpdates'

const AdminUsers = () => {  const [users, setUsers] = useState([])
  const [clients, setClients] = useState([]) // Add clients state
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [newUser, setNewUser] = useState({
    name: '',
    username: '', 
    email: '',
    assignedClientUuid: 'none', // Use 'none' instead of empty string
    permissions: []
  })
  const [editUser, setEditUser] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userPassword, setUserPassword] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  // Sites-related state
  const [isSitesDialogOpen, setIsSitesDialogOpen] = useState(false)
  const [userSites, setUserSites] = useState([])
  const [sitesLoading, setSitesLoading] = useState(false)
  // Bulk operations state
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [bulkClientUuid, setBulkClientUuid] = useState('none')
  const [bulkLoading, setBulkLoading] = useState(false)

  // Permission management state
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState(null)
  const [newUserPermissions, setNewUserPermissions] = useState({})

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
    fetchClients() // Also fetch clients
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_ENDPOINTS.USERS.FETCH_ALL)
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
      } else {
        alert("Failed to fetch users")
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      alert("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }
  const fetchClients = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CLIENTS.FETCH_ALL)
      const data = await response.json()
      setClients(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      setClients([])
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    if (!newUser.name || !newUser.username || !newUser.email) {
      alert("All fields are required")
      return
    }

    try {
      setActionLoading('create')
      const response = await fetch(API_ENDPOINTS.USERS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })
      const data = await response.json()
      if (data.success) {
        alert("User created successfully! Password setup email sent.")
        setUsers([...users, data.data])
        setNewUser({ name: '', username: '', email: '', assignedClientUuid: 'none', permissions: [] }) // Reset with permissions
        setIsCreateDialogOpen(false)
      } else {
        alert(data.message || "Failed to create user")
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert("Failed to create user")
    } finally {
      setActionLoading('')
    }
  }
  const handleEditUser = async (e) => {
    e.preventDefault()
    if (!editUser.name || !editUser.username || !editUser.email) {
      alert("All fields are required")
      return
    }    try {
      setActionLoading('edit');
      const response = await fetch(API_ENDPOINTS.USERS.UPDATE(editUser.uuid), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editUser)
      });
      const data = await response.json();
      
      if (data.success) {
        alert("User updated successfully")
        setUsers(users.map(user =>
          user.uuid === editUser.uuid ? data.data : user
        ))
        
        // Trigger real-time update if client assignment changed
        const oldUser = users.find(u => u.uuid === editUser.uuid);
        if (oldUser && oldUser.assignedClientUuid !== editUser.assignedClientUuid) {
          triggerRealTimeUpdate(NOTIFICATION_TYPES.CLIENT_MAPPING_UPDATED, {
            userId: editUser.uuid,
            oldClientUuid: oldUser.assignedClientUuid,
            newClientUuid: editUser.assignedClientUuid,
            updatedBy: 'admin',
            timestamp: Date.now()
          });
        }
        
        setEditUser(null)
        setIsEditDialogOpen(false)
      } else {
        alert(data.message || "Failed to update user")
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert("Failed to update user")
    } finally {
      setActionLoading('')
    }
  }
  const handleToggleActive = async (user) => {
    try {
      setActionLoading(`toggle-${user.uuid}`)
      const response = await fetch(API_ENDPOINTS.USERS.UPDATE_STATUS(user.uuid), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !user.isActive
        })      })

      const data = await response.json()

      if (data.success) {
        alert(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`)
        setUsers(users.map(u =>
          u.uuid === user.uuid ? { ...u, isActive: !user.isActive } : u
        ))
        
        // Trigger real-time update for user status change
        triggerRealTimeUpdate(NOTIFICATION_TYPES.USER_STATUS_UPDATED, {
          userId: user.uuid,
          isActive: !user.isActive,
          updatedBy: 'admin',
          timestamp: Date.now()
        });
      } else {
        alert(data.message || "Failed to update user status")
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      alert("Failed to update user status")
    } finally {
      setActionLoading('')
    }
  }
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setActionLoading('delete')
      const response = await fetch(API_ENDPOINTS.USERS.DELETE(selectedUser.uuid), {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        const clientInfo = data.data?.deletedUser?.previousClientUuid 
          ? ` Client relationship detached but client ${data.data.deletedUser.previousClientUuid} remains intact.`
          : '';
        alert(`User deleted successfully.${clientInfo}`)
        // Remove user completely from the list
        setUsers(users.filter(u => u.uuid !== selectedUser.uuid))
      } else {
        if (data.message?.includes('User not found')) {
          alert("User not found. It may have already been deleted. Refreshing the list...")
          // Refresh the user list
          window.location.reload()
        } else {
          alert(data.message || "Failed to delete user")
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      if (error.message?.includes('User not found')) {
        alert("User not found. It may have already been deleted. Refreshing the list...")
        window.location.reload()
      } else {
        alert("Failed to delete user")
      }
    } finally {
      setActionLoading('')
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleViewPassword = async (user) => {
    try {
      setActionLoading(`password-${user.uuid}`)
      const response = await fetch(API_ENDPOINTS.USERS.GET_PASSWORD(user.uuid))
      const data = await response.json()
      if (data.success) {
        setUserPassword(data.data)
        setSelectedUser(user)
        setIsPasswordDialogOpen(true)
      } else {
        alert(data.message || "Failed to fetch password")
      }
    } catch (error) {
      console.error('Error fetching password:', error)
      alert("Failed to fetch password")
    } finally {
      setActionLoading('')
    }
  }

  const handleResendSetup = async (user) => {
    try {
      setActionLoading(`resend-${user.uuid}`)
      const response = await fetch(API_ENDPOINTS.USERS.RESEND_SETUP(user.uuid), {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        alert("Password setup email sent successfully")
      } else {
        alert(data.message || "Failed to send email")
      }
    } catch (error) {
      console.error('Error resending setup email:', error)
      alert("Failed to send email")
    } finally {
      setActionLoading('')
    }
  }

  const fetchUserSites = async (user) => {
    if (!user.assignedClientUuid || user.assignedClientUuid === 'none') {
      setUserSites([])
      return
    }

    try {
      setSitesLoading(true)
      const response = await fetch(API_ENDPOINTS.USERS.GET_CLIENT_SITES(user.uuid))
      const data = await response.json()

      if (data.success) {
        setUserSites(data.data || [])
      } else {
        setUserSites([])
        console.error('Failed to fetch user sites:', data.message)
      }
    } catch (error) {
      console.error('Error fetching user sites:', error)
      setUserSites([])
    } finally {
      setSitesLoading(false)
    }
  }

  const handleViewSites = (user) => {
    setSelectedUser(user)
    setIsSitesDialogOpen(true)
    fetchUserSites(user)
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openEditDialog = (user) => {
    setEditUser({ ...user })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (user) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }
  const closePasswordDialog = () => {
    setIsPasswordDialogOpen(false)
    setUserPassword(null)
    setSelectedUser(null)
    setShowPassword(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!newPassword.trim()) {
      alert("Please enter a new password")
      return
    }

    try {
      setActionLoading('change-password')
      const response = await fetch(API_ENDPOINTS.USERS.UPDATE_PASSWORD(selectedUser.uuid), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },        body: JSON.stringify({
          newPassword: newPassword
        })
      })

      const data = await response.json()
      if (data.success) {
        alert("Password changed successfully")
        setNewPassword('')
        setIsChangePasswordDialogOpen(false)
        // Update user status if password was set for the first time
        if (selectedUser.passwordSetupRequired) {
          setUsers(users.map(u =>
            u.uuid === selectedUser.uuid
              ? { ...u, passwordSetupRequired: false }
              : u
          ))
        }
      } else {
        alert(data.message || "Failed to change password")
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert("Failed to change password")
    } finally {
      setActionLoading('')
    }
  }

  const openChangePasswordDialog = (user) => {
    setSelectedUser(user)
    setNewPassword('')
    setIsChangePasswordDialogOpen(true)
  }
  // Helper function to get client name by UUID
  const getClientName = (clientUuid) => {
    if (!clientUuid || clientUuid === 'none') return 'No Client Assigned'
    const client = clients.find(c => c.uuid === clientUuid)
    return client ? client.name || client.uuid : 'Unknown Client'
  }

  // Bulk operations functions
  const handleSelectUser = (userUuid) => {
    setSelectedUsers(prev =>
      prev.includes(userUuid)
        ? prev.filter(id => id !== userUuid)
        : [...prev, userUuid]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.uuid))
    }
  }

  const handleBulkAssignClient = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user')
      return
    }

    try {
      setBulkLoading(true)
      const promises = selectedUsers.map(userUuid => {
        const user = users.find(u => u.uuid === userUuid)
        return fetch(API_ENDPOINTS.USERS.UPDATE(userUuid), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...user,
            assignedClientUuid: bulkClientUuid === 'none' ? '' : bulkClientUuid
          })
        })
      })

      const responses = await Promise.all(promises)
      const results = await Promise.all(responses.map(r => r.json()))

      const successful = results.filter(r => r.success).length
      const failed = results.length - successful

      if (successful > 0) {
        // Update local state
        setUsers(users.map(user => {
          if (selectedUsers.includes(user.uuid)) {
            return {
              ...user,
              assignedClientUuid: bulkClientUuid === 'none' ? '' : bulkClientUuid
            }
          }
          return user
        }))

        alert(`Successfully updated ${successful} users${failed > 0 ? `, ${failed} failed` : ''}`)
        setSelectedUsers([])
        setIsBulkDialogOpen(false)
        setBulkClientUuid('none')
      } else {
        alert('Failed to update users')
      }
    } catch (error) {
      console.error('Error updating users:', error)
      alert('Failed to update users')
    } finally {
      setBulkLoading(false)
    }
  }

  // Permission management functions
  const handlePermissionChange = (permission, checked) => {
    setNewUserPermissions(prev => ({
      ...prev,
      [permission]: checked
    }))
  }

  const handleNewUserPermissionChange = (permission, checked) => {
    setNewUser(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }))
  }

  const handleManagePermissions = (user) => {
    setSelectedUserForPermissions(user)
    setIsPermissionDialogOpen(true)
  }

  const handlePermissionsUpdate = (userId, newPermissions) => {
    setUsers(prev => prev.map(user => 
      user.uuid === userId 
        ? { ...user, permissions: newPermissions }
        : user
    ))
  }

  const renderPermissionBadges = (userPermissions = []) => {
    if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
      return <Badge variant="outline" className="text-xs">No permissions</Badge>
    }

    return (
      <div className="flex flex-wrap gap-1">
        {userPermissions.slice(0, 2).map(permission => (
          <Badge key={permission} variant="secondary" className="text-xs">
            {PERMISSION_LABELS[permission] || permission}
          </Badge>
        ))}
        {userPermissions.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{userPermissions.length - 2} more
          </Badge>
        )}
      </div>
    )
  }

  const handleBulkAction = (action, userUuids) => {
    // Implement bulk action logic here
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between items-center">
        <div className="flex w-full justify-between p-5  items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
          <div className="flex gap-2">
            {selectedUsers.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setIsBulkDialogOpen(true)}
              >
                Bulk Assign ({selectedUsers.length})
              </Button>
            )}          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account. They will receive an email with password setup instructions.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        required
                      />
                    </div>                <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                      />
                    </div>                    <div className="grid gap-2">
                      <Label htmlFor="client">Assign to Client (Optional)</Label>
                      <SearchableSelect
                        items={clients}
                        value={newUser.assignedClientUuid === 'none' ? '' : newUser.assignedClientUuid}
                        onValueChange={(value) => setNewUser({
                          ...newUser,
                          assignedClientUuid: value || 'none'
                        })}
                        placeholder="Select a client..."
                        searchPlaceholder="Search by client name..."
                        displayKey="name"
                        valueKey="uuid"
                        searchKeys={['name', 'uuid']}
                        allowClear={true}
                        noItemsText="No clients available"
                        noResultsText="No clients found matching your search"                        renderSelected={(client) => client.name || client.uuid}
                      />
                    </div>
                    
                    {/* Permissions Section */}
                    <div className="grid gap-2">
                      <Label>User Permissions</Label>
                      <div className="space-y-3 max-h-40 overflow-y-auto border rounded-lg p-3">
                        {Object.values(PERMISSIONS).map((permission) => (
                          <div key={permission} className="flex items-start space-x-2">
                            <Checkbox
                              id={`new-user-${permission}`}
                              checked={newUser.permissions.includes(permission)}
                              onCheckedChange={(checked) => handleNewUserPermissionChange(permission, checked)}
                            />
                            <div className="grid gap-1 leading-none">
                              <Label 
                                htmlFor={`new-user-${permission}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {PERMISSION_LABELS[permission]}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={actionLoading === 'create'}>
                      {actionLoading === 'create' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create User
                    </Button>
                  </DialogFooter>
                </form>          </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className={"w-full max-w-7xl mx-auto"}>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts and access</CardDescription>
            <div className="mt-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading users...</span>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={handleSelectAll}
                          className="mr-2"
                        />
                      </th>
                      <th className="py-3 text-left">S.No</th>
                      <th className="py-3 text-left">Name</th>
                      <th className="py-3 text-left">Username</th>                      <th className="py-3 text-left">Email</th>
                      <th className="py-3 text-left">Assigned Client</th>
                      <th className="py-3 text-left">Permissions</th>
                      <th className="py-3 text-left">Status</th>
                      <th className="py-3 text-left">Password Setup</th>
                      <th className="py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={user.uuid} className="border-b">
                        <td className="py-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.uuid)}
                            onChange={() => handleSelectUser(user.uuid)}
                          />
                        </td>
                        <td className="py-3">{index + 1}</td>
                        <td className="py-3 font-medium">{user.name}</td>
                        <td className="py-3">{user.username}</td>
                        <td className="py-3">{user.email}</td>                        <td className="py-3 text-sm text-gray-600">
                          {getClientName(user.assignedClientUuid)}
                        </td>
                        <td className="py-3">
                          {renderPermissionBadges(user.permissions)}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => handleToggleActive(user)}
                              disabled={actionLoading === `toggle-${user.uuid}`}
                            />
                            <span className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${!user.passwordSetupRequired
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {!user.passwordSetupRequired ? 'Complete' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              disabled={actionLoading.includes(user.uuid)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPassword(user)}
                              disabled={actionLoading === `password-${user.uuid}`}
                            >                            <Eye className="w-4 h-4" />
                            </Button>                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleManagePermissions(user)}
                              disabled={actionLoading.includes(user.uuid)}
                              title="Manage Permissions"
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openChangePasswordDialog(user)}
                              disabled={actionLoading === `password-${user.uuid}`}
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>
                            {user.assignedClientUuid && user.assignedClientUuid !== 'none' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewSites(user)}
                                disabled={actionLoading.includes(user.uuid)}
                                title="View Client Sites"
                              >
                                <MapPin className="w-4 h-4" />
                              </Button>
                            )}
                            {user.passwordSetupRequired && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResendSetup(user)}
                                disabled={actionLoading === `resend-${user.uuid}`}
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(user)}
                              disabled={actionLoading.includes(user.uuid)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}                  {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="9" className="py-4 text-center text-muted-foreground">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information
              </DialogDescription>
            </DialogHeader>
            {editUser && (
              <form onSubmit={handleEditUser}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={editUser.name}
                      onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-username">Username</Label>
                    <Input
                      id="edit-username"
                      value={editUser.username}
                      onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                      required
                    />
                  </div>                <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email Address</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                      required
                    />
                  </div>                  <div className="grid gap-2">
                    <Label htmlFor="edit-client">Assign to Client (Optional)</Label>
                    <SearchableSelect
                      items={clients}
                      value={editUser.assignedClientUuid === 'none' ? '' : editUser.assignedClientUuid}
                      onValueChange={(value) => setEditUser({
                        ...editUser,
                        assignedClientUuid: value || 'none'
                      })}
                      placeholder="Select a client..."
                      searchPlaceholder="Search by client name..."
                      displayKey="name"
                      valueKey="uuid"
                      searchKeys={['name', 'uuid']}
                      allowClear={true}
                      noItemsText="No clients available"
                      noResultsText="No clients found matching your search"
                      renderSelected={(client) => client.name || client.uuid}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editUser.isActive}
                      onCheckedChange={(checked) => setEditUser({ ...editUser, isActive: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={actionLoading === 'edit'}>
                    {actionLoading === 'edit' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update User
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Set a new password for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePassword}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={actionLoading === 'change-password'}>
                  {actionLoading === 'change-password' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Change Password
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Password View Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={closePasswordDialog}>
          <DialogContent>          <DialogHeader>
            <DialogTitle>User Account Information</DialogTitle>
            <DialogDescription>
              Password and setup information for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>{userPassword && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Password Setup Status</Label>
                <span className={`px-2 py-1 rounded text-xs w-fit ${userPassword.hasPassword
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {userPassword.hasPassword ? 'Password Set' : 'Setup Required'}
                </span>
              </div>

              <div className="grid gap-2">
                <Label>Status Message</Label>
                <p className="text-sm text-gray-600">{userPassword.message}</p>
              </div>

              {userPassword.setupUrl && (
                <div className="grid gap-2">
                  <Label>Password Setup Link</Label>
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-sm text-gray-600 mb-2">Share this link with the user to set up their password:</p>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={userPassword.setupUrl}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(userPassword.setupUrl)
                          alert('Setup link copied to clipboard!')
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {userPassword.setupToken && (
                <div className="grid gap-2">
                  <Label>Setup Token</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={userPassword.setupToken}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(userPassword.setupToken)
                        alert('Token copied to clipboard!')
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}

              {userPassword.lastUpdated && (
                <div className="grid gap-2">
                  <Label>Last Updated</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(userPassword.lastUpdated).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to deactivate {selectedUser?.name}?
                This will prevent them from accessing the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={actionLoading === 'delete'}
              >
                {actionLoading === 'delete' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Sites View Dialog */}
        <Dialog open={isSitesDialogOpen} onOpenChange={setIsSitesDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Client Sites</DialogTitle>
              <DialogDescription>
                Sites for {selectedUser?.name}'s assigned client: {getClientName(selectedUser?.assignedClientUuid)}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-96 overflow-y-auto">
              {sitesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading sites...</span>
                </div>
              ) : userSites.length > 0 ? (
                <div className="grid gap-4">
                  {userSites.map((site, index) => (
                    <div key={site.uuid || index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="font-semibold text-lg">{site.name || 'Unnamed Site'}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Site ID: {site.uuid || 'N/A'}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div><strong>Address:</strong> {site.address || 'Not provided'}</div>
                          <div><strong>City:</strong> {site.city || 'Not provided'}</div>
                          <div><strong>State:</strong> {site.state || 'Not provided'}</div>
                          <div><strong>Postcode:</strong> {site.postcode || 'Not provided'}</div>
                        </div>
                      </div>
                      {site.description && (
                        <div className="mt-3 text-sm text-gray-600">
                          <strong>Description:</strong> {site.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No sites found for this client</p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setIsSitesDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Assignment Dialog */}
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Assign Client</DialogTitle>
              <DialogDescription>
                Assign {selectedUsers.length} selected user(s) to a client
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="bulk-client">Select Client</Label>
                <Select
                  value={bulkClientUuid}
                  onValueChange={setBulkClientUuid}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Client Assigned</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.uuid} value={client.uuid}>
                        {client.name || client.uuid}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Selected Users</Label>
                <div className="max-h-32 overflow-y-auto border rounded p-2">
                  {selectedUsers.map(userUuid => {
                    const user = users.find(u => u.uuid === userUuid)
                    return (
                      <div key={userUuid} className="text-sm py-1">
                        {user?.name} ({user?.email})
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsBulkDialogOpen(false)
                  setBulkClientUuid('none')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkAssignClient}
                disabled={bulkLoading}
              >
                {bulkLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Assign Client'
                )}
              </Button>          </DialogFooter>        </DialogContent>      </Dialog>

        {/* Permission Management Dialog */}
        <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Permissions</DialogTitle>
              <DialogDescription>
                Update permissions for {selectedUserForPermissions?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedUserForPermissions && (
              <form onSubmit={(e) => {
                e.preventDefault()
                handlePermissionsUpdate(selectedUserForPermissions.uuid, Object.keys(newUserPermissions).filter(key => newUserPermissions[key]))
              }}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Available Permissions</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.keys(PERMISSIONS).map(permission => (
                        <div key={permission} className="flex items-center">
                          <Checkbox
                            id={`permission-${permission}`}
                            checked={newUserPermissions[permission]}
                            onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
                          />
                          <Label htmlFor={`permission-${permission}`} className="ml-2">
                            {PERMISSION_LABELS[permission]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={actionLoading === 'edit'}>
                    {actionLoading === 'edit' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Permissions
                  </Button>
                </DialogFooter>              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* User Permission Manager */}
        <UserPermissionManager
          isOpen={isPermissionDialogOpen}
          onClose={() => setIsPermissionDialogOpen(false)}
          userId={selectedUserForPermissions?.uuid}
          userName={selectedUserForPermissions?.name}
          userEmail={selectedUserForPermissions?.email}
          currentPermissions={selectedUserForPermissions?.permissions || []}
          onPermissionsUpdate={handlePermissionsUpdate}
        />
      </div>
    </div>
  )
}

export default AdminUsers