import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Meeting, MeetingFilters } from '../../types';
import firestoreService from '../../firebase/firestoreService';

interface MeetingState {
  meetings: Meeting[];
  userMeetings: Meeting[]; // Meetings assigned to current user
  todaysMeetings: Meeting[]; // Today's meetings for quick access
  upcomingMeetings: Meeting[]; // Upcoming meetings with countdown
  selectedMeeting: Meeting | null;
  loading: boolean;
  error: string | null;
  filters: MeetingFilters;
}

const initialState: MeetingState = {
  meetings: [],
  userMeetings: [],
  todaysMeetings: [],
  upcomingMeetings: [],
  selectedMeeting: null,
  loading: false,
  error: null,
  filters: {},
};

// Async Thunks

/**
 * Fetch all meetings (Admin)
 */
export const fetchMeetings = createAsyncThunk(
  'meetings/fetchMeetings',
  async (_, { rejectWithValue }) => {
    try {
      const meetings = await firestoreService.getMeetings();
      return meetings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch meetings');
    }
  }
);

/**
 * Fetch user-specific meetings
 */
export const fetchUserMeetings = createAsyncThunk(
  'meetings/fetchUserMeetings',
  async (userId: string, { rejectWithValue }) => {
    try {
      const meetings = await firestoreService.getMeetingsForUser(userId);
      return meetings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user meetings');
    }
  }
);

/**
 * Fetch meetings by date
 */
export const fetchMeetingsByDate = createAsyncThunk(
  'meetings/fetchMeetingsByDate',
  async ({ userId, date }: { userId: string; date: string }, { rejectWithValue }) => {
    try {
      const meetings = await firestoreService.getMeetingsByDate(userId, date);
      return meetings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch meetings by date');
    }
  }
);

/**
 * Create a new meeting
 */
export const createMeeting = createAsyncThunk(
  'meetings/createMeeting',
  async (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const newMeeting = await firestoreService.createMeeting(meetingData);
      return newMeeting;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create meeting');
    }
  }
);

/**
 * Update meeting
 */
export const updateMeeting = createAsyncThunk(
  'meetings/updateMeeting',
  async ({ meetingId, updates }: { meetingId: string; updates: Partial<Meeting> }, { rejectWithValue }) => {
    try {
      await firestoreService.updateMeeting(meetingId, updates);
      const updatedMeeting = await firestoreService.getMeeting(meetingId);
      if (!updatedMeeting) {
        throw new Error('Failed to fetch updated meeting');
      }
      return updatedMeeting;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update meeting');
    }
  }
);

/**
 * Delete meeting
 */
export const deleteMeeting = createAsyncThunk(
  'meetings/deleteMeeting',
  async (meetingId: string, { rejectWithValue }) => {
    try {
      await firestoreService.deleteMeeting(meetingId);
      return meetingId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete meeting');
    }
  }
);

/**
 * Fetch upcoming meetings with countdown
 */
export const fetchUpcomingMeetings = createAsyncThunk(
  'meetings/fetchUpcomingMeetings',
  async ({ userId, limit = 10 }: { userId: string; limit?: number }, { rejectWithValue }) => {
    try {
      const meetings = await firestoreService.getUpcomingMeetingsForUser(userId, limit);
      return meetings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch upcoming meetings');
    }
  }
);

/**
 * Subscribe to real-time meeting updates
 */
export const subscribeToMeetings = createAsyncThunk(
  'meetings/subscribeToMeetings',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      // Subscribe to real-time updates
      const unsubscribe = await firestoreService.subscribeToMeetings(userId, (meetings: Meeting[]) => {
        dispatch(setMeetings(meetings));
        
        // Filter meetings for the user
        const userMeetings = meetings.filter(meeting => 
          meeting.isAssignedToAll || meeting.assignedTo.includes(userId)
        );
        dispatch(setUserMeetings(userMeetings));
        
        // Filter today's meetings
        const today = new Date().toISOString().split('T')[0];
        const todaysMeetings = userMeetings.filter(meeting => meeting.date === today);
        dispatch(setTodaysMeetings(todaysMeetings));
        
        // Filter upcoming meetings
        const now = new Date();
        const upcomingMeetings = userMeetings
          .filter(meeting => new Date(meeting.startTime) > now && meeting.status === 'Scheduled')
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .slice(0, 5);
        dispatch(setUpcomingMeetings(upcomingMeetings));
      });
      
      return unsubscribe;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to subscribe to meetings');
    }
  }
);

/**
 * Unsubscribe from meeting updates
 */
export const unsubscribeFromMeetings = createAsyncThunk(
  'meetings/unsubscribeFromMeetings',
  async (_, { rejectWithValue }) => {
    try {
      await firestoreService.unsubscribeFromMeetings();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unsubscribe from meetings');
    }
  }
);

const meetingSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    setMeetings: (state, action: PayloadAction<Meeting[]>) => {
      state.meetings = action.payload;
      state.loading = false;
      state.error = null;
    },
    setUserMeetings: (state, action: PayloadAction<Meeting[]>) => {
      state.userMeetings = action.payload;
    },
    setTodaysMeetings: (state, action: PayloadAction<Meeting[]>) => {
      state.todaysMeetings = action.payload;
    },
    setUpcomingMeetings: (state, action: PayloadAction<Meeting[]>) => {
      state.upcomingMeetings = action.payload;
    },
    setSelectedMeeting: (state, action: PayloadAction<Meeting | null>) => {
      state.selectedMeeting = action.payload;
    },
    addMeeting: (state, action: PayloadAction<Meeting>) => {
      state.meetings.push(action.payload);
      // Add to user meetings if user is assigned
      const meeting = action.payload;
      if (meeting.isAssignedToAll || meeting.assignedTo.length > 0) {
        state.userMeetings.push(meeting);
      }
    },
    updateMeetingInState: (state, action: PayloadAction<Meeting>) => {
      const meeting = action.payload;
      const updateArrays = [state.meetings, state.userMeetings, state.todaysMeetings, state.upcomingMeetings];
      
      updateArrays.forEach(array => {
        const index = array.findIndex(m => m.id === meeting.id);
        if (index !== -1) {
          array[index] = meeting;
        }
      });
      
      // Update selected meeting if it's the same
      if (state.selectedMeeting?.id === meeting.id) {
        state.selectedMeeting = meeting;
      }
    },
    removeMeeting: (state, action: PayloadAction<string>) => {
      const meetingId = action.payload;
      state.meetings = state.meetings.filter(m => m.id !== meetingId);
      state.userMeetings = state.userMeetings.filter(m => m.id !== meetingId);
      state.todaysMeetings = state.todaysMeetings.filter(m => m.id !== meetingId);
      state.upcomingMeetings = state.upcomingMeetings.filter(m => m.id !== meetingId);
      if (state.selectedMeeting?.id === meetingId) {
        state.selectedMeeting = null;
      }
    },
    setFilters: (state, action: PayloadAction<MeetingFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Meetings
      .addCase(fetchMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload;
        state.error = null;
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch User Meetings
      .addCase(fetchUserMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.userMeetings = action.payload;
        state.error = null;
      })
      .addCase(fetchUserMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Meetings By Date
      .addCase(fetchMeetingsByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetingsByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.userMeetings = action.payload;
        state.error = null;
      })
      .addCase(fetchMeetingsByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Meeting
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings.push(action.payload);
        state.error = null;
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Meeting
      .addCase(updateMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const updatedMeeting = action.payload;
        
        // Update in meetings array
        const meetingIndex = state.meetings.findIndex(m => m.id === updatedMeeting.id);
        if (meetingIndex !== -1) {
          state.meetings[meetingIndex] = updatedMeeting;
        }
        
        // Update selected meeting if it's the same
        if (state.selectedMeeting?.id === updatedMeeting.id) {
          state.selectedMeeting = updatedMeeting;
        }
        
        // Update in user meetings
        const userMeetingIndex = state.userMeetings.findIndex(m => m.id === updatedMeeting.id);
        if (userMeetingIndex !== -1) {
          state.userMeetings[userMeetingIndex] = updatedMeeting;
        }
        
        state.error = null;
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Meeting
      .addCase(deleteMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const meetingId = action.payload;
        state.meetings = state.meetings.filter(m => m.id !== meetingId);
        state.userMeetings = state.userMeetings.filter(m => m.id !== meetingId);
        state.todaysMeetings = state.todaysMeetings.filter(m => m.id !== meetingId);
        state.upcomingMeetings = state.upcomingMeetings.filter(m => m.id !== meetingId);
        if (state.selectedMeeting?.id === meetingId) {
          state.selectedMeeting = null;
        }
        state.error = null;
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Upcoming Meetings
      .addCase(fetchUpcomingMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingMeetings = action.payload;
        state.error = null;
      })
      .addCase(fetchUpcomingMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Subscribe to Meetings
      .addCase(subscribeToMeetings.pending, (state) => {
        state.error = null;
      })
      .addCase(subscribeToMeetings.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(subscribeToMeetings.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Unsubscribe from Meetings
      .addCase(unsubscribeFromMeetings.fulfilled, (state) => {
        state.error = null;
      });
  },
});

export const {
  setMeetings,
  setUserMeetings,
  setTodaysMeetings,
  setUpcomingMeetings,
  setSelectedMeeting,
  addMeeting,
  updateMeetingInState,
  removeMeeting,
  setFilters,
  clearFilters,
  setLoading,
  setError,
  clearError,
} = meetingSlice.actions;

export default meetingSlice.reducer;