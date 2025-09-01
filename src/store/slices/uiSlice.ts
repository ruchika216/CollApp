import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  loading: boolean;
  refreshing: boolean;
  drawerOpen: boolean;
  activeTab: string;
  modalVisible: boolean;
  bottomSheetVisible: boolean;
  searchQuery: string;
  filterOptions: {
    status: string[];
    priority: string[];
    assignee: string[];
  };
  sortBy: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  selectedProject: string | null;
}

const initialState: UIState = {
  loading: false,
  refreshing: false,
  drawerOpen: false,
  activeTab: 'home',
  modalVisible: false,
  bottomSheetVisible: false,
  searchQuery: '',
  filterOptions: {
    status: [],
    priority: [],
    assignee: [],
  },
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  selectedProject: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.drawerOpen = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setModalVisible: (state, action: PayloadAction<boolean>) => {
      state.modalVisible = action.payload;
    },
    setBottomSheetVisible: (state, action: PayloadAction<boolean>) => {
      state.bottomSheetVisible = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilterOptions: (
      state,
      action: PayloadAction<Partial<UIState['filterOptions']>>,
    ) => {
      state.filterOptions = { ...state.filterOptions, ...action.payload };
    },
    clearFilters: state => {
      state.filterOptions = {
        status: [],
        priority: [],
        assignee: [],
      };
      state.searchQuery = '';
    },
    setSortBy: (state, action: PayloadAction<UIState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<UIState['sortOrder']>) => {
      state.sortOrder = action.payload;
    },
    toggleSortOrder: state => {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    setSelectedProject: (state, action: PayloadAction<string | null>) => {
      state.selectedProject = action.payload;
    },
    resetUI: () => initialState,
  },
});

export const {
  setLoading,
  setRefreshing,
  setDrawerOpen,
  setActiveTab,
  setModalVisible,
  setBottomSheetVisible,
  setSearchQuery,
  setFilterOptions,
  clearFilters,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
  setSelectedProject,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
