import { getFirestore, getDocs, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyAVD7Zc-XKtjfDg4pjxL8b9QmuwxEY0eHM",
    authDomain: "adaptiveanarchybase.firebaseapp.com",
    projectId: "adaptiveanarchybase",
    storageBucket: "adaptiveanarchybase.appspot.com",
    messagingSenderId: "256141998502",
    appId: "1:256141998502:web:eaab803dab5b9c723a3767",
    measurementId: "G-N8M3QYTZZY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const chess = new Chess();
let probabilities = {};

async function updateLocalProbs() {
    const snapshot = await getDocs(collection(db, "probabilities"));
    const snapshotObj = {}
    snapshot.docs.forEach(doc => {
        snapshotObj[doc.id] = doc.data();
    })
    probabilities = snapshotObj;
}

async function updateFireProbs() {
    for (let [board, probs] of Object.entries(probabilities)) {
        await setDoc(doc(db, 'probabilities', board), probs);
    }
}

// async function updateLocalProbs(board) {
//     await getDoc(doc(db, 'probabilities', board)).then(docSnap => {
//         if (docSnap.exists()) {
//             const data = structuredClone(docSnap.data())
//             probabilities[board] = data;
//         } else {
//             console.log('no data for this board');
//         }
//     });
// }

let train = true;

var board = Chessboard('board', {
    draggable: false,
    position: 'start',
});

let isWhite = true;

function boardToString(board) {
    const rowToFEN = (row) => {
        let fenString = '';
        let emptyCount = 0;

        for (const cell of row) {
            if (cell === null) {
                emptyCount++;
            } else {
                if (emptyCount > 0) {
                    fenString += emptyCount;
                    emptyCount = 0;
                }
                fenString += cell.color === 'w' ? cell.type.toUpperCase() : cell.type;
            }
        }
        if (emptyCount > 0) {
            fenString += emptyCount;
        }
        return fenString || '8'; // In case the row is completely empty
    };

    const boardFEN = board.map(rowToFEN).join('.');
    const defaultFEN = `${boardFEN} ${isWhite ? 'w' : 'b'}`;

    return defaultFEN;
}

async function getMoveFromProbabilities(boardString, moves) {
    await updateLocalProbs();

    if (!probabilities[boardString]) {
        probabilities[boardString] = {};
        moves.forEach(move => {
            probabilities[boardString][move] = 12;
        });
        await updateFireProbs();
    }

    console.log(probabilities)

    // if (probabilities == {}) {
    //     moves.forEach(move => {
    //         probabilities[move] = 12;
    //     });
    // }

    const moveProbabilities = probabilities[boardString];
    const weightedMoves = [];

    for (const move in moveProbabilities) {
        for (let i = 0; i < moveProbabilities[move]; i++) {
            weightedMoves.push(move);
        }
    }

    console.log(weightedMoves[Math.floor(Math.random() * weightedMoves.length)]);

    return weightedMoves[Math.floor(Math.random() * weightedMoves.length)];
}

function promptPlayerFeedback(boardString, move) {
    // Disable dragging
    board = Chessboard('board', {
        draggable: false,
        position: chess.fen(),
    });

    document.getElementById('train-checkbox-container').classList.add('hidden');

    // Create feedback buttons
    const feedbackContainer = document.createElement('div');
    feedbackContainer.classList.add('feedback-container')

    const feedbackOptions = ['brilliant', 'good', 'book', 'bad', 'blunder'];
    feedbackOptions.forEach(option => {
        const button = document.createElement('button');
        if (option === 'brilliant') {
            button.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 18 19">
        <g id="Brilliant">
    <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
    <path class="icon-background" fill="#1bada6" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
    <g>
      <path class="icon-component" fill="#fff" d="M12.57,14.1a.51.51,0,0,1,0,.13.44.44,0,0,1-.08.11l-.11.08-.13,0h-2l-.13,0L10,14.34A.41.41,0,0,1,10,14.1V12.2A.32.32,0,0,1,10,12a.39.39,0,0,1,.1-.08l.13,0h2a.31.31,0,0,1,.24.1.39.39,0,0,1,.08.1.51.51,0,0,1,0,.13Zm-.12-3.93a.17.17,0,0,1,0,.12.41.41,0,0,1-.07.11.4.4,0,0,1-.23.08H10.35a.31.31,0,0,1-.34-.31L9.86,3.4A.36.36,0,0,1,10,3.16a.23.23,0,0,1,.11-.08.27.27,0,0,1,.13,0H12.3a.32.32,0,0,1,.25.1.36.36,0,0,1,.09.24Z"></path>
      <path class="icon-component" fill="#fff" d="M8.07,14.1a.51.51,0,0,1,0,.13.44.44,0,0,1-.08.11l-.11.08-.13,0h-2l-.13,0-.11-.08a.41.41,0,0,1-.08-.24V12.2a.27.27,0,0,1,0-.13.36.36,0,0,1,.07-.1.39.39,0,0,1,.1-.08l.13,0h2A.31.31,0,0,1,8,12a.39.39,0,0,1,.08.1.51.51,0,0,1,0,.13ZM8,10.17a.17.17,0,0,1,0,.12.41.41,0,0,1-.07.11.4.4,0,0,1-.23.08H5.85a.31.31,0,0,1-.34-.31L5.36,3.4a.36.36,0,0,1,.09-.24.23.23,0,0,1,.11-.08.27.27,0,0,1,.13,0H7.8a.35.35,0,0,1,.25.1.36.36,0,0,1,.09.24Z"></path>
    </g>
  </g>
    </svg>
    `;
        } else if (option === 'good') {
            button.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 18 19">
        <g id="good">
        <g>
        <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
        <path class="icon-background" fill="#77915F" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
        </g>
        <g>
        <path class="icon-component-shadow" opacity="0.2" d="M15.11,6.81,9.45,12.47,7.79,14.13a.39.39,0,0,1-.28.11.39.39,0,0,1-.27-.11L2.89,9.78a.39.39,0,0,1-.11-.28.39.39,0,0,1,.11-.27L4.28,7.85a.34.34,0,0,1,.12-.09l.15,0a.37.37,0,0,1,.15,0,.38.38,0,0,1,.13.09l2.69,2.68,5.65-5.65a.38.38,0,0,1,.13-.09.37.37,0,0,1,.15,0,.4.4,0,0,1,.15,0,.34.34,0,0,1,.12.09l1.39,1.38a.41.41,0,0,1,.08.13.33.33,0,0,1,0,.15.4.4,0,0,1,0,.15A.5.5,0,0,1,15.11,6.81Z"></path>
        <path class="icon-component" fill="#fff" d="M15.11,6.31,9.45,12,7.79,13.63a.39.39,0,0,1-.28.11.39.39,0,0,1-.27-.11L2.89,9.28A.39.39,0,0,1,2.78,9a.39.39,0,0,1,.11-.27L4.28,7.35a.34.34,0,0,1,.12-.09l.15,0a.37.37,0,0,1,.15,0,.38.38,0,0,1,.13.09L7.52,10l5.65-5.65a.38.38,0,0,1,.13-.09.37.37,0,0,1,.15,0,.4.4,0,0,1,.15,0,.34.34,0,0,1,.12.09l1.39,1.38a.41.41,0,0,1,.08.13.33.33,0,0,1,0,.15.4.4,0,0,1,0,.15A.5.5,0,0,1,15.11,6.31Z"></path>
        </g>
        </g>
        </svg>
        `;
        } else if (option === 'book') {
            button.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 18 19">
    <g id="book">
    <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
    <path class="icon-background" fill="#D5A47D" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
    <g>
      <path class="icon-component-shadow" opacity="0.3" isolation="isolate" d="M8.45,5.9c-1-.75-2.51-1.09-4.83-1.09H2.54v8.71H3.62a8.16,8.16,0,0,1,4.83,1.17Z"></path>
      <path class="icon-component-shadow" opacity="0.3" isolation="isolate" d="M9.54,14.69a8.14,8.14,0,0,1,4.84-1.17h1.08V4.81H14.38c-2.31,0-3.81.34-4.84,1.09Z"></path>
      <path class="icon-component" fill="#fff" d="M8.45,5.4c-1-.75-2.51-1.09-4.83-1.09H3V13h.58a8.09,8.09,0,0,1,4.83,1.17Z"></path>
      <path class="icon-component" fill="#fff" d="M9.54,14.19A8.14,8.14,0,0,1,14.38,13H15V4.31h-.58c-2.31,0-3.81.34-4.84,1.09Z"></path>
    </g>
  </g>
  </svg>
        `;
        } else if (option === 'bad') {
            button.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 18 19">
    <g id="bad">
        <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
        <path class="icon-background" fill="#ca3431" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
        <g class="icon-component-shadow" opacity="0.2">
            <path d="M14,12.51a.57.57,0,0,1,.08.13.39.39,0,0,1,0,.3.5.5,0,0,1-.08.12l-1.38,1.38a.5.5,0,0,1-.12.08l-.15,0-.15,0a.57.57,0,0,1-.13-.08L9,11.37,5.94,14.44a.57.57,0,0,1-.13.08l-.15,0-.15,0a.36.36,0,0,1-.12-.08L4,13.06a.39.39,0,0,1-.11-.27A.41.41,0,0,1,4,12.51L7.07,9.45,4,6.39a.43.43,0,0,1-.11-.28A.39.39,0,0,1,4,5.84L5.39,4.46a.39.39,0,0,1,.27-.11.43.43,0,0,1,.28.11L9,7.52l3.06-3.06a.41.41,0,0,1,.28-.11.39.39,0,0,1,.27.11L14,5.84a.36.36,0,0,1,.08.12.39.39,0,0,1,0,.3.57.57,0,0,1-.08.13L10.92,9.45Z"></path>
        </g>
        <path class="icon-component" fill="#f1f2f2" d="M14,12a.57.57,0,0,1,.08.13.39.39,0,0,1,0,.3.5.5,0,0,1-.08.12l-1.38,1.38a.5.5,0,0,1-.12.08l-.15,0-.15,0a.57.57,0,0,1-.13-.08L9,10.87,5.94,13.94a.57.57,0,0,1-.13.08l-.15,0-.15,0a.36.36,0,0,1-.12-.08L4,12.56a.39.39,0,0,1-.11-.27A.41.41,0,0,1,4,12L7.07,9,4,5.89a.43.43,0,0,1-.11-.28A.39.39,0,0,1,4,5.34L5.39,4a.39.39,0,0,1,.27-.11A.43.43,0,0,1,5.94,4L9,7,12.06,4a.41.41,0,0,1,.28-.11.39.39,0,0,1,.27.11L14,5.34a.36.36,0,0,1,.08.12.39.39,0,0,1,0,.3.57.57,0,0,1-.08.13L10.92,9Z"></path>
    </g>
  </svg>
    `;
        } else if (option === 'blunder') {
            button.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 18 19">
    <g id="blunder">
    <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
    <path class="icon-background" fill="#FA412D" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
    <g class="icon-component-shadow" opacity="0.2">
      <path d="M14.74,5.45A2.58,2.58,0,0,0,14,4.54,3.76,3.76,0,0,0,12.89,4a4.07,4.07,0,0,0-1.2-.19A3.92,3.92,0,0,0,10.51,4a5.87,5.87,0,0,0-.9.37,3,3,0,0,0-.32.2,3.46,3.46,0,0,1,.42.63,3.29,3.29,0,0,1,.36,1.47.31.31,0,0,0,.19-.06l.11-.08a2.9,2.9,0,0,1,.29-.19,3.89,3.89,0,0,1,.41-.17,1.55,1.55,0,0,1,.48-.07,1.1,1.1,0,0,1,.72.24.72.72,0,0,1,.23.26.8.8,0,0,1,.07.34,1,1,0,0,1-.25.67,7.71,7.71,0,0,1-.65.63,6.2,6.2,0,0,0-.48.43,2.93,2.93,0,0,0-.45.54,2.55,2.55,0,0,0-.33.66,2.62,2.62,0,0,0-.13.83V11a.24.24,0,0,0,0,.12.35.35,0,0,0,.17.17l.12,0h1.71l.12,0a.23.23,0,0,0,.1-.07.21.21,0,0,0,.06-.1.27.27,0,0,0,0-.12V10.8a1,1,0,0,1,.26-.7q.27-.28.66-.63A5.79,5.79,0,0,0,14.05,9a4.51,4.51,0,0,0,.48-.6,2.56,2.56,0,0,0,.36-.72,2.81,2.81,0,0,0,.14-1A2.66,2.66,0,0,0,14.74,5.45Z"></path>
      <path d="M12.38,12.65H10.5l-.12,0a.34.34,0,0,0-.18.29v1.82a.36.36,0,0,0,.08.23.23.23,0,0,0,.1.07l.12,0h1.88a.24.24,0,0,0,.12,0,.26.26,0,0,0,.11-.07.36.36,0,0,0,.07-.1.28.28,0,0,0,0-.13V13a.27.27,0,0,0,0-.12.61.61,0,0,0-.07-.1A.32.32,0,0,0,12.38,12.65Z"></path>
      <path d="M6.79,12.65H4.91l-.12,0a.34.34,0,0,0-.18.29v1.82a.36.36,0,0,0,.08.23.23.23,0,0,0,.1.07l.12,0H6.79a.24.24,0,0,0,.12,0A.26.26,0,0,0,7,15a.36.36,0,0,0,.07-.1.28.28,0,0,0,0-.13V13a.27.27,0,0,0,0-.12.61.61,0,0,0-.07-.1A.32.32,0,0,0,6.79,12.65Z"></path>
      <path d="M8.39,4.54A3.76,3.76,0,0,0,7.3,4a4.07,4.07,0,0,0-1.2-.19A3.92,3.92,0,0,0,4.92,4a5.87,5.87,0,0,0-.9.37,3.37,3.37,0,0,0-.55.38l-.21.19a.32.32,0,0,0,0,.41l1,1.2a.26.26,0,0,0,.2.12.48.48,0,0,0,.24-.06l.11-.08a2.9,2.9,0,0,1,.29-.19l.4-.17A1.66,1.66,0,0,1,6,6.06a1.1,1.1,0,0,1,.72.24.72.72,0,0,1,.23.26A.77.77,0,0,1,7,6.9a1,1,0,0,1-.26.67,7.6,7.6,0,0,1-.64.63,6.28,6.28,0,0,0-.49.43,2.93,2.93,0,0,0-.45.54,2.72,2.72,0,0,0-.33.66,2.62,2.62,0,0,0-.13.83V11a.43.43,0,0,0,0,.12.39.39,0,0,0,.08.1.18.18,0,0,0,.1.07.21.21,0,0,0,.12,0H6.72l.12,0a.23.23,0,0,0,.1-.07.36.36,0,0,0,.07-.1A.5.5,0,0,0,7,11V10.8a1,1,0,0,1,.27-.7A8,8,0,0,1,8,9.47c.18-.15.35-.31.52-.48A7,7,0,0,0,9,8.39a3.23,3.23,0,0,0,.36-.72,3.07,3.07,0,0,0,.13-1,2.66,2.66,0,0,0-.29-1.27A2.58,2.58,0,0,0,8.39,4.54Z"></path>
    </g>
    <g>
      <path class="icon-component" fill="#fff" d="M14.74,5A2.58,2.58,0,0,0,14,4a3.76,3.76,0,0,0-1.09-.56,4.07,4.07,0,0,0-1.2-.19,3.92,3.92,0,0,0-1.18.17,5.87,5.87,0,0,0-.9.37,3,3,0,0,0-.32.2,3.46,3.46,0,0,1,.42.63,3.29,3.29,0,0,1,.36,1.47.31.31,0,0,0,.19-.06L10.37,6a2.9,2.9,0,0,1,.29-.19,3.89,3.89,0,0,1,.41-.17,1.55,1.55,0,0,1,.48-.07,1.1,1.1,0,0,1,.72.24.72.72,0,0,1,.23.26.8.8,0,0,1,.07.34,1,1,0,0,1-.25.67,7.71,7.71,0,0,1-.65.63,6.2,6.2,0,0,0-.48.43,2.93,2.93,0,0,0-.45.54,2.55,2.55,0,0,0-.33.66,2.62,2.62,0,0,0-.13.83v.35a.24.24,0,0,0,0,.12.35.35,0,0,0,.17.17l.12,0h1.71l.12,0a.23.23,0,0,0,.1-.07.21.21,0,0,0,.06-.1.27.27,0,0,0,0-.12V10.3a1,1,0,0,1,.26-.7q.27-.28.66-.63a5.79,5.79,0,0,0,.51-.48,4.51,4.51,0,0,0,.48-.6,2.56,2.56,0,0,0,.36-.72,2.81,2.81,0,0,0,.14-1A2.66,2.66,0,0,0,14.74,5Z"></path>
      <path class="icon-component" fill="#fff" d="M12.38,12.15H10.5l-.12,0a.34.34,0,0,0-.18.29v1.82a.36.36,0,0,0,.08.23.23.23,0,0,0,.1.07l.12,0h1.88a.24.24,0,0,0,.12,0,.26.26,0,0,0,.11-.07.36.36,0,0,0,.07-.1.28.28,0,0,0,0-.13V12.46a.27.27,0,0,0,0-.12.61.61,0,0,0-.07-.1A.32.32,0,0,0,12.38,12.15Z"></path>
      <path class="icon-component" fill="#fff" d="M6.79,12.15H4.91l-.12,0a.34.34,0,0,0-.18.29v1.82a.36.36,0,0,0,.08.23.23.23,0,0,0,.1.07l.12,0H6.79a.24.24,0,0,0,.12,0A.26.26,0,0,0,7,14.51a.36.36,0,0,0,.07-.1.28.28,0,0,0,0-.13V12.46a.27.27,0,0,0,0-.12.61.61,0,0,0-.07-.1A.32.32,0,0,0,6.79,12.15Z"></path>
      <path class="icon-component" fill="#fff" d="M8.39,4A3.76,3.76,0,0,0,7.3,3.48a4.07,4.07,0,0,0-1.2-.19,3.92,3.92,0,0,0-1.18.17,5.87,5.87,0,0,0-.9.37,3.37,3.37,0,0,0-.55.38l-.21.19a.32.32,0,0,0,0,.41l1,1.2a.26.26,0,0,0,.2.12.48.48,0,0,0,.24-.06L4.78,6a2.9,2.9,0,0,1,.29-.19l.4-.17A1.66,1.66,0,0,1,6,5.56a1.1,1.1,0,0,1,.72.24.72.72,0,0,1,.23.26A.77.77,0,0,1,7,6.4a1,1,0,0,1-.26.67,7.6,7.6,0,0,1-.64.63,6.28,6.28,0,0,0-.49.43,2.93,2.93,0,0,0-.45.54,2.72,2.72,0,0,0-.33.66,2.62,2.62,0,0,0-.13.83v.35a.43.43,0,0,0,0,.12.39.39,0,0,0,.08.1.18.18,0,0,0,.1.07.21.21,0,0,0,.12,0H6.72l.12,0a.23.23,0,0,0,.1-.07.36.36,0,0,0,.07-.1.5.5,0,0,0,0-.12V10.3a1,1,0,0,1,.27-.7A8,8,0,0,1,8,9c.18-.15.35-.31.52-.48A7,7,0,0,0,9,7.89a3.23,3.23,0,0,0,.36-.72,3.07,3.07,0,0,0,.13-1A2.66,2.66,0,0,0,9.15,5,2.58,2.58,0,0,0,8.39,4Z"></path>
    </g>
  </g>
  </svg>
    `;
        }
        // button.textContent = option;
        button.onclick = async function() {
            await adjustMoveProbability(boardString, move, option);
            feedbackContainer.remove();
            board = Chessboard('board', {
                draggable: true,
                onDrop: onDrop,
                position: chess.fen(),
            });

            document.getElementById('train-checkbox-container').classList.remove('hidden');
        };
        feedbackContainer.appendChild(button);
    });

    // Append the feedback container to the body (just below the board)
    const flexContainer = document.getElementById('flexContainer');
    flexContainer.appendChild(feedbackContainer);
}

async function adjustMoveProbability(boardString, move, feedback) {
    const moveProbabilities = probabilities[boardString];
    if (feedback === 'brilliant') {
        moveProbabilities[move] += 3;
    } else if (feedback === 'good') {
        moveProbabilities[move] += 2;
    } else if (feedback === 'book') {
        moveProbabilities[move] += 1;
    } else if (feedback === 'bad' && moveProbabilities[move] > 1) {
        moveProbabilities[move] -= 1;
    } else if (feedback === 'blunder' && moveProbabilities[move] > 2) {
        moveProbabilities[move] -= 2;
    }

    probabilities[boardString] = moveProbabilities;

    await updateFireProbs();
}

async function moveAI() {
    if (!isWhite) {
        const moves = chess.moves();
        const boardString = boardToString(chess.board());
        const move = await getMoveFromProbabilities(boardString, moves);

        console.log(`Moves: ${moves}`);
        chess.move(move);
        console.log(`Chosen move: ${move}`);

        board = Chessboard('board', {
            draggable: true,
            onDrop: onDrop,
            position: chess.fen(),
        });

        if (document.getElementById('train-checkbox').checked) {
            promptPlayerFeedback(boardString, move);
        }

        isWhite = !isWhite;
    }
}

function toggleTraining() {
    train = !train;
    console.log(train);
}

function onDrop(oldLocation, newLocation, piece, newBoard, oldBoard, orientation) {
    console.log(oldLocation);
    console.log(newLocation);
    console.log(piece);
    console.log(newBoard);
    console.log(oldBoard);
    console.log(orientation);

    let algebraicMove = '';

    const pieceType = piece[1].toUpperCase(); // wP -> P
    const isCapture = oldBoard[newLocation] !== undefined; // If there's a piece at the new location, it's a capture
    const isPawn = pieceType === 'P';

    if (isPawn) {
        if (isCapture) {
            // For pawn captures, include the file of the old location
            algebraicMove += oldLocation[0];
        }
    } else {
        // For non-pawn moves, start with the piece's letter (N for knight, B for bishop, etc.)
        algebraicMove += pieceType;
    }

    // Add 'x' for a capture
    if (isCapture) {
        algebraicMove += 'x';
    }

    // Add the destination square
    algebraicMove += newLocation;

    // Check for special moves
    if (pieceType === 'K' && oldLocation === 'e1' && (newLocation === 'g1' || newLocation === 'c1')) {
        // Castling for white
        algebraicMove = newLocation === 'g1' ? 'O-O' : 'O-O-O';
    } else if (pieceType === 'K' && oldLocation === 'e8' && (newLocation === 'g8' || newLocation === 'c8')) {
        // Castling for black
        algebraicMove = newLocation === 'g8' ? 'O-O' : 'O-O-O';
    } else if (isPawn && (newLocation[1] === '8' || newLocation[1] === '1')) {
        // Pawn promotion
        algebraicMove += '=Q'; // Assuming promotion to queen. You could make this dynamic.
    }

    // Log the algebraic move
    console.log("Algebraic Move: " + algebraicMove);

    if (isWhite && chess.moves().includes(algebraicMove)) {
        chess.move(algebraicMove);
        isWhite = !isWhite

        moveAI();
    } else {
        return 'snapback';
    }
}

function start() {
    board = Chessboard('board', {
        draggable: true,
        onDrop: onDrop,
        position: 'start',
    });
}

start();