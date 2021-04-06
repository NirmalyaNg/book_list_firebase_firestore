// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAg4mYD_6qNO3QA17IoZYq4rQxAcTTgVg8",
  authDomain: "book-list-firebase.firebaseapp.com",
  projectId: "book-list-firebase",
  storageBucket: "book-list-firebase.appspot.com",
  messagingSenderId: "666672393247",
  appId: "1:666672393247:web:2c84254994a03c14a1f92a",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true,
});

// Access DOM Elements
const form = document.getElementById("book-form");
const title = document.getElementById("title");
const author = document.getElementById("author");
const isbn = document.getElementById("isbn");
const tbody = document.getElementById("book-list");

// Add Book
const addBookToDOM = (doc) => {
  // Create DOM elements
  const bookTr = document.createElement("tr");
  const titleTd = document.createElement("td");
  const authorTd = document.createElement("td");
  const isbnTd = document.createElement("td");
  const crossTd = document.createElement("td");
  const crossBtn = document.createElement("button");
  const editTd = document.createElement("td");
  const editBtn = document.createElement("button");

  bookTr.setAttribute("book_id", doc.id);
  titleTd.textContent = doc.data().title;
  authorTd.textContent = doc.data().author;
  isbnTd.textContent = doc.data().isbn;

  // Cross Button for deletion
  crossBtn.classList.add("btn", "btn-danger", "btn-sm");
  crossBtn.textContent = "Delete";

  // Edit Button for editing
  editBtn.classList.add("btn", "btn-success", "btn-sm");
  editBtn.textContent = "Edit";

  // Adding event listener to button for deleting book
  crossBtn.addEventListener("click", deleteBook);

  // Adding event listener to edit button for editing book
  editBtn.addEventListener("click", editBook);

  bookTr.appendChild(titleTd);
  bookTr.appendChild(authorTd);
  bookTr.appendChild(isbnTd);
  crossTd.appendChild(crossBtn);
  bookTr.appendChild(crossTd);
  editTd.appendChild(editBtn);
  bookTr.append(editTd);
  tbody.appendChild(bookTr);
};

// Add Book to firestore after form submit
const addBookToDB = (e) => {
  e.preventDefault();
  const bookTitle = e.target.title.value;
  const bookAuthor = e.target.author.value;
  const bookIsbn = e.target.isbn.value;

  db.collection("books").add({
    title: bookTitle,
    author: bookAuthor,
    isbn: bookIsbn,
    timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
  });

  e.target.title.value = "";
  e.target.author.value = "";
  e.target.isbn.value = "";
};

// Get all data from firestore (Not Real Time)
// db.collection("books")
//   .orderBy("timeStamp", "asc")
//   .get()
//   .then((snapshot) => {
//     snapshot.docs.forEach((doc) => {
//       addBookToDOM(doc);
//     });
//   });

// Adding event listener to form
form.addEventListener("submit", addBookToDB);

// Deletes Book
const deleteBook = (e) => {
  const id = e.target.parentElement.parentElement.getAttribute("book_id");
  db.collection("books").doc(id).delete();
};

// Edit Book
const editBook = (e) => {
  const id = e.target.parentElement.parentElement.getAttribute("book_id");
  db.collection("books")
    .get()
    .then((snapshot) => {
      const bookToEdit = snapshot.docs.filter((doc) => doc.id == id)[0].data();
      title.value = bookToEdit.title;
      author.value = bookToEdit.author;
      isbn.value = bookToEdit.isbn;

      db.collection("books").doc(id).delete();
    });
};

// Real Time Updates

db.collection("books").onSnapshot((snapshot) => {
  const changes = snapshot.docChanges();
  changes.forEach((change) => {
    if (change.type === "added") {
      addBookToDOM(change.doc);
    } else if (change.type === "removed") {
      const id = change.doc.id;
      const tr = tbody.querySelector("[book_id=" + id + "]");
      tbody.removeChild(tr);
    }
  });
});
