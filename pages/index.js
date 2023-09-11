function printDimensions() {
	console.log("X: " + window.innerWidth + ", Y: " + window.innerHeight);
}

let db;

function createDatabase() {
  db = new SQL.Database();
		console.log("created db")
}

function createTable() {
  db.run('CREATE TABLE IF NOT EXISTS entries (name TEXT, content TEXT)');
		console.log("created table")
}

function insertRows() {
  let entries = [
    { name: '1', content: 'Content for Item 1' },
    { name: '2', content: 'Content for Item 2' },
    { name: '3', content: 'Content for Item 3' },
    { name: '4', content: 'Content for Item 4' },
    { name: '5', content: 'Content for Item 5' },
    { name: '6', content: 'Content for Item 6' },
    { name: '7', content: 'Content for Item 7' }
  ];

  entries.forEach(entry => {
    db.run('INSERT INTO entries (name, content) VALUES (?, ?)', [entry.name, entry.content]);
  });
	console.log("inserted rows")
}

   function changeContent(itemNumber) {
     let stmt = db.prepare('SELECT * FROM entries ');
     let result = stmt.get();
	   console.log(result)

     let contentElement = document.getElementById('content');

     if (result && result.content) {
       contentElement.innerText = result.content;
     } else {
       contentElement.innerText = 'No content found for this item.';
     }
   }

function logEntries() {
  let rows = db.exec('SELECT * FROM entries');
  
  rows[0].values.forEach(row => {
    console.log(row);
  });
}



createDatabase();
createTable();
insertRows();
logEntries();
