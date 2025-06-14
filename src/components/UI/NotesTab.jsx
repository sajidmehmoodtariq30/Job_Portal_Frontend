import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import { Label } from "@/components/UI/label";
import { Badge } from "@/components/UI/badge";
import { Trash2, Edit3, Save, X, Plus, StickyNote } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apiConfig';

const NotesTab = ({ jobId, userType = 'admin' }) => {
  // State management
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [editNoteText, setEditNoteText] = useState('');
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Get user info from localStorage
  const getUserInfo = () => {
    const userInfo = JSON.parse(localStorage.getItem(userType === 'admin' ? 'adminInfo' : 'userInfo') || '{}');
    return {
      name: userInfo.name || userInfo.email || (userType === 'admin' ? 'Admin' : 'Client'),
      id: userInfo.id || userInfo.uuid || '',
      uuid: userInfo.uuid || userInfo.id || ''
    };
  };

  // Fetch notes for the job
  const fetchNotes = async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_ENDPOINTS.NOTES.GET_BY_JOB(jobId));
      
      if (response.data.success) {
        setNotes(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError('Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add a new note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const user = getUserInfo();
      
      const noteData = {
        jobId,
        noteText: newNote.trim(),
        author: user.name,
        userType,
        staffUuid: userType === 'admin' ? user.uuid : null
      };
      
      const response = await axios.post(API_ENDPOINTS.NOTES.CREATE, noteData);
      
      if (response.data.success) {
        setNewNote('');
        setIsAddingNote(false);
        fetchNotes(); // Refresh notes list
      }
    } catch (err) {
      console.error('Failed to add note:', err);
      setError('Failed to add note. Please try again.');
    }
  };

  // Start editing a note
  const startEditing = (note) => {
    setEditingNoteId(note.uuid);
    setEditNoteText(note.note || '');
  };

  // Save edited note
  const handleSaveEdit = async (noteId) => {
    if (!editNoteText.trim()) return;
    
    try {
      const user = getUserInfo();
      
      const updateData = {
        noteText: editNoteText.trim(),
        author: user.name
      };
      
      const response = await axios.put(API_ENDPOINTS.NOTES.UPDATE(noteId), updateData);
      
      if (response.data.success) {
        setEditingNoteId(null);
        setEditNoteText('');
        fetchNotes(); // Refresh notes list
      }
    } catch (err) {
      console.error('Failed to update note:', err);
      setError('Failed to update note. Please try again.');
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditNoteText('');
  };

  // Initiate delete process
  const initiateDelete = (note) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    
    try {
      const response = await axios.delete(API_ENDPOINTS.NOTES.DELETE(noteToDelete.uuid));
      
      if (response.data.success) {
        setDeleteDialogOpen(false);
        setNoteToDelete(null);
        fetchNotes(); // Refresh notes list
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
      setError('Failed to delete note. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Initial fetch
  useEffect(() => {
    if (jobId) {
      fetchNotes();
    }
  }, [jobId]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <StickyNote className="w-5 h-5 mr-2" />
              Job Notes
              {notes.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notes.length}
                </Badge>
              )}
            </CardTitle>
            <Button size="sm" onClick={() => setIsAddingNote(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Add new note form */}
          {isAddingNote && (
            <div className="mb-6 p-4 border rounded-md bg-gray-50">
              <Label htmlFor="newNote" className="mb-2 block font-medium">
                Add New Note
              </Label>
              <Textarea
                id="newNote"
                placeholder="Enter your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="mb-4"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote('');
                  }}
                  size="sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddNote} 
                  disabled={!newNote.trim()}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Add Note
                </Button>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-6">
              <div className="animate-pulse text-gray-500">Loading notes...</div>
            </div>
          )}

          {/* No notes state */}
          {!loading && notes.length === 0 && (
            <div className="text-center py-8">
              <StickyNote className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-muted-foreground">No notes added yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Add Note" to create the first note for this job
              </p>
            </div>
          )}

          {/* Notes list */}
          {!loading && notes.length > 0 && (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.uuid} className="p-4 border rounded-md hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          Admin
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {userType === 'admin' ? 'Admin' : 'Client'}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Created: {formatDate(note.create_date)}
                        {note.edit_date && note.edit_date !== note.create_date && (
                          <> • Edited: {formatDate(note.edit_date)}</>
                        )}
                      </span>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-1 ml-2">
                      {editingNoteId === note.uuid ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveEdit(note.uuid)}
                            disabled={!editNoteText.trim()}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(note)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => initiateDelete(note)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Note content */}
                  {editingNoteId === note.uuid ? (
                    <Textarea
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      className="w-full"
                      rows={3}
                      placeholder="Edit your note..."
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {note.note || 'No content'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {noteToDelete && (
            <div className="py-4">              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-sm font-medium mb-1">
                  By: Admin
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {formatDate(noteToDelete.create_date)}
                </p>
                <p className="text-sm line-clamp-3">
                  {noteToDelete.note || 'No content'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNote}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotesTab;
