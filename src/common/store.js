import { writable } from 'svelte/store';

const userFromLocalStorage = process.browser ? JSON.parse(localStorage.getItem('user')) : null;

export const user = writable(userFromLocalStorage || null);

export const showSideBar = writable(false);