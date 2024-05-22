// Complete Events Exercise

const http = require("http");
const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");
const qs = require("querystring");

// Part 1: Creating the server and emitting 'signup' event
const NewsLetter = new EventEmitter();

/**
 * 
 * @param {.csvFile} csvData 
 * @returns html component with the list of subscribers
 *          read from the .csvFile.
 */

const generateSubs = (csvData) => {

  const lines = csvData.split("\n");
  let html =
    "<html><head><title>Newsletter Subscribers</title></head><body><h2>Newsletter Subscribers</h2><ul>";

  lines.forEach((line) => {
    
      
      if (line.length > 0) {

        const [name, email] = line.split(",");
        html += `<li><strong>${name}</strong>: ${email}</li>`;          
          
      }
      
      
  });

  html += "</ul></body></html>";
  return html;
};


/**
 * The method generate a form to input name and email for
 * the newsletter subscribers
 * 
 * @returns a Form Component
 */

const generateForm = () => {

  return `
        <html>
        <head>
            <title>Newsletter Signup</title>
        </head>
        <body>
            <h2>Newsletter Signup</h2>
            <form method="POST" action="/newsletter_signup">
                <label for="name">Name:</label><br>
                <input type="text" id="name" name="name"><br>
                <label for="email">Email:</label><br>
                <input type="email" id="email" name="email"><br><br>
                <button type="submit">Subscribe</button>
            </form>
        </body>
        </html>
    `;
};

/**
 * @param (callback function that runs anytime a request is made to d server)
 */

const server = http.createServer((req, res) => {

  if (req.method === "POST" && req.url === "/newsletter_signup") {
    // Initialize an array to store request data chunks
       let body = "";

       // Listen for data chunks
       req.on("data", (chunk) => {
         body += chunk.toString();
       });

       // When all data is received
       req.on("end", () => {
         // Parse the form data
         const formData = qs.parse(body);

         // Logic to add the data to the CSV file (you can reuse your existing logic here)
         // For demonstration purposes, we'll just log the received data
           console.log("Received form data:", formData);
           
           NewsLetter.emit('signup', formData);

         // Respond with a success message
         res.writeHead(200, { "Content-Type": "text/html" });
         res.end(`<p>Thank you, ${formData.name}, for subscribing to our newsletter!</p>` );
       });               

      
  } else if(req.method === 'GET' && req.url === '/newsletter_signup') {
    
    /**
     * A get request method handler that handles get request
     * on the /newsletter_signup route of the server.
     *
     * Which generate a form to input name and email of the
     * newsletter subscribers.
     */

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(generateForm());
    
  } else if(req.method === 'GET' && req.url === '/subscribers') {
    
    /**
     * A get request method handler that handles get request
     * on the /subscribers route of the server.
     *
     * Which generate a list of the name and email of the
     * newsletter subscribers.
     */

    const filePath = path.join(__dirname, "newsletter_list.csv");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }

      // Generate HTML content from CSV data and respond
      const htmlContent = generateSubs(data);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(htmlContent);
    });
  } else {
        // If request method is not GET or URL is not '/newsletter_signup'
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    } 
    
});

// Part 2: Event listener for 'signup' event
NewsLetter.on("signup", (contact) => {

  const csvFilePath = path.join(__dirname, "newsletter_list.csv");
  const csvContent = `${contact.name},${contact.email}\n`;

  fs.appendFile(csvFilePath, csvContent, (err) => {
    
     if (err) {
        console.error("Error appending to CSV file:", err);
     } else {
        console.log("Contact added to newsletter list:", contact);
    }
      
  });
});


/**
 * Start the Server up, and giving it an address on the OS,
 * which is a port number incase a message comes for it.
 * 
 * Port Number are like addresses for apps on an OS.
 * so any time a request is made to the local host IP(Your Machine).
 * your Machine's OS uses the port number to locate the particular
 * app the request is for, which in this case is our node webserver app on 
 * your machine.
 */

server.listen(5000, () => { 
    console.log("I;m listening @ port 5000");
})
