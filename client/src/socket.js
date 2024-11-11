/* eslint-disable no-undef */
import {io} from 'socket.io-client';
const BASE_URL = import.meta.env.VITE_BASE_URL;

const socket = io(BASE_URL);

export default socket;