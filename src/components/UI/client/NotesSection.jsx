import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
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
import { API_ENDPOINTS } from '@/lib/apiConfig';

const NotesSection = ({ jobId, userType = 'client' }) => {
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
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return {
      name: userInfo.name || userInfo.email || 'Client',
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
      
      if (response.data && response.data.success) {
        setNotes(response.data.notes || response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setNotes(response.data);
      } else {
        console.warn('Unexpected notes response format:', response.data);
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to load notes');
      if (error.response?.status === 404) {
        // Job might not have notes yet, this is normal
        setNotes([]);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a new note
  const handleAddNote = async () => {
    if (!newNote.trim() || !jobId) return;

    try {
      const userInfo = getUserInfo();
      const noteData = {
        job_id: jobId,
        note_text: newNote.trim(),
        created_by: userInfo.name,
        created_by_uuid: userInfo.uuid,
        user_type: userType
      };

      const response = await axios.post(API_ENDPOINTS.NOTES.CREATE, noteData);
      
      if (response.data && response.data.success) {
        await fetchNotes(); // Refresh notes list
        setNewNote('');
        setIsAddingNote(false);
      } else {
        throw new Error(response.data?.message || 'Failed to create note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      setError(error.response?.data?.message || 'Failed to add note');
    }
  };

  // Update an existing note
  const handleUpdateNote = async (noteId) => {
    if (!editNoteText.trim()) return;

    try {
      const response = await axios.put(API_ENDPOINTS.NOTES.UPDATE(noteId), {
        note_text: editNoteText.trim()
      });
      
      if (response.data && response.data.success) {
        await fetchNotes(); // Refresh notes list
        setEditingNoteId(null);
        setEditNoteText('');
      } else {
        throw new Error(response.data?.message || 'Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      setError(error.response?.data?.message || 'Failed to update note');
    }
  };

  // Delete a note
  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      const response = await axios.delete(API_ENDPOINTS.NOTES.DELETE(noteToDelete.id));
      
      if (response.data && response.data.success) {
        await fetchNotes(); // Refresh notes list
      } else {
        throw new Error(response.data?.message || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      setError(error.response?.data?.message || 'Failed to delete note');
    } finally {
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  // Start editing a note
  const startEdit = (note) => {
    setEditingNoteId(note.id);
    setEditNoteText(note.note_text);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteText('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Load notes on component mount
  useEffect(() => {
    fetchNotes();
  }, [jobId]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Notes</h3>
          {notes.length > 0 && (
            <Badge variant="secondary">{notes.length}</Badge>
          )}
        </div>
        <Button
          onClick={() => setIsAddingNote(!isAddingNote)}
          variant={isAddingNote ? "outline" : "default"}
          size="sm"
        >
          {isAddingNote ? (
            <>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Add Note
            </>
          )}
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-2 h-auto p-0 text-red-700 hover:text-red-900"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Add new note form */}
      {isAddingNote && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="new-note">Note</Label>
              <Textarea
                id="new-note"
                placeholder="Enter your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                <Save className="w-4 h-4 mr-1" />
                Save Note
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <StickyNote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No notes found for this job</p>
          <p className="text-sm">Add a note to start tracking important information</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="relative">
              <CardContent className="pt-4">
                {editingNoteId === note.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <Textarea
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateNote(note.id)}
                        disabled={!editNoteText.trim()}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {note.created_by || 'Unknown User'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {note.user_type || 'client'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(note)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setNoteToDelete(note);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap mb-2">
                      {note.note_text}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(note.created_at)}
                      {note.updated_at && note.updated_at !== note.created_at && (
                        <span> • Updated {formatDate(note.updated_at)}</span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            <div className="py-4">
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-sm font-medium mb-1">
                  By: {noteToDelete.created_by}
                </p>
                <p className="text-sm">
                  {noteToDelete.note_text.substring(0, 100)}
                  {noteToDelete.note_text.length > 100 ? '...' : ''}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setNoteToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNote}
            >
              Delete Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesSection;
