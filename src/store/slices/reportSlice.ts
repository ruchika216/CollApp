import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Report } from '../../types';
import firestoreService from '../../firebase/firestoreService';

interface ReportState {
  reports: Report[];
  userReports: Report[]; // Reports assigned to current user
  selectedReport: Report | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  reports: [],
  userReports: [],
  selectedReport: null,
  loading: false,
  error: null,
};

// Async Thunks

/**
 * Fetch all reports (Admin)
 */
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (_, { rejectWithValue }) => {
    try {
      const reports = await firestoreService.getReports();
      return reports;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reports');
    }
  }
);

/**
 * Fetch user-specific reports
 */
export const fetchUserReports = createAsyncThunk(
  'reports/fetchUserReports',
  async (userId: string, { rejectWithValue }) => {
    try {
      const reports = await firestoreService.getReportsForUser(userId);
      return reports;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user reports');
    }
  }
);

/**
 * Fetch reports by date
 */
export const fetchReportsByDate = createAsyncThunk(
  'reports/fetchReportsByDate',
  async ({ userId, date }: { userId: string; date: string }, { rejectWithValue }) => {
    try {
      const reports = await firestoreService.getReportsByDate(userId, date);
      return reports;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reports by date');
    }
  }
);

/**
 * Create a new report
 */
export const createReport = createAsyncThunk(
  'reports/createReport',
  async (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const newReport = await firestoreService.createReport(reportData);
      return newReport;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create report');
    }
  }
);

/**
 * Update report
 */
export const updateReport = createAsyncThunk(
  'reports/updateReport',
  async ({ reportId, updates }: { reportId: string; updates: Partial<Report> }, { rejectWithValue }) => {
    try {
      await firestoreService.updateReport(reportId, updates);
      const updatedReport = await firestoreService.getReport(reportId);
      if (!updatedReport) {
        throw new Error('Failed to fetch updated report');
      }
      return updatedReport;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update report');
    }
  }
);

/**
 * Delete report
 */
export const deleteReport = createAsyncThunk(
  'reports/deleteReport',
  async (reportId: string, { rejectWithValue }) => {
    try {
      await firestoreService.deleteReport(reportId);
      return reportId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete report');
    }
  }
);

/**
 * Update report status (for developers)
 */
export const updateReportStatus = createAsyncThunk(
  'reports/updateReportStatus',
  async ({ reportId, status }: { reportId: string; status: Report['status'] }, { rejectWithValue }) => {
    try {
      await firestoreService.updateReport(reportId, { status });
      const updatedReport = await firestoreService.getReport(reportId);
      if (!updatedReport) {
        throw new Error('Failed to fetch updated report');
      }
      return updatedReport;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update report status');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReports: (state, action: PayloadAction<Report[]>) => {
      state.reports = action.payload;
      state.loading = false;
      state.error = null;
    },
    setUserReports: (state, action: PayloadAction<Report[]>) => {
      state.userReports = action.payload;
    },
    setSelectedReport: (state, action: PayloadAction<Report | null>) => {
      state.selectedReport = action.payload;
    },
    addReport: (state, action: PayloadAction<Report>) => {
      state.reports.push(action.payload);
    },
    updateReportInState: (state, action: PayloadAction<Report>) => {
      const index = state.reports.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
      
      // Update selected report if it's the same
      if (state.selectedReport?.id === action.payload.id) {
        state.selectedReport = action.payload;
      }
      
      // Update user reports
      const userIndex = state.userReports.findIndex(r => r.id === action.payload.id);
      if (userIndex !== -1) {
        state.userReports[userIndex] = action.payload;
      }
    },
    removeReport: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(r => r.id !== action.payload);
      state.userReports = state.userReports.filter(r => r.id !== action.payload);
      if (state.selectedReport?.id === action.payload) {
        state.selectedReport = null;
      }
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
      // Fetch Reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
        state.error = null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch User Reports
      .addCase(fetchUserReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReports.fulfilled, (state, action) => {
        state.loading = false;
        state.userReports = action.payload;
        state.error = null;
      })
      .addCase(fetchUserReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Reports By Date
      .addCase(fetchReportsByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportsByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.userReports = action.payload;
        state.error = null;
      })
      .addCase(fetchReportsByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Report
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports.push(action.payload);
        state.error = null;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Report
      .addCase(updateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.loading = false;
        const updatedReport = action.payload;
        
        // Update in reports array
        const reportIndex = state.reports.findIndex(r => r.id === updatedReport.id);
        if (reportIndex !== -1) {
          state.reports[reportIndex] = updatedReport;
        }
        
        // Update selected report if it's the same
        if (state.selectedReport?.id === updatedReport.id) {
          state.selectedReport = updatedReport;
        }
        
        // Update in user reports
        const userReportIndex = state.userReports.findIndex(r => r.id === updatedReport.id);
        if (userReportIndex !== -1) {
          state.userReports[userReportIndex] = updatedReport;
        }
        
        state.error = null;
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Report Status
      .addCase(updateReportStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedReport = action.payload;
        
        // Update in all relevant arrays
        const reportIndex = state.reports.findIndex(r => r.id === updatedReport.id);
        if (reportIndex !== -1) {
          state.reports[reportIndex] = updatedReport;
        }
        
        const userReportIndex = state.userReports.findIndex(r => r.id === updatedReport.id);
        if (userReportIndex !== -1) {
          state.userReports[userReportIndex] = updatedReport;
        }
        
        if (state.selectedReport?.id === updatedReport.id) {
          state.selectedReport = updatedReport;
        }
        
        state.error = null;
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Report
      .addCase(deleteReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.loading = false;
        const reportId = action.payload;
        state.reports = state.reports.filter(r => r.id !== reportId);
        state.userReports = state.userReports.filter(r => r.id !== reportId);
        if (state.selectedReport?.id === reportId) {
          state.selectedReport = null;
        }
        state.error = null;
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setReports,
  setUserReports,
  setSelectedReport,
  addReport,
  updateReportInState,
  removeReport,
  setLoading,
  setError,
  clearError,
} = reportSlice.actions;

export default reportSlice.reducer;