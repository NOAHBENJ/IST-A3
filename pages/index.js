/*function printDimensions() {
	console.log("X: " + window.innerWidth + ", Y: " + window.innerHeight);
} */

// Rule of thumb(s)
/* 
* 1: Commenting debug code rather than removal, just in case it is needed
* 2: Explaining/writing documentation so I remember the purpose of the code, and to allow the readers of this to understand my thought process, and the code itself
*/

let db; // Makes the variable which will be set to the current database

function createDatabase() { // This function creates the *database*
  db = new SQL.Database(); // Sets above variable to a new database
}

function createTable() { // Creates a table in the database, so we can store data
  db.run('CREATE TABLE IF NOT EXISTS entries (name TEXT, content TEXT)'); // Creates the table
}

function insertRows() { // This will set the content of the database to all entries in the content.json file
  fetchFileContent("content.json") // Fetches content of the json file
  .then(data => { // Proceeds and creates a variable, data, of all data from the file
	localStorage.setItem("fileContent", data); // So we can refer back to this later, creates a browser-tab wide variable which is set to JSON data
    // No longer needed  //console.log( data); // DEBUG, prints the data, not the localstorage
  }).then(() => { // Proceeds
    var storedFileContent = localStorage.getItem("fileContent"); // Grabs the data set earlier
    const obj = JSON.parse(storedFileContent); // Parses the data from JSON into a JavaScript array
	obj.pages.forEach(page => { // For every entry inside of the JSON file. 
		db.run('INSERT INTO entries (name, content) VALUES (?, ?)', [page.name, page.content]); // For every entry, creates a new row in the database, of the name // (which is the number of the page, as many as I want)
	}); // Once all entries are counted
  }).then(() => {
        document.getElementById("button-1-home").click(); // This will load the home content whenever the page is first loaded, doing this in a <script> tag or at the end of the file seems to break it, and I assume due to the database not being finished, so once it is, we then load it, as I cannot press it fast enough myself for the error to reproduce on day-to-day use. 
  }); // Once everything is set
	
} // This approach allows me to dynamically make as many as I want, and does not bloat the main JavaScript file, and means that everything is seperated and sorted. // Also prevents the need for hardcoding, which is not ideal, and allows me to provide extensive JavaScript knowledge and ability, because if you are reading this, // hopefully this counts towards something, because documentation and explanation of everything takes time and effort :)
// Hopefully, you understand that these comments were written by me, and aren't just from a copy/paste source, i.e. ChatGPT or W3Schools.

function changeContent(itemNumber) { // This long function will change the content of the content section of the page, from the database - TODO was finished, added // img support. It was hard, we got there.
  let listOfThings = logEntries(); // Grabs all entries from database table
  let currentText = listOfThings[itemNumber - 1][1]; // Finds the one we want

  let contentElement = document.getElementById('content'); // Creates a variable of the content element, so we can manipulate in JavaScript
  contentElement.innerHTML = '';// IMPORTANT - if someone presses multiple buttons, rather than adding to the stack, wipes it so its only the wanted page's content
  document.title === "News" ? contentElement.style.transform = "translateY(95px) translateX(20px)" : contentElement.style.transform = "translateY(75px)"; // Due to the way that my website is made, I have to do this to fix the positioning of content based on the page name

  if (currentText) { // Error prevention, makes sure there is content
    let str = currentText; // Sets str to the currentText, what we want to change to, for simplicity
    let imageTagPattern = /<img[^>]*src=['"]([^'"]+)[^>]*>/g; // The formatted pattern that we want to find, so we can render images alongside text
    let imageTagMatches = str.match(imageTagPattern); // Finds all matches, all img tags

	let headerTagPattern = /<header[^>]*text=['"]([^'"]+)[^>]*>/g;   // The formatted pattern that we want to find, so we can render headings alongside text
	let headerTagMatches = str.match(headerTagPattern); // Finds all matches, all heading tags
	
    if (headerTagMatches) { // If there is a header tag
      for (let i = 0; i < headerTagMatches.length; i++) { // For every instance of the header tag, do x
        let match = headerTagMatches[i]; // Gets the actual match
        let headerText = match.match(/text=['"]([^'"]+)['"]/)[1]; // Gets the text of the match
        let index = str.indexOf(match); // Finds whereabouts inside of the text this specific heading is meant to be
        let textBeforeHeader = str.substring(i, index); // Gets all text before the header tag
        if (textBeforeHeader) { // If there is any, do x
          let textElement = document.createElement('p'); // Creates a p tag
          textElement.innerText = textBeforeHeader; // Puts all of the previous text into that p tag
          contentElement.appendChild(textElement); // Appends the p tag into the DOM
        }
        let headerElement = document.createElement('h1'); // Creats an h1 tag
        headerElement.innerText = headerText; // Puts the header text into the h1 tag
        contentElement.appendChild(headerElement); // Appents the h1 tag into the DOM
        i++; // Increments, so we can go to the next heading, if there is one (or many).
      }
    } 
    if (imageTagMatches) { // If there are some, do x
      let currentIndex = 0; // Sets index so we can render more than one image

      for (let i = 0; i < imageTagMatches.length; i++) { // For loop going through every image tag
        let match = imageTagMatches[i]; // Gets the specific match
        let imageUrl = match.match(/src=['"]([^'"]+)['"]/)[1]; // Formatted string so we can get only the image path
        let index = str.indexOf(match); // Gets where the image tag was found, so we know where to put it

        let textBeforeImage = str.substring(currentIndex, index); // Gets text before image, by getting all text before x, in which x is where the image was found
        textBeforeImage = textBeforeImage.replace(headerTagPattern, '');
		
		if (textBeforeImage) { // If there is text, do x
          let textElement = document.createElement('p'); // Creates a new element, of which is text
          textElement.innerText = textBeforeImage; // Sets the text
          contentElement.appendChild(textElement); // Adds text to the content, so we can do it all at once, in order.
        }

        let imageElement = document.createElement('img'); // Creates a new element, of which is an image
        imageElement.src = imageUrl; // Gets the image path
        contentElement.appendChild(imageElement); // Adds this to the overall content, so we can do it all at once, in order.

        currentIndex = index + match.length; // Sets the index so we can do multiple images
      }

      let remainingText = str.substring(currentIndex); // Grabs all text afterwards
      remainingText = remainingText.replace(headerTagPattern, '');
		
      if (remainingText) { // If there is text, do x
        let textElement = document.createElement('p'); // Creates a new element
        textElement.innerText = remainingText; // Sets the text
        contentElement.appendChild(textElement); // Adds it to content
      }
    } else { // If there is no special tags, do x
      let textElement = document.createElement('p'); // Creates a new element
      textElement.innerText = currentText; // Sets the text as everything
      contentElement.appendChild(textElement); // Adds it to main content so we can push all at once, in order
    }  
  } else { // Otherwise, do x
    contentElement.innerText = 'No content found for this item.'; // x: Makes the text a generic thing saying that there is no content. 
  }
} // That was pain! :)

function logEntries() { // This function returns all entries, will not change name to more relevant due to refactoring challenges.
  let rows = db.exec('SELECT * FROM entries'); // Gets all data from database -> table
  let list = new Array(); // Creates a new array

  let i = 0;	// Variable to keep track of forEach statement
  if (rows[0]) { // If there is data in the table
    rows[0].values.forEach((row, i) => { // Cycles through each table row
      list[i] = row; // In the above created list, adds current row to table
      i++; // Increments the variable to keep track
    }); // Once all rows have been added, finished
  }
  return list; // Returns this list
  
}

/* How to use the function below: 
fetchFileContent(filename)
  .then(data => {
    return data; // This will log the file content to the console
  });
*/

function fetchFileContent(fileLocation) {
  return fetch(fileLocation) // Get all data from fileLocation
    .then(response => { // Parse data
      if (!response.ok) { // If the response is not ok, hence the '!'
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text(); // Returns the response if there is one, and if it is valid. This will be file text.
    })
    .catch(error => { // If an error, print x
      console.error('There was an error fetching the file.', error); // Print error 'x'
    });
}

createDatabase(); // Init database, 
createTable(); // Init table
insertRows(); // Fill Table
logEntries(); // Debug, prints all table data
// More debug
/*fetchFileContent("content.json") // Function above
  .then(data => { // Creates variable data, which is the returned file data from fetchFileContent(x)
	localStorage.setItem("fileContent", data); // Creates a variable in browser temporary storage of the file content
    console.log( data); // DEBUG, prints data, not a reference to local storage, a reference to the above created 'data =>'
  }).then(() => { // Proceed to once previous job is finished
    var storedFileContent = localStorage.getItem("fileContent"); // Check to see storage worked by getting the data stored earlier
    console.log(storedFileContent); // DEBUG, prints the above check to visualise status
}); */ // No longer needed, commenting rather than removing just in case it is needed again
// END OF FILE