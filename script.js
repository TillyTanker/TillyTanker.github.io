import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getDatabase, ref, set, onValue, push, get, child, update, query, orderByChild, equalTo} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyABFRXskmf092kUCW_6q2LALcCTj-3zEbU",
  authDomain: "turkey-day-41454.firebaseapp.com",
  databaseURL: "https://turkey-day-41454-default-rtdb.firebaseio.com",
  projectId: "turkey-day-41454",
  storageBucket: "turkey-day-41454.firebasestorage.app",
  messagingSenderId: "1072572248226",
  appId: "1:1072572248226:web:0c9511283d9273c3daa7fb"
};   
  
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.getElementById('submit-button').addEventListener('click', addPerson);
document.getElementById('name-input').addEventListener('keyup', handleInputKeyPress);
document.getElementById('food-input').addEventListener('keyup', handleInputKeyPress);

document.getElementById('chat-submit-button').addEventListener('click', sendChatMessage);
document.getElementById('chat-input').addEventListener('keyup', handleChatInputKeyPress);
document.getElementById('chat-name-input').addEventListener('keyup', handleChatInputKeyPress);

function handleChatInputKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendChatMessage();
    }
}

function handleInputKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addPerson();
    }
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const nameInput = document.getElementById('chat-name-input');
    const message = chatInput.value.trim();
    const name = nameInput.value.trim();

    if (message === '') {
        alert('Please enter a message.');
        return;
    }
    let jsonData = {
        name: name,
        message: message, 
        timestamp: new Date().toISOString()
    };

    try {
        const chatMessagesRef = ref(db, 'chatMessages'); 
        const newDocRef = push(chatMessagesRef);

        await set(newDocRef, jsonData);

        console.log("Chat message saved with key: ", newDocRef.key);

        chatInput.value = '';
    } catch (e) {
        console.error("Error adding chat message: ", e);
        alert('Error sending message.');
    }
}

async function addPerson(){
    const nameInput = document.getElementById('name-input');
    const foodInput = document.getElementById('food-input');
        
        if (nameInput.value.trim() === '' || foodInput.value.trim() === '') {
            alert('Please enter both your name and what you are going to bring.');
            return;
        }
        if(await isNameAlreadyUsed(nameInput.value.trim(), 'name')){
            alert('Who is you? Please enter a different name.');
            return;
        }
        if(await isNameAlreadyUsed(foodInput.value.trim(), 'food')){
            alert('Erm... someone is already bringing that? Please enter a different food.');
            return;
        }

        let jsonData = {
            name: nameInput.value.trim(), 
            food: foodInput.value.trim(), 
            timestamp: new Date().toISOString()
        };

        try {
            const userFoodsRef = ref(db, 'userFoods'); 
            const newDocRef = push(userFoodsRef);

            await set(newDocRef, jsonData);

            console.log("Data saved with key: ", newDocRef.key);

            nameInput.value = '';
            foodInput.value = '';
        } catch (e) {
            console.error("Error adding document: ", e);
            alert('Error saving data.');
        }
}


async function displayData(foodDataArray, chatDataArray) {
    const tableBody = document.getElementById('table-body');
    const chatBox = document.getElementById('chat-table');
    chatBox.innerHTML = '';
    tableBody.innerHTML = '';

    foodDataArray.forEach(item => {
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-id', item.id);

        newRow.innerHTML = `
            <td><input class=transparent-input-box id=nameRow value="${item.name}" disabled></td>
            <td><input class=transparent-input-box id=foodRow value="${item.food}" disabled></td>
            <td><button class="edit-button"><i class="fa fa-edit"></i></button></td>
        `;
        tableBody.appendChild(newRow);
    });

    chatDataArray.reverse();
    chatDataArray.forEach(item => {
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-id', item.id);

        newRow.innerHTML = `
            <td class="custom-row">${item.name}</td>
            <td class="custom-row">${item.message}</td>
            <td class="custom-row">${new Date(item.timestamp).toLocaleString()}</td>
        `;
        chatBox.appendChild(newRow);
    });
}

function setupDatabaseListener() {
    const userFoodsRef = ref(db, 'userFoods');
    const chatMessagesRef = ref(db, 'chatMessages');

    onValue(userFoodsRef, (foodSnap) => {
        const foodData = foodSnap.val() || {};
        const foodArray = Object.keys(foodData).map(key => ({ id: key, ...foodData[key] }));

        onValue(chatMessagesRef, (chatSnap) => {
            const chatData = chatSnap.val() || {};
            const chatArray = Object.keys(chatData).map(key => ({ id: key, ...chatData[key] }));

            displayData(foodArray, chatArray);

            document.querySelectorAll('.edit-button').forEach(button => {
                button.addEventListener('click', handleEditClick);
            });
        });
    });
}

async function isNameAlreadyUsed(nameToCheck, field) {
    const userFoodsRef = ref(db, 'userFoods');
    const nameQuery = query(userFoodsRef, orderByChild(field), equalTo(nameToCheck));
    const snapshot = await get(nameQuery);
    return snapshot.exists();
}

function handleEditClick(event) {
    const row = event.target.closest('tr');
    const nameInput = row.querySelector('#nameRow');
    const foodInput = row.querySelector('#foodRow');
    const icon = row.querySelector('.edit-button i');

    if (icon.classList.contains('fa-edit')) {
        nameInput.disabled = false;
        foodInput.disabled = false;
        nameInput.focus();
        icon.classList.remove('fa-edit');
        icon.classList.add('fa-save');
        row.addEventListener('keydown', handleEnterKeySave);
    } else {

        updateDatabaseRow(row.getAttribute('data-id'), nameInput.value, foodInput.value);
        nameInput.disabled = true;
        foodInput.disabled = true;
        icon.classList.remove('fa-save');
        icon.classList.add('fa-edit');
        row.removeEventListener('keydown', handleEnterKeySave);
    }
}

function handleEnterKeySave(event) {
    if (event.key === 'Enter') {
        event.target.closest('tr').querySelector('.edit-button').click();
    }
}

async function updateDatabaseRow(id, name, food) {
    const itemRef = ref(db, 'userFoods/' + id);
    try {
        await update(itemRef, {
            name: name,
            food: food
        });
        console.log("Data updated for key:", id);
    } catch (e) {
        console.error("Error updating document:", e);
        alert('Error updating data.');
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    setupDatabaseListener(); 
});