import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getDatabase, ref, set, onValue, push, get, child, update, query, orderByChild, equalTo} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyABFRXskmf092kUCW_6q2LALcCTj-3zEbU",
  authDomain: "turkey-day-41454.firebaseapp.com",
  databaseURL: "https://turkey-day-41454-default-rtdb.firebaseio.com",
  projectId: "turkey-day-41454",
  storageBucket: "turkey-day-41454.firebasestorage.app",
  messagingSenderId: "1072572248226",
  appId: "1:1072572248226:web:0c9511283c3daa7fb"
};  
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


async function displayLogs(logsArray) {
    const logsTable = document.getElementById('logs-table-body');
    logsTable.innerHTML = '';

    logsArray.reverse();
    logsArray.forEach(item => {
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-id', item.id);

        newRow.innerHTML = `
            <td>${new Date(item.timestamp).toLocaleString()}</td>
            <td>${item.activity}</td>
        `;
        logsTable.appendChild(newRow);
    });
}

async function setupDatabaseListener() {
    const logsRef = ref(db, 'logs');

    onValue(logsRef, (logsSnap) => {
        const logsData = logsSnap.val() || {};
        const logsArray = Object.keys(logsData).map(key => ({ id: key, ...logsData[key] }));
        displayLogs(logsArray);
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    setupDatabaseListener(); 
});