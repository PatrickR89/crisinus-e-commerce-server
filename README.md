## Crisinus-Server (Backend / Full Stack)

Application is built mainly with node.js and express.js. As the whole Crisinus app does not have too much of traffic for now, and I did not learn .NET, Java, Python or other better language for server-side.

## API calls

API calls are wrapped with JSON Web Token to disable any access without provided client, and additionaly to limit access to APIs meant only for admin users. Beside JWT, they are wrapped in function which checks connection to MySQL DB, and in case of timeout or error restart connection, to reduce chance of losing connection to data on live server. Also they are wrapped in error handling functions, for cases of invalid input to DB.
APIs are separated into "routes" and "controllers" for better readability and cleaner code, "controllers" are called in routes, which are then called from main file.

## Session

Session and cookies are handled with express, with addition of cookie-parser, and are stored with MemoryStore node package, due to deprecation of express' onw session store, with expiration of 3 days. 

## CORS

CORS was added for development, while connecting React application to node (I did not know in start about setting a proxy in react package.json), although it has outlived it's usefullness, I did leave it in application, for some possible future testing, as I intend to create an iOS app for same web app. CORS is currently useless as the frontend app is integrated into node.

## DATABASE

For practice and it's usefulness MySQL is used as the database, as also it is the most common database on hosting servers in my country. Application connects with DB via mysql2 node package, with use of promise in pool connections. Except for one part in adding, editing and deleting books, where I needed to use promise to have in time loaded authors (separate table in DB) for loaded book(s), rest of the code did not require async access to DB, but did make my code lot cleaner, without nesting. 
Another important part in connecting to DB, is on inital start of the application, where application makes a one-time connection to DB, checks existing tables, and in case of need creates all required tables which are missing in DB. After that, that connection is terminated, and cannot be reopened, unless app is restarted.

## Logs

As I had no previous experience, I did not know how exactly does logging work on hosting servers. I chose to add my own logs to app, with Winston node package. Logger is set to log recieved messages into two files. One containing information and errors from node app, while the other containing info and errors from clinet (frontend), which are sent via API. 

## Guest safety

To make whole thing safe for and from guests browsing the pages, all input directed towards database is wrapped in joi.js middleware to reject all HTML input. 

## Client

As I mentioned before, client application is integrated in node.js, and called on any and every route call which is not a defined API call.
More about client: [https://github.com/PatrickR89/crisinus-e-commerce]
