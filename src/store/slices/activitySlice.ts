import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';

export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (userId = null) => {
    let query = firestore()
      .collection('activities')
      .orderBy('createdAt', 'desc')
      .limit(50);

    if (userId) {
      query = query.where('relatedUsers', 'array-contains', userId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
  },
);

export const createActivity = createAsyncThunk(
  'activities/createActivity',
  async activityData => {
    const docRef = await firestore()
      .collection('activities')
      .add({
        ...activityData,
        createdAt: firestore.FieldValue.serverTimestamp(),
        readBy: [],
      });

    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
    };
  },
);

export const markActivityAsRead = createAsyncThunk(
  'activities/markAsRead',
  async ({ activityId, userId }) => {
    await firestore()
      .collection('activities')
      .doc(activityId)
      .update({
        readBy: firestore.FieldValue.arrayUnion(userId),
      });

    return { activityId, userId };
  },
);

const activitySlice = createSlice({
  name: 'activities',
  initialState: {
    activities: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearActivities: state => {
      state.activities = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchActivities.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.activities.unshift(action.payload);
      })
      .addCase(markActivityAsRead.fulfilled, (state, action) => {
        const activity = state.activities.find(
          a => a.id === action.payload.activityId,
        );
        if (activity && !activity.readBy.includes(action.payload.userId)) {
          activity.readBy.push(action.payload.userId);
        }
      });
  },
});

export const { clearActivities } = activitySlice.actions;
export default activitySlice.reducer;
