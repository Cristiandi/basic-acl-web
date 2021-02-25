import { writable, readable } from 'svelte/store';

const userFromLocalStorage = process.browser ? JSON.parse(localStorage.getItem('user')) : null;

export const user = writable(userFromLocalStorage || null);

export const showSideBar = writable(false);

export const time = readable(new Date().getTime(), function start(set) {
	const interval = setInterval(() => {
		set(new Date().getTime());
	}, 1000);

	return function stop() {
		clearInterval(interval);
	};
});