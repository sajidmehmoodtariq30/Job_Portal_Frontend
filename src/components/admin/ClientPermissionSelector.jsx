import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { 
  PERMISSION_CATEGORIES, 
  PERMISSION_LABELS, 
  CLIENT_PERMISSION_TEMPLATES,
  CLIENT_PERMISSIONS
} from '@/types/clientPermissions';

const ClientPermissionSelector = ({ selectedPermissions, onPermissionChange }) => {
  const [activeTemplate, setActiveTemplate] = useState('');

  const handlePermissionToggle = (permission) => {
    const updatedPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter(p => p !== permission)
      : [...selectedPermissions, permission];
    
    onPermissionChange(updatedPermissions);
  };

  const handleTemplateSelect = (templateName) => {
    const templatePermissions = CLIENT_PERMISSION_TEMPLATES[templateName];
    onPermissionChange(templatePermissions);
    setActiveTemplate(templateName);
  };

  const handleSelectAll = () => {
    onPermissionChange(Object.values(CLIENT_PERMISSIONS));
  };

  const handleClearAll = () => {
    onPermissionChange([]);
    setActiveTemplate('');
  };

  const getCategoryPermissionCount = (categoryPermissions) => {
    return categoryPermissions.filter(permission => 
      selectedPermissions.includes(permission)
    ).length;
  };

  return (
    <div className="space-y-4">
      {/* Permission Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.keys(CLIENT_PERMISSION_TEMPLATES).map(templateName => (
              <Button
                key={templateName}
                variant={activeTemplate === templateName ? "default" : "outline"}
                size="sm"
                onClick={() => handleTemplateSelect(templateName)}
              >
                {templateName}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Permission Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Client Permissions 
            <Badge variant="secondary" className="ml-2">
              {selectedPermissions.length} selected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">By Category</TabsTrigger>
              <TabsTrigger value="all">All Permissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories" className="space-y-4">
              {Object.entries(PERMISSION_CATEGORIES).map(([categoryName, categoryPermissions]) => {
                const selectedCount = getCategoryPermissionCount(categoryPermissions);
                const isAllSelected = selectedCount === categoryPermissions.length;
                const isPartiallySelected = selectedCount > 0 && selectedCount < categoryPermissions.length;

                return (
                  <Card key={categoryName}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{categoryName}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {selectedCount}/{categoryPermissions.length}
                          </Badge>
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = isPartiallySelected;
                            }}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const newPermissions = [
                                  ...selectedPermissions.filter(p => !categoryPermissions.includes(p)),
                                  ...categoryPermissions
                                ];
                                onPermissionChange(newPermissions);
                              } else {
                                const newPermissions = selectedPermissions.filter(p => 
                                  !categoryPermissions.includes(p)
                                );
                                onPermissionChange(newPermissions);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {categoryPermissions.map(permission => (
                        <div key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={permission}
                            checked={selectedPermissions.includes(permission)}
                            onChange={() => handlePermissionToggle(permission)}
                          />
                          <label 
                            htmlFor={permission} 
                            className="text-sm cursor-pointer flex-1"
                          >
                            {PERMISSION_LABELS[permission]}
                          </label>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="all" className="space-y-2">
              {Object.entries(PERMISSION_LABELS).map(([permission, label]) => (
                <div key={permission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={permission}
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                  />
                  <label htmlFor={permission} className="text-sm cursor-pointer flex-1">
                    {label}
                  </label>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPermissionSelector;
