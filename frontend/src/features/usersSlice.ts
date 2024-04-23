import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { validateUser, _getUsers } from '../server/_DATA';
import { RootState } from '../app/store';
import { voteOnPoll, addNewPoll } from './pollSlice';

// Define the user interface for the state
interface User {
  id: string;
  password: string;
  name: string;
  avatarURL: string | null;
  answers: Record<string, string>;
  questions: string[];
}

// Define the state structure for the users slice
export interface UsersState {
  users: Record<string, User>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  isAuthenticated: boolean;
  currentUser: User | null;
  error: string | undefined;
}

// Initial state for the users slice
const initialState: UsersState = {
  users: {},
  status: 'idle',
  isAuthenticated: false,
  currentUser: null,
  error: undefined,
};

// Asynchronous thunk for fetching users
export const fetchUsers = createAsyncThunk<User[], void, { state: RootState }>(
  'user/fetchUsers',
  async () => {
    try {
      const response = await _getUsers();
      return Object.values(response);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
      throw error;
    }
  },
);

// Asynchronous thunk for user login
export const loginUser = createAsyncThunk<
  User,
  { username: string; password: string },
  { rejectValue: string }
>(
  'user/login',
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const user = await validateUser(username, password);
      return user; // validateUser returns user object on success
    } catch (error) {
      return rejectWithValue('Invalid username or password');
    }
  },
);

// Users slice containing the reducer logic and actions
export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    logout: state => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.error = undefined;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.currentUser = action.payload;
        state.error = undefined;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.currentUser = null;
        state.error = action.payload as string;
      })
      .addCase(fetchUsers.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        action.payload.forEach(user => {
          state.users[user.id] = user;
        });
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addNewPoll.fulfilled, (state, action) => {
        // New poll data includes the author's ID
        const { author, id } = action.payload;
        if (state.currentUser) {
          state.currentUser.questions.push(id);
          state.users[author].questions.push(id);
        } else {
          console.error('Author not found in users state:', author); // Logs an error if the author doesn't exist
        }
      })
      .addCase(voteOnPoll.fulfilled, (state, action) => {
        const { userId, pollId, option } = action.payload;
        if (state.currentUser) {
          state.currentUser.answers[pollId] = option;
          state.users[userId].answers[pollId] = option;
        } else {
          console.error('Current User not found in users state:', userId); // Logs an error if the user doesn't exist
        }
      });
  },
});

export const { logout } = usersSlice.actions;

export default usersSlice.reducer;