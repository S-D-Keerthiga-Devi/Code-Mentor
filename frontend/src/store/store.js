import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice'
import ideReducer from './ideSlice'

const store = configureStore({
    reducer: {
        auth: authSlice,
        ide: ideReducer
    }
})

store.subscribe(() => {
    try {
        const state = store.getState();
        localStorage.setItem('codeMentorIDE', JSON.stringify(state.ide));
    } catch (err) {
        console.error("Could not save IDE state to localStorage", err);
    }
});

export default store