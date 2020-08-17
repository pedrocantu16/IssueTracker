# PedroCantu-Book
Work through Pro MERN Stack 2nd Ed

This is my repository for the project described in the book Pro MERN Stack (2nd Ed) by Vasan Subramanian.
This file contains description for the progress made through the chapters, also includes images of the
status of the application at the end of each chapter.

## Chapter 15

Link to heroku: https://tracker-ui-pantu16.herokuapp.com

### Summary

In this chapter the application was finally deployed. Heroku was used as a Platform as a Service to deploy and mantain the application live.
Repos for UI and API were created separately and those were deployed individually on heroku, so the API can be accessed on the playground using 
graphql. One of the most challeging parts on this chapter was to connect an online database to the application. At the end of the chapter Proxy
mode was used to share the same resources between API and UI applications.

![Ch15 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter15.png)

### Notes

#### Git Repos

UI and API git repositories were created to deploy each application individually to heroku.

#### MongoDB

Atlas was used as an online database. The steps required:
  - Create cluster on Atlas
  - Run the command on CLI to connect to database and create new database and collections.
  - Set the DB_URL to the config variables on heroku to link the database to the application.

#### The API application

Changes before deployment:
 - change environment variable as PORT on api/server
 - Change environment variable as PORT on api/.env file
 - enable GraphQL playground in production in api/api_handler.js
 - Add engines to package.json (node and npm) to specify version
 - Commit changes to github and heroku

Run heroku config:set and change
 - DB_URL =  to the Atlas DB
 - JWT_SECRET =  to any string random
 - COOKIE_DOMAIN = To be the herokuapp.com domain (or UI domain)

Run `git push heroku master` to deploy. To test for errors run `heroku logs`.

#### The UI application

Changes before deployment:
 - Change the variable that sets the port to listen on ui/server.js
 - Change the PORT variable on .env file
 - To handle compilation before starting the server and linking/copying Bootstrap static CSS and JS files to the public directory.
   - Used heroku-postbuild added to ui/package.json
   - Other option is command `npm posinstall` after `npm install` finishes.
   - Configure: UI_API_ENDPOINT, UI_AUTH_ENDPOINT and GOOGLE_CLIENT_ID
 - Configure on API directory: UI_SERVER_ORIGIN

#### Proxy Mode
Set environment variables on heroku ui
 - UI_API_ENDPOINT
 - UI_AUTH_ENDPOINT
 - UI_SERVER_API_ENDPOINT
 - API_PROXY_TARGET

Add flag `changeOrigin`: true in ui/server.js, on the `apiProxyTarget` conditional.


## Chapter 14

### Summary

In this chapter Google Sign-In was implemented as a mean to identify users. The application allows the user to view all the information without signing in, but to make any changes, they have to sign in. It ensures that the entire pages can be rendered at the UI server even though they are authenticated pages.

![Ch14 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter14.png)

### Notes

#### Sign-In UI

 - In the navigation bar, let’s have an item with label “Sign In”. On clicking this, let’s show a modal dialog that lets the user sign in using a button labeled `Sign In`. We’ll have only one but it could have multiple sign-in options like Facebook, Github, etc.
 - On successful sign-in, let’s show the username instead of menu. Include a drop-down menu that lets the user sign out.
 - Create a `SignInNavItem` component which can be placed in the navigation bar.
 - `showModal` and `hideModal` methods control the visible state of the modal using a variable called `showing`. 
 - Let’s have a state variable object called `user` to save the signed-in status (signedIn) as well as the name of the user (givenName). If the state variable indicates that the user is already signed in, the `render()` method returns just a dropdown and a menuitem to sign out the user.

#### Google Sign-In

 - Create a console projects and a client ID to identify the application.
 - Include the google library in template.js
 - Access the client ID while initializing the library. Pass it along using a request to `/env.js`.
 - Modify SignInNavItem:
   - Initialize the Google library in `componentDidMount`. 
   - Set a state variable `disabled` (initialized to true) on successful initialization of the library. 
   - Within the modal dialog, let us replace the plain text button with a button that follows Google’s branding guidelines. 
   - If the client ID is missing, let’s show an error message when the Sign In menu items is clicked. Otherwise show the modal dialog.
   - In the `sigIn` handler, let’s call the auth2.signin() method.

#### Verifying the Google Token

The client authentication library returns a token on successful authentication, which can be verified at the back end using Google’s authentication library for Node.js. We will need to send this token from the UI to the back end for it to be verified.
Create a file called `auth.js` in the API server to hold all authentication-related functions:
 - Install a parser that allows to access the body of POST request. Install Google authentication library.
 - Construct a router that we’ll export. Also, install the body-parser middleware in this. It will accept only a JSON document in our endpoints.
 - Implement just one route ‘/signin’. Within this route implementation, we’ll retrieve the supplied Google token from the request body and verify it using the Google authentication library.
 - Once we have the payload based on the verified token, we can extract various fields such as name and email from the payload. Let’s extract these and respond with a JSON object that contains these, as well as a Boolean to indicate that the sign in was successful.
 - Mount the routes in the main app. Separate namespace from /graphql. To access the signin endpoint the full path to use will be `/auth/signin`. On api server.js
 - New configuration variable for it so that the UI can send requests to it.

#### JSON Web Tokens

JSON Web Tokens (JWT) solve this problem by encoding all the session information that needs to be stored in a token. Creating our own token lets us add more variables, for example, a role identifier can be added to the session information and that can be quickly retrieved to apply authorization rules.

| Storage Method | Pros                  |	Cons                                                                                                   |
|:--------------:|:---------------------:|:-------------------------------------------------------------------------------------------------------:|
| In-memory	     | Secure; No size limit | Limit Session is not persistent; Including the token in all requests has to be programmatically managed |
| Local storage  | No size limit         |	May be vulnerable to XSS attacks; Storage and token inclusion has to be programmatically managed       |
| Cookie	       | Simple to implement	 | Size Limit on data; Cross-domain limitations; Vulnerable to XSRF in HTML forms                          |

Use the cookie to store JWT:
 - Generate the JWT in the sign in API. Use `jsonwebtoken` package  and `cookie` as well.
 - The `jsonwebtoken` package provides a simple function called `sign` that takes in a JavaScript object and encrypts it using a secret key. Then set a cookie called jwt with the value as the signed token.
 - Let’s create a new API to get the current logged-in status. This will do both the jobs of verifying the JWT as well as extracting the username. Within this, we’ll retrieve the JWT from the cookie and call jwt.veify(), which does the reverse of `sign`: gets back the credentials.
 - Create a JWT_SECRET configuration variable in the environment.

#### Signing Out

Signing out requires two things: the JWT cookie in the browser needs to be cleared and the Google authentication needs to be forgotten. Implemented another API under `/auth` to sign out, which will essentially just clear the cookie.

#### Authorization

Implement rule to prevent users from making changes when not signed in.
 - Create the context that holds user information and is passed on to each resolver as the third argument. This is done during initialization of the Apollo server.
 - Specify a function that takes in an object, with `req` as one property, and returns the context that will be supplied to all resolvers. Implement getContext using auth.getUser() from auth.js.
 - Implement a function that takes is an existing resolver and returs a function that does the check before executing the resolver.
 - To prevent unauthenticated users from calling protected APIs, let’s replace their exports with a `mustBeSignedIn` wrapped function.

#### Authorization-Aware UI

Make the UI aware of the signed-in status:
 - Choose Page component as the component in the hierarchy where the user signed-in state will reside. Convert the component into a regular component.
 - Move the state variable `user` from SignInNavItem to `Page. Let’s use a single method called `onUserChange` instead of separate methods for signing in and out. Pass this method and the `user` variable down to the navigation bar.
 - Load the state in componentDidMount() by making a call to the API /auth/user.

#### React Context

Disable the `Close` and `Delete` buttons in the Issue Table and then disable the `Submit` button in the Edit page.
React Context:
 - Pass properties across the component hierarchy without making intermediate components aware of it. Designed to share data that is to be considered global.
 - Create a context using  the React.createContext() method. Takes as an argument the default value of the context that will be passed through to all components that need it. 
 - Argument will be the user, let us create a user with default value to an initial state where the user is not signed in.
 - Share the context across components where its value is being set as well as where it is being used.
 - The created context exposes a component called `Provided` under it. Which needs to be wrapped around any component hierarchy that needs the context.
 - Let’s set the user state as the value in the provider and wrap the provider around the `Contents` component in `Page`.
 - All the descendants of `Contents` can access the user context. Let’s first consume it in the IssueEdit component. Define the static variable `contextType` and set it to the object `UserContext`. Then the user will be available at `this.context`, which we’ll use to get the `signedIn` property and disable the `Submit` button based on that.

#### CORS with Credentials

Let us try to enable CORS for the `/auth` set of routes. The cors package lets us do this very easily. All we need to do is install a middleware in the route which will deal with setting up the necessary headers in the preflight requests to the API server. Let us first install the package in the api directory.

The default CORS configuration seems to allow requests but does not allow cookies to be sent for cross-origin requests.

To let credentials also be passes to cross-origins, the following must be done:
 - All XHR calls must include the header credentials: `include`.
 - Allow requests with origin only from UI server. 
 - The server must also explicitly allow to send credentials.
 - Since all GraphQL API calls are routed through graphQLFetch function, the only place we’ll need to add the credentials: ‘include’ header is in graphQLFetch.js.

#### Server Rendering with Credentials

There are essentially three challenges that server rendering with credentials poses, which is different
from the regular pattern of server rendering that we used for the routed views:
 - The initial data fetched for the user credentials goes to the /auth endpoint rather than the /graphql endpoint. Server rendering relies on the fact that all data fetching calls go through graphQLFetch(), where we make critical decisions based on whether the call is made from the browser or the UI server.
 - When the user data is fetched, the API call made by the UI server to fetch the data must include the cookie. When called from the UI, the browser would have added this cookie automatically. But in the UI server, we’ll need to manually include the cookie. Otherwise, the call will behave as if the user is not signed in.
 - The initial data that is fetched needs to be in addition to any other data fetched prior to rendering using `fetchData()` functions in the views. Also, this data is not fetched by any view which is part of the routes: it is fetched at a much higher level, in the Page component.

#### Cookie Domain

Set environment variables and configure your UI server so that the API endpoint is based on api.promernstack.com:3000 and then use ui.promernstack.com:8000 to access the application

## Chapter 13

### Summary

In this chapter we implemented different features such as reusing code across component to display the Toast messages, the Report page using aggregate function of MondoDB. Also, implemented pagination in the IssueLits page to display larger lists using skip and offset of `find()` in MongoDB. Additionally,  a `undo` operation was implemented when deleting issues to recover them. Finally, a search bar was implemented to allow users look for issues using keywords.

![Ch13_1 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter13_1.png)

![Ch13_2 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter13_2.png)

### Notes

#### Higher Order Component for Toast

There is repeated code across the main views for showing and managing Toast messages. React recommend composition over inheritance for reusing code across components. Created a new component that wraps each of the main views to add the Toast functionality.

Moved all the state variables relating to the Toas into the ToastWrapper component and the dismissToast method.  Within render, we can use the state variables to control the display of the Toast, moving the code out of IssueList.

Created methods showError and showSuccess in ToastWrapper and passed them as props to IssueList as a way to show error, and if required, dismiss it.

#### MongoDB Aggregate

Implement report section using MongoDB `aggregates`. MongoDB provides the collection method `aggregate()` to summarize and perform various other read tasks on the collection using a `pipeline`. A pipeline is a series of transforms on the collection before returning the result set. Without any arguments is identical to `find()`, that it returns the entire list of documents in the collection.

Pipeline consists of stages, each stage transforms the documents as they pass through the pipeline. `match` stage act as a filter on documents from the previous stage. `project` can be used to transform the document, even adding calculated fields to the document using expressions. `group` is one stage that produces a summary rather than replicate each document. `unwind` expands array fields into one document for each array element.

 - `aggregate()` method takes one parameter, an array of pipeline stage specifications. Each stage specification is an object with a key indicating the type of the stage and the value holding the parameters for the stage.
 - `match` stage takes in the filter, as specified in find() method.
 - `group` consists as a set of fields that need to be created, and a specification of how they need to be created. The `_id` field is mandatory and has a special meaning: it is the value that the results are grouped by.
 - To filter before grouping the output, a match can be used as the first element in the array, followed by the group stage.

#### Issue Counts API

As part of the Issue Counts API implementation, we need to make the aggregate query to MongoDB. In the array returned let’s have one element per owner rather than one element for each owner-status combination, and one property each for the count of each status. In GraphQL schema we need to define a new type:

Type IssueCounts{ owner: String!  New: Int  Assigned: Int  Fixed: Int  Closed: Int }
The query itself will take as input a filter specification (as in the issuelist query) and return an array of IssueCount objects.
We’ll place the implementation of the API or the resolver in issue.js along with other resolvers related to this object. We call the new function counts() which will take in a filter specification, the same as for the list function. Process each document returned by the database and update an object called `stats`.

To tie the new function to the GraphQL schema, let’s make changes to api_handler.js that specify the resolver for the end point issueCounts.

#### Report Page

Let’s line up the statuses on the horizontal axis (table row header) and use one row per owner to show the count of issues assigned to that owner. We’ll use a collapsible panel and place the IssueFilter component here, just like we did for the Issue List.

We need to change the IssueFilter component. Because the apply button is hard-coded to navigate to the rout/issues, with the filter set as the search string. It should pass the base URL as props to the component. From the Issue List, this can be passed as `/issues` and from the Report page it can be passed as `/report`.

 - A constructor to fetch the initial data from the store and delete it after consumption.
 - A componentDidMount() method to load the data in case it has not been loaded yet.
 - A componentDidUpdate() method to check if the search string has changed, and if so, reload the data.
 - A loadData() method that these two lifecycle methods can call to load it and set the state.
 - A Toast wrapper, which will need to be exported rather than the original class.
 - `render()` with a collapsible filter and a table. Create an array of all statuses that we can iterate over for the header columns. As for the rows themselves, we need to iterate over the data received by calling the API, store this data in `stats`. Implement the data fetching statis method, fetchData().

#### List API with Pagination

Implement the API to support pagination. We also need the total count of pages for the list.
 - Modify the schema to add a count of pages in addition to the list of issues.
 - Instead of returning the list of issues directly, we’ll need to return an object that contains the list as well as a page count.
 - In addition to the filter specification, we need to specify which page to fetch.
 - We’ll have to use the new parameter page to skip to the given page and limit the number of objects returned. The MongoDB method `skip()` can be used to get the list of documents starting at an offset. Further the `limit()` cursor method can be used to limit the output to a certain number. Use PAGE_SIZE constant for the number of documents in a page.
 - Whenever using an offset into a list, we need to ensure that the list is in the same order when queried multiple times. Without an explicit sort order, MongoDB does not guarantee any order in the output. The order of the output may vary between two queries. We need to include a sort specification. We can use the ID as a natural key to sort on.
 - Also need a count of pages, which needs the count of documents matching this filter.  MongoDB let us query the cursor itself for the number of documents it matched. Instead of converting the cursor that `find()` returns to an array, let’s keep the cursor and query it for the count first, and the conver it to an array and return it.
 - The return value in the schema has changed, we’ll need to change the caller, the IssueList component to accommodate the change. Instead of using the value issuelist directly from the data, we’ll need to use it as issuelist.issues.

#### Pagination UI

Implement the pagination UI, using `<Link>` or equivalent that works well with React Router.
 - Modify the data fetcher in the issuelist component to include the total count of pages in the query and save it in the state.
 - Now data.issueList.issues will have a list of issues and data.issueList.pages will have the total count of pages for this.
 - In render() we can start laying out the pagination bar. But each link in the bar also needs to encode the currently active filter, in addition to using a LinkContainer to create the actual link. Create a new component called `PageLink` in the same file. This will wrap whatever is being passed in as the display object with a link, based on the search params that are passed, the page number to link to, and the current page to determine if the link needs to be highlighted as active.
 - In render() we can generate a series of page links. Using React-Bootstrap’s `Pagination.Item` component.
 - Display the set of item in the returned JSX as part of the pagination bar.

#### Undo Delete API
 - Change the schema first.
 - Move the object from the deleted _issues collection to the issues collection.
 - Tie the resolver to the API endpoint in the API handler.

#### Undo Delete UI

Include a button that can be clicked to initiate the undo. This needs to be done in the IssueList component. When the button is clicked the Restore API needs to be called. This is done by using a method in the IssueList class for restoring an issue, one that takes in the ID of the issue to be restored. The undo button can now set its onClick property to this method.

#### Text Index API

MongoDB’s text index lets you quickly get to all the documents that contain a certain term. A text index gathers all the terms (words) in all the documents and creates a lookup table that, given a term (word), returns all documents containing that term (word).

#### Search Bar

Let’s use `React Select` as it fits the purpose nicely: after the user types in a word, the requirement is to asynchronously fetch results and show them in a dropdown, one of which can be selected.

 - Create a new component within the UI source directory that will display a React Select and implement the methods required to fetch the documents using the new search filter in the List API.
 - React select needs two callbacks to show the options: loadOptions and filterOptions.
 - loadOptions needs to return an array of options. Each option is an object with the properties label and value, the label being what the user sees and the value being a unique identifier. Choose the issue ID as the value, and for the label, let’s combine the ID and the issue title.
 - filterOption is expected to be called for each of the returned options to determine whether to show the option in the dropdown.
 - React select proveds onchange property which is a callback that is called when the user selects an item, with the value of the selected item as an argument.
 - InstanceId to identify the control in case of many react selects. Get rid of the dropdown indicator. Don’t show the selected item.
 - Show an error when getting errors while calling the API.

## Chapter 12

### Summary

In this chapter, we implemented server rendering, which generate HTML on the server in addition to being able to render to the DOM. This enables isomorphic applications, which use same codebase on the server as well as the client to do either task: render to the DOM or create HTML. The need for this is when the application needs to be indexed by search engines.
To have a properly indexed application, the server needs to respond with the same HTML that will result after the Ajax call in `componentDidMount()` methods and subsequent re-rendering of the page. To make this work:
 - `Server Rendering`. The first time any page is opened in the application (typing URL or refreshing the browser), the entire page will be constructed and returned from the server.
 - `Browser Rendering`. Once any page is loaded and the user navigates to another page, it will work as a SPA. Only the API will be made, and the DOM will be modified directly on the browser. 

![Ch12 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter12.png)

### Notes

#### New Directory Structure

All the code under `src` in UI was meant to be compiled into a bundle and served to the browser. What will be needed is three sets of files:

 - All the React components, or shared files.
 - A set of files used to run the UI server using Express. This will import the shared React components for server rendering.
 - A starting point for the browser bundle, one that includes all the shared React components and can be sent to the browser to execute.

This require that the linting, compiling and bundling configurations change to reflect the new directory structure. Let us have one `.eslintrc` files at each directory, one at `ui`, and one in each of the sub-directories `src`, `browser` and `server` directories.

#### Basic Server Rendering

We used `ReactDOM.render()` method to render a React element into the DOM. The counterpart method that is to be used to create an HTML on the server side is `ReactDOMServer.renderToString()`.

First implemented About.jsx component. Imported in Contents.jsx so that /about load the About component.

To render the About component on the server. It needs compilation manually to pure JS so that the server can include it
 - Npx babel src/About.jsx –out-dir server. This results in a file called About.js in the server directory.
 - In the server we can render a string representation of the component using the following: `ReactDOMServer.renderToString(<About />);`
 - We need a template that can accept the contents of the `<div>` and return the complete HTML. ui/server/template.js
 - Import the About component and rendering it to string, let’s do a new file in the server directory in a function called `render()`. The function will take in a regular request and response like any Express route handler. It will then send out the template as a response, with the body replaced by the markup created from ReactDOMServer.renderToString().
-	In uiserver.js we can set this function as the handler for the route with the `/about` path.

#### Webpack for the Server

We need the About component to get data by calling the about API and rendering it on the server. We need to compile the About.jsx into About.js manually and all the files under the ui/src directory. Also, the import/export paradigm and require/module.exports not convenient when mixed.
Webpack can be used for the server as well, it can compile JSX on the fly. This will allow to use import/export paradigm in the UI server codebase. Server-side packages such as Express are not compatible with Webpack. We will have to exclude the third-party libraries from the bundle and rely on node_modules to be present in the UI server’s file system.
 - Add a new section in the webpack.config.js file for the server configuration.
 - The `browserConfig` variable contains the original configuration contents. One issue of using shared files between the server and the browser is that we cannot use the same Babel configuration. Because the browser needs a list of browser versions, while the Node.js the target is the latest version alone. For that let us use Babel options via Webpack.
 - For the server configuration, we will need an output specification. Let us compile the bundle into a new directory called `dist` (distribution) and call the bundle server.js.
 - For Babel configuration for the server, let us compile all js and jsx files to target Node.js version 10 and include the React preset.
 - Install webpack-node-externals module which exclude modules in node_modules. Import and use it in Webpack configuration.
 - Convert all the `require()` statements to import statements. Disable ESLint for not specifying extensions in imports.
 - As for render.js, changed all the require() to import statements. Replaced React.createElement() with JSX and change the file’s extension to reflect this fact.
 - In the uiserver.js, we will also need to change the HMR initialization routine that loads up the initial configuration.
 - `source-map-support` module makes convenient to add breakpoints and make errors more readable on the back end.
 - Change the scripts section in package.json to use the bundle to start the server instead of the file `uiserver.js`.

#### HMR for the Server

Reload changes to modules based on the shared folder. As for changes to uiserver.js itself, we expect these to be very few and far between, so let’s restart the server manually when this file is changed and use HMR for the rest of the code that it includes.

Package `webpack-merge` comes in handy for merging HMR changes on top of the server configuration in a new file called webpack.serverHMR.js. First load up the base configuration from the main configuration file.

Modified `package.json` script section to add convenience scripts for starting the UI server.

 - `start`, remove nodemon (HMR will load the modules automatically).
 - `watch` script with a `watch-server-hmr` script that runs the webpack.serverHMR.js configuration in the watch mode.
 - `dev-all` to run watch-server-hmr and npm start. Have a sleep command before npm start.
 - On windows PC, you may need to create your own batch file with equivalent commands or execute `npm run watch-server-hmr` and `npm start` on different command windows.

#### Server Router

React Router recommends that we use a StaticRouter in place of a BrowserRouter. Also, whereas the BrowserRouter looks at the browser’s URL, the StaticRouter has to be supplied the URL. Based on this, the router will choose an appropriate component to render.
StaticRouter takes a property called `location` which is a static URL that the rest of the rendering will need. It also needs a property called `context`, whose purpose is not obvious right now, so let’s just supply an empty object for it.

#### Hydrate
In order to attach event handlers, we have to include the source code and let React take control of the rendered page. Do this by loading React and letting it render the page as it would have done during browser rendering using the ReactDOM.render().
React makes a distinction between rendering the DOM to replace a DOM element and attaching event handlers to the server-rendered DOM. Let’s change render() to `hydrate()` as recommended by the warning.

#### Data from API

The string in the About component should come from the API server. The about API result should be displayed in place of the hard-coded version string for the API. We need the API return the value to be available when the component is being rendered on the server. We’ll need to make request to the API server via graphQLFetch() from the server as well.
 - Replaced `whatwg-fetch` module with something that can be used both on the browser as well as Node.js. This is package `isomorphic-fetch` to achieve this.
 - Use process.evn variables. `DefinePLugin` is a webpack plugin that can be used to define global variables that are available at runtime.
 - Change graphQLFetch to get the correct API endpoint from process.env or from window.ENV depending on whether its being run on Node or on the browser.
 - Create a global store for all data that is needed for the hierarchy of components that need to be rendered, to pass this information down to the About component while it’s being rendered.
 - With data available in the global store, we can now change the About component to read it off the global store to display the real API version.

#### Syncing Initial Data

It is needed to make the browser render identical to the server render. We need the data when the component is being rendered for the first time. The way to do it is to pass the same initial data resulting from the API call to the browser in the form of a script and use that to initialize the global store. This way when the component is being rendered it will have the same data that was rendered at the server.

#### Common Data Fetcher

Add `componentDidMount()` method in the About component that could be used to populated its message to take care of the case where it is mounted only in the browser. In ComponentDidMount(), data can be fetched and set in the state if the state variable api About has not been initialized by the constructor.
In the render method we can use the state variable rather than the variable from the store.

#### Generated Routes

Make fetch data that is appropriate for the component that will actually be rendered within the page. First, instead of returning index.html, let’s return the server-rendered HTML using the template for all the pages. The change for this is in the Express route that deals with the path `/about`, replace this with `*` to indicate any path should return the templated HTML.

The main problem to solve is that the data required via API calls needs to be available before rendering is initiated on the server. The only way this can be done is by keeping a common source of truth for the list of routes available. Then, we could match the request’s URL against each route and figure out which component and therefore which `fetchData()` method will match.

Let’s keep this list of routable pages in a JavaScript array in a new file called `routes.js`. This can be a simple array with the path to the route and the component that needs to be rendered if the route is matches with the URL.

While rendering, both on the server as well as the browser, one of the routes will be chosen for rendering based on the URL.

#### Data Fetcher with Parameters

Make IssueEdit component render from the server with the data that it requires prepopulated. Separated the data fetcher into a static method as we had done in the About component. While rendering on the server, the result of the matchPath() call gives us the same information.
Moved the GraphQL query to the fetchData() function to include the match and execute it with the issues ID obtained from the match object. In the componentDidMount() method, we can now look for the presence of the state variable.
`serialize-javascript`, package to serialize the contents of the initialize data so that it is proper JavaScript and the property created will be assigned with new Date(…).

#### Data Fetcher with Search

Implement the data fetcher in the IssueList component. Deal with the fact that the search (query) string part of the URL is needed for fetching the correct set of issues. Pass the query string (React Router calls this search) in addition to the match object to `fetchData()`. We have to search for the ? character and use a substring operation on the request’s URL to get this value.

#### Nested Components

React Router’s dynamic routing works great when navigating via links in the UI, it is inconvenient when it comes to server rendering. It cannot easily deal with nested routes. Alternative is the route specification for IssueList that includes an optional Issue ID, and this component deals with the loading of the detail part too.

 - The route specification remains simple and has only the top-level pages in a flat structure, without any hierarchy.
 - IT gives us an opportunity to combine two API calls into one in the case where the Issue List is loaded with a selected issue.

The IssueList component, we’ll find the ID of the selected issue in props.match. In fetchData() we’ll use the match object to find the ID of the selected issue and use it. If there exists a selected ID, we’ll fetch its details along with the issue list in a single GraphQL call.

#### Redirects

A request to the home page `/`, returns a HTML from the server that contains an empty page. We need the server itself to respond with a 301 Redirect so that the browser fetches `/issues` instead from the server. This way search engine bots also will get the same contents for a request to `/` as they get for `/issues`. React Router’s `StaticRouter` handles this by setting a variable called `url` in any context that is passed to it.

## Chapter 11

### Summary

In this chapter, the UI style was improved using React-Bootstrap. Therefore, making it look more professional. Different bootstrap components were implemented such as Table, Inline forms, horizontal forms, panels and Toast. Also, the Create Issue functionality was implemented as a modal component that can be accessed from any page on the application.

![Ch11 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter11.png)

### Notes

#### Bootstrap Installation

`React-Bootstrap` contains a library of React components and has no CSS styles or themes itself. It requires `Bootstrap stylesheet` to be included in the application to use these components. It requires Version 3 of stylesheet. It can be included by:
 - Either, directly from a CDN in index.html.
 - Or, installing it locally using npm. bootstrap@3
 - Include stylesheet in the application. Keep a symbolic link to the Bootstrap distribution under the public directory and include the CSS just like the other static files such as index.html.

#### Buttons

`<Button>` component uses the `bsStyle` property to make buttons look distinct. Allowed styles are default, primary, success, info, warning, danger, and link.
 - Button on IssueFilter with bsStyle = “primary”.
 - Use icons instead of text for the buttons in the IssueTable for closing and deleting issues. Using `Glyphicon` component. `bsSize` for the size of the button. 
 - `Tooltip` component that is show on hovering over the button. Using `OVerlayTrigger` component that wraps the button and takes in the Tooltip component as a property. Use `delayShow` property of `OverlayTrigger`.

#### Navigation Bar

The starting point to create a navigation bar is `Navbar`.
 - Each item is a `NavItem`. These items can be grouped together in a Nav.
 - We need two Nav elements, one for the left side of the navigation bar and another for the right side.
 - The right side Nav can be aligned to the right using the `pullRight` property.
 - For the application title, let’s use `Navbar.Header` and `Navbar.Brand`.
 - `NavDropdown` component can be used to create a dropdown menu, with each menu item being a `MenuItem` component.
 - The `NavItem` component can take an `href` as a property, or an `onClick` event handler. This introduces two problems, browser refresh with href and <Link> uses and anchor tag and there is no way to change that component class. 
 - The solution is to  install `react-router-bootstrap` package, which provides called `LinkContainer` acting as the React Router’s `NavLink` at the same time letting its children have their own rendering.

#### Panels

Bootstrap `Panel` component is a great way to show sections separately using a border and an optional heading. Use it to decorate the Filter section in the IssueList page.
 - Adding a panel around the IssueFilter instance in the render() method. The IssueFilter will be put inside the Panel.body. For title use Panel.Title.
 - Adding `collapsible` property to the Panel.body. To collapse the panel.
 - The grid system of Boostrap is the one that adds the margins. Wrap the body of the page with a <Grid> component to add margins. Add the grid component around the `Contents` component instance in `Page.jsx`.
 - Make the panel heading clickable. We need to add a style in `index.html`.

#### Tables

Use `LinkContainer` and `Table` in the IssueTable.jsx
 - Replace <table> with <Table> component.
 - Add some table properties:
   - Striped: highlights alternate rows with a different background.
   - bordered Adds a border around the rows and cells.
   - Condensed: the default size has too much white space around the text.
   - Hover: highlights the row under the cursor.
   - Responsive: on smaller screens, makes the table horizontally scrollable instead of reducing the width of the columns.
 - Replace the Select link with the entire row, let us use a `LinkContainer` to wrap the entire row and let it navigate to the same location as in the `Select` link using the `to` property.
 - Convert the Edit link to a button with an icon. Let us use the `Button` and `Glyphicon` components and use a Tooltip and OverlayTrigger as we did for Close and Delete buttons.
 - Wrap the button with the LinkContainer instead of the `onClick()`.
 - Separate the event handlers into explicit functions.

#### Forms

 - Common input types are instantiated using a `FormControl`
 - `componentClass` property can be used to change this default to any other element type, e.g. `select`. `value` and `onChange` are the same.
 - A label can be associated with the form control using the `ControlLabel` component. The only child of this component is the label text. They need to be put together under a `FormGroup`.
 - For the Effort input, we can use `InputGroup.Addon` component to display the inputs next to each other, as well as show the dash between the two. Use a `ButtonToolbar` component to show space between them.

#### The Grid System

A better way to deal with how the form gets laid out in the Issue Filter is to use `grid` system and let each field and label float, occupying the space next to its precedent, or below its precedent if the width of the screen doesn’t allow it. It makes sense to use it in this case because the IssueFilter is laid out horizontally, but on smaller screen should be vertically.

The grid system has a maximum of 12 columns. A cell (using `Col` component) can occupy one or more columns and a different number of columns at different screen widths. With forms, the best way to use the grid is to have a single row and specify how many columns each form control (one cell) occupies at different screen widths.

The width allocation for other screen sizes can be specified using `sm`, `md`, and `lg`, which stand for small, medium, and large screens. We can add a `<Row>` within which we can add `<Col>`s, which will hold each of the FormGroups or ButtonToolbar.

#### Inline Forms

Sometimes we want the form controls next to each other, including the labels. This is ideal for small forms with two or three inputs that can all fit in one line and are closely related. This style will suit the `Issue Add` form. Also replace the placeholders with labels to make them more obvious, which means we will have to use `FormGroups` and `ControlLabels` as we did for the Filter form.

An inline form needs no columns and rows. The `FormGroup` elements can be placed one after the other. Further, the button does not need a FormGroup around it, and there are no alignment implications if a `ControlLabel` is not given for a button.

#### Horizontal Forms

The label appears to the left of the input, but each field appears one below the other. The input fills the parent container until the right edge, giving it an aligned look. Implemented the Issue Edit page to use a horizontal form.

To implement we need a `Form` with the `horizontal` property. Enclose the entire form in a panel.

We can have the usual `FormGroups` for each of the editable fields. Within that we will have the control label and the actual control. Specify how much width the label and the input will occupy.

Set the componentClass of the <Col> to ControlLabel instead. To render a single element with the combined classes of a ControlLabel and a Col rather than a label within.

#### Validation Alerts

`Alert` component implemented in the Issue Edit page. It has different styles for the message like danger and warning. Also includes a Close icon.

The message should be shown conditionally based on a state variable in IssueEdit. Use this state variable to control the contents of validationMessage while initializing this variable.

To make the Close icon make the message disappear, we have to pass in a handler that modifies the visibility state. The `Alert` component takes in a callback named `onDismiss` to achieve this. This callback is called when the user clicks the Close icon.

#### Toasts

Implement `Toast` so the messages overlay the page as well as  transition in and out like the Toast messages in the Andriod OS. The visibility will be controlled by the parent, which passes an onDismiss property, which can be called to dismiss it. In addition to the Close icon’s click calling this onDismiss callback, there will also be a timer that calls onDismiss() when it expires.

In the render() method, we will first add an alert with the required attributes, all of which are passed in from the parent as props.

To show and hide the alert, we will use React-Bootstrap’s Collapse component. This component takes in a property called in which determines whether its child element fades in or out. When set to true, the child element shows (fade in) and when set to false, it hides (fades out).

Now, let us set up an automatic dismiss after five seconds. Since we expect the Toast to be constructed with showing set to false, we can expect a componentDidUpdate() call whenever the Toast is being shown. But the timer may fire even if the user has navigated away from the page, so it’s a good idea to dismiss the timer when the component is unmounted.

To use the Toast component, we’ll have to make changes to all the components that need to show a success or error message. Next, let’s change the components IssueDetail, IssueEdit, IssueList to use the Toast. Then let us three convenience functions: one to display a success message, one to display an error message, and one to dismiss the Toast.

#### Modals

Replace the in-page IssueAdd component with a `modal` dialog that is launched by clicking the Create Issue navigation item in the header. So, the user can create an issue from anywhere in the application.
When the new issue is submitted, we’ll show the newly created issue in the Issue Edit page, because this can be done regardless of where the dialog was launched from.
When a modal is rendered, it is rendered outside the main <div> of the DOM that holds the page. Thus, in terms of code placement, it can be placed anywhere in the component hierarchy. To launch or dismiss the modal, the `Create` Issue navigation item is the controlling component.
Create a component that display the navigation item, launches the dialog, and controls its visibility, creates the issue, and routes to the Issue Edit page on a successful creation.
o	Move the NavITem from Create Issue from the navigation bar to this new component and add an onclick() handler that shows the modal dialog by calling a method showModal().
 - Since the modal component can be placed anywhere, let’s add it right after the NavITem.
 - `Modal` component is the root of the modal dialog. Two important properties `showing` and `onHide()` which will be called when the user clicks on the cross icon to dismiss the dialog.
 - Modal.Header to show the title of the modal.
 - Use the modal footer to show a button toolbar with a Submit and a Cancel button styled as Primary and Link, respectively.
 - In the handleSubmit method, we need to combine the two functions of reading the form values from the IssueAdd.jsx and submitting the values by calling the Create API (from IssueList.jsx).
 - To handle errors in the graphQLFetch call, we’ll need to show a Toast message.

#### Issues and Errors

 - Listing 11-10 indicates to remove `withRouter` but it shouldn’t’ be removed. I followed the code from the author’s repo.

## Chapter 10

### Summary

In this chapter some user’s forms were implemented. The filter was modified and the Edit page as well to incorporate a form. Additional filters were added. Also, the functionality to close and delete  issues from the list was also included. Back-end APIs to update and delete issues were incorporated.

![Ch10_1 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter10_1.png)

![Ch10_2 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter10_2.png)

### Notes

#### Controlled Components

To be able to show a value in the input, it must be controlled by the parent via a state variable or props variable. This is done simply by setting the value of the input to that state or props variable. Thus, the input will directly reflect that value, and the React component that renders the form will also control what happens in that form on subsequent user input. An input form element whose value is controlled by React in this way is called a `controlled component`.

#### Controlled Components in Forms

The status filter is now a simple controlled component. A form for the filter was added to let the user make changes and then apply them all using `Apply` button. In order to let the user’s changes flow back into the form input component, the new value must set in the input. To get hold of the new value, the `onChange()` event has to be trapped, which will have the event as an argument, and as part of the event, we can get the new value that the user has selected. When the user changes the value, the state variable can be updated with the new value using `setState()` within the `onChange()` event handler so that is reflected as the value for the input.

To make the new filter reflect when the link is clicked, we need to hook into one of the lifecycle methods that tells us that a property has changed and show the filter again. `componentDidUpdate` method as we used before to look for changes to properties.
A `Reset` button was enabled to show the original filter when it is clicked. A state variable called `changed` was introduced.

#### More Filters

Added more filter to the list of issues. 
`effort` filter. Needed two fields for this, a minimum and a maximum value to filter on. We needed to change the API to implement this filter.

 - Changed the schema to add two more arguments to the issuelist API. Changed issue.js , the effort propery of the MongoDB filter has to be created only if either of the options are present, and then the $gte and $lte options have to be set, if not defined.

#### Typed Input

Changed the UI to add two inputs for the effort filter. A filter to the user’s keystrokes was added so that only numbers are accepted. Modified `IssueList` so the new filter values are used while loading data, the changes involder getting the two extra filter parameters from the URLs search parameters and using them in a modified GraphQL query to fetch the list of issues.

Next, is to add two state variables for the inputs for the new filter fields in the IssueFilter component. Also added in showOriginalFilter. Added input fields for these values in the `Filter` form. `onChange` handler implemented validations for digits on effortMin and effortMax fields.

#### Edit Form

Create a complete form for the Edit page in `IssueEdit.jsx`, displaying all the fields of an issue in input fields that can be changed by the user.
 - Define the state for this component. Minimum, store the current value of each input, which correspond to the fields of the issue being edite.
 - In the constructor define an empty object for the issue.
 - Method `loadData()`, replace the empty issue with the issue fetched from the server using the issue API to load the data asynchronously. The GraphQL query for this is straightforward, it takes in the ID as an argument (from the props) and specifies that all possible fields need to be returned.
 - Since all the input field’s contents are string, the state fields also need to be strings.
 - Code the `render()` method. Each of the fields’ values could be set to the corresponding value in the state. Take care of i) period where the component has been constructed and the loadData() has returned data, it is empty; ii) an issue with given ID does not exist.
 - Implement a `onChange` event handler for each of the inputs. Use the field `name` in the issue object as the name of the input. Supply a callback to the setState method that takes in the previous state and returns a new state.
 - It needs the lifecycle methods `componentDidMount()` and `componentDidUpdate()` to load the data.

#### Specialized Input Components

Make reusable UI components for the non-string inputs, which emit natural data types in their `onChange` handlers, so the form’s state stores the fields in their natural data types (number, date, etc.). Also, all the data type conversion routines are shared. The approach will be `disjoint` state, where the component is a controlled one if the user is not editing the component and its only function is to display the current value.

 - Number Input
   - Use this for the effort field in the Edit page in place of a plain `<input>` element. Call this `NumInput`.
   - Define the conversion functions that take in a string and convert to a number and vice versa.
   - In the constructor, let us set a state variable after converting the value passed in as props to a string.
   - In the `onChange()` of the input, we will check for the input containing valid digits and set the state if it is.
   - `onBlur()` property can be used to handle losing of focus. So, the parent can handle the original event (first argument) of onChange() if required.
   - In the `render()` method, we will just render an `<input>` element with the value set to the state’s variable and the `onChange()` and `onBlur()` handlers of the component class. These methods have to be bound to `this` in the constructor.
   - Copy all the other properties that the parent may want to supply as part of the props for the actual <input> element. Use the `spread operator` to do this seamlessly, {…this.props}.

To use the UI component in the Edit Page. First, replace the <input> with <NumInput> in the IssueEdit component. Then, change the `onChange()` handler to include the value in the natural data type that the component may send us as the second argument.

To change the state after constructing the component, we need to change the state to the new one. The best way to do this is to assign a `key` property to the component that changes when a new issue is loaded, to construct the component again with a new initial property.
React uses this property to indicate that a component object cannot be reused if the key is different; a new one must be constructed. We can use the issues’ ID.

 - Date Input
   - In the `onBlur()` handler, we’ll have to check for validity of the date typed by the user, then inform the parent on the change in validity (if any) of the new value, and the new value, if it is valid. To inform the parent let us use a new optional callback named `onValidityChange()`.
   - Save the focused state and the validity in new state variables `focused` and `valid`.
   - Two functions, one for display and another for editing.
   - Check for valid characters in the `onChange()` method, will be only digits and dash.
   - Focused state = user editing.
   - Text Input
   - Format() and unformat() will exist simply for converting to and from null values.
   - Any input will be allowed.

#### Update API

Implement an API that updates an issue, just like the MongoDB `update()` command, using the `$set` operator.
 - First, change the schema to reflect this new API: need a new input data type with all possible fields that can be changed, and all of them optional. Call it `IssueUpdateInputs`.
 - Create a new mutation entry point. Call it `updateIssue`. This will return the new modified issue.
 - Then, let us connect the API to its resolver in api_handler.js.
 - Implement the actual resolver in issue.js, in a function called `update()`. This function will validate the issue based on the new inputs. Fetch the full object from the database, merge the changes supplied to the API, and run the same validation that we used for adding an issue.

#### Updating an Issue

Write `handleSubmit()` method to make the call to the API to save the changes made by the user.
Use the same API to update a single field rather than the entire issue object in one go. Let us change the `IssueTable` component to add this button as part of the Actions column. On click of this button, we will need to initiate a close action, which can be a function passed in as a callback in the props. The callback needs to be passed from IssueList via IssueTable to IssueRow.

To identify which issue to close, we will have to receive the index of the issue in the table as another value in the props.
Implement the `closeIssue()` method in the IssueList component. Passing the closeIssue() method as a callback in the props to IssueTable and binding the closeIssue() method to `this`.

#### Delete API

Implement a Delete API.
-	Modify the schema to include the Delete API, which just takes the ID of the field to be deleted.
-	Connect the API to its resolver within issue.js in the API handler.
-	Created `deleted_issues` to store all deleted issues.
-	Retrieve the issue based on the given ID from the issues collection, add the deleted field, save it to `deleted_issues`, and then delete it from the `issues` collection.
-	We cannot name the function `delete` because is reserved keyword in JS.
-	Initialize this collection as part of the initialization script. init.mongo.js

#### Deleting an Issue

-	Add the button and pass the necessary callbacks through IssueTable to IssueRows
-	Callback named deleteIssue, implement in IssueList. Delete the index of the issue.
-	In the IssueList component. deleteIssue() methos takes the index of the issue to be deleted, calls the Delete API using this ID in the query variable, removes the issue from the issues state variable if the API succeeded. If not it reloads the data.


## Chapter 9

### Summary

This chapter helped to learn about routing, which handles multiple views (logical pages) within a single-page application. Routing links the state to the page to the URL in the browser. React router was used for this task. Also, another view for the application was added, one where the user can see and edit a single issue. Links to different views were created so the user can navigate. The components and routes were nested. A description field was added to the IssueList, when the user clicks on it the description gets displayed.

In order to affect routing, any page needs to be connected to something that the browser recognizes and indicates that “this is the page that the user is viewing”. There are two ways:

 - `Hash-based`. Uses the anchor portion of the URL (everything following the #). Every # portion can be interpreted a location within the page and there is only one page in a SPA.
 - `Browser history`. Uses a new HTML5 API that lets JavaScript handle the page transitions, at the same time preventing the browser from reloading the page when the URL changes. It is useful when we want to render a complete page from the server itself, especially to let search engine crawlers get the content of the pages and index them.


![Ch9 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter9.png)

### Notes

#### Simple Routing

In this section two views were created one for the issuelist and another for a report section. Also, it was ensured that the home page `/` redirect to the issue list. All of this using `React Router`.

`Npm install react-router-dom@4`

 - IssueReport.jsx is a placeholder for the report view.
 - Split the main page into sections: header section with a navigation bar with hyperlinks to different views and a contents section, which will switch between two views. The navigation bar will remain regardless of the view.
 - Contents.jsx is a component for the contents section. Responsible for switching between views.
 - `Route` is a component from React Router that takes in as a property the path that the route needs to match, and the component that needs to be shown when the path matches the URL in the browser.
 - `Redirect` is a component that redirects from / to /issues.
 - The routes need to be enclosed in a wrapper component, can be just a `<div>`. But to indicate that only one of these component needs to be shown, they should be enclosed in a `<Switch>` component, so that only the first match’s component will be rendered.
 - Page.jsx is the page that shows the navigation bar and the contents component. A stateless component that displays the NavBar and the Contents component one after the other. Navigation needs a series of links `/` is the only page of the SPA, `#` is the delimiter for the anchor and second `/` is the path of the route.
 - App.jsx will render Page.jsx instead of the original IssueList component into the DOM.

#### Route Parameters

Whatever follows the matched part in the URL is the dynamic part of the path and it can be accessed as:
 - A variable in the routed component.
 - Using the URLs query string.
 - IssueEdit.jsx is a page to that let us edit an issue. Later we’ll make an Ajax call and fetch the details of the issue and show them as a form for the user to make changes and save.
 - Specify parameter in the route path, using `:` followed by the name of the property that will receive the value. `/edit/:id`. Via `props` all routed components are provided an object called `match` that contains the result of the match operation. This contains a field called `params` that holds the route parameter variables.

#### Query Parameters

Implemented a simple filter based on the status field so that the user can list only issues that have a particular status.

 - Changes the list API to accept this filter. Changing GraphQL schema.
 - Accept the new argument in the API implementation in the file `issue.js`, in the function `list()`.
 - Replace the placeholder for the filter with three hyperlinks: All Issues, New Issues, and Assigned Issues.
 - The query string will need to be handled by the IssueList component as part of the `loadData()` function. React Router supplies as part of props, an object called `location` that includes the path and the query string. To parse we use `API URLSearchParams()`. We need to support this for older browsers using polyfill `url-search-params@1`.
 - After parsing we’ll have access to the `status` parameter using the `get()` method of URLSearchParams, like `params.get(‘status’)`. It will be supplied to GraphQL as a query variable.
 - Modify the call to `graphQLFetch()` to include the query variable that has the status filter parameter.
 - Implemented `componentDidUpdate()`, and reload the data if necessary, by comparing the old and new query string in IssueList. This method is passed the previous props. We can detect a change in the filter by comparing the `location.search` property of the previous and the current props and reloading the data on a change.

#### Links

In this section `Link` component from React Router was used instead of `href`.
 - Does not support relative paths
 - Query string and hash can be supplied as separate properties to the Link.
 - A variation, `NavLink` can figure out if the current URL matches the link and adds a class to the link to show it is active. It has a `exact` property, enforces an exact match instead of a prefix match. It uses `active` class when the link matches the URL.
 - It works the same between different kinds of routers, using the # or using the path as it is.

#### Programmatic Navigation

Query strings are typically used when the variables’ values are dynamic and could have many combinations that cannot be predetermined. They are also typically a result of an HTML form. A form requires that the query string be constructed dynamically.
A drop-down was added and set the query string based on the value of the dropdown. Keep the dataflow unidirectional: when the dropdown menu value changes, it changes the URL’s query string, which in turn applies the filter. Also works if started in the middle: change the URL’s query string directly, and it will apply the filter.

Created method `onChangeStatus` to handle the event when the value is changes, via the `value` property. There is also `history` property which using this, the location and query string of the browser’s URL can be set.

#### Nested Routes

`Nested Routes`, wherein the beginning part of the path depicts one section of a page, and based on interaction within that page, the latter part of the path depicts variation, or further definition of what’s shown additionally in the page.
A `description` field was added to issue, when selection an issue, the lower half of the page shows the description of the issue. A `Route` component can be added which will be rendered if the URL matches the route path.
 - Modified schema to add `description` field. Both type Issue and IssueInputs.
 - Created a new API `issue` , that can retrieve a single issue given its ID. It will be used by IssueDetail to fetch the description. Which the IssueTable will not fetch. The API takes an integer as an argument to specify the ID of the issue to fetch. Used the id argument to create a MongoDB filter and call findOne() on the issues collection with this filter. Finally tie up the new function in the resolvers we supply to the Apollo Server.
 - Modified the scehma initializer script to add a description field to the initial set of issues. Change init.mongo.js.
 - Implement the IssueDetail component.
    - Maintain the state, which will contain an issue object.
    - The ID of the issue object will be retrieved from match.params.id like in the IssueEdit component.
    - The issue object will be fetched using the issue GraphQL query using the fetch() API, in a method called loadData(), and set as the state.
    - The method loadData() will be called after the component mounted(for the first time), or when the ID changes (in componentDidUpdate()).
    - In the render() method, we’ll just display the description using the `<pre>` tag so that newlines are maintained in the display.
 - To integrate the IssueDetail into IssueList component, we’ll need to add a route, using a path as matched in the parent component, using `this.props.match.path`.
 - To select an issue, created another link beside the Edit link in the table of issues.

#### Browser History Router

The downside of using hash-based routing is when the server needs to respond to different URL paths. The need of responding differently to different routes from the server itself arises when we need to support responses to search engine crawlers. To make the application search engine friendly, using browser history-based routing is necessary. Also, the server must respond with the entire page.

 - Changed the import statement and using `BrowserRouter` instead of `HashRouter`. This component achieves routing by using the HTML5 history API (pushState, replaceState, and popState) to keep the UI in sync with the URL.
 - Changed the UI server. Installing an Express route after all the other routes for the path * which reads the contents of index.html and returns it.
 - The response object has a method `sendFile()`, which does not accept relative paths.
 - Webpack configuration option `publicPath` under output. It is important option whe using on-demand-loading or loading external resources like images, files, etc. The value of publicPath is used to fetch update information for modules when they change and are recompiled by HMR.


## Chapter 8

### Summary

This chapter helped to further improve the architecture of the application by splitting code into multiple files and adding tools such as Webpack to split front end code into component-based files, inject code into the browser incrementally, and refresh the browser automatically on front-end code changes. Also, the dependency on the CDN for runtime libraries was removed helped by webpack.

Screenshots from Chrome and Firefox.

![Ch8 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter8.png)
![Ch8_2 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter8_2.png)

### Notes

#### Back-End Modules

There are various standards for modularization in JS, of which Node.js has implemented a slight variation of the `CommonJS` standard. In this system, there are essentially two key elements to interact with the module system: `require` and `exports`.
 - `require()` is a function that can be used to import symbols from another module. The parameter passed is the ID of the module. In `Node` the ID is name of the module. For packages installed using `npm`, this is the name of the package and the same as the sub-directory inside `node_modules` directory where the package’s files are installed. To import symbols from a file called other.js in the same directory as api/server.js, the ID to be passed to require() is “./other.js”.
 - `exports()` , the main symbol that a file or module exports must be set in a global variable called `module.exports` within that file, and that is the one that will be returned by the function call to `require()`.

Functions separated in the api directory:
 - GraphQLDate() from the api/server.js
 - SetMessage() from the api/server.js into about.js
 - Apollo Server, schema and the resolvers into api_handler.js
 - Database connection creation and a function to get the connection handler.
 - Issue object into issue.js

#### Front-End Modules and Webpack

`Webpack` provides alternative to define dependencies using statements equivalent to `require()` that are used in Node. Then automatically determines nor just the application’s own dependent modules, but also third-party library dependencies. They put together these individual files into one or just a few bundles of pure JS that has all the required code that can be included in the HTML file. Webpack is only needed during the building process but not in production.

Using `import` keyword to import files, followed by the element or variable being imported, then `from` and the identifier of the file or module. To export a function is as simple as prefixing the keyword `export` before the definition of whatever is being exported.

#### Transform and Bundle
Webpack needs some helpers called `loaders` to transform and bundle files. All transforms and file types other than pure JS require loaders in Webpack. These are separate packages. To be able to run Babel transforms, we’ll need the Babel loader.
Webpack looks for a file called `webpack.confir.js` that can include `module.exports` to treat this file as a regular JS. It needs properties:
 - mode: development
 - entry: specifies the file that is the starting point from which all dependencies can be determined. App.jsx under src directory.
 - output: needs to be an object with the filename and absolute path as two properties.
 - Run `npx webpack` to create the app.bundle.js file.
 - Run `npx webpack - -watch` to keep track of changes in the graphQLFetch.js and App.jsx files. This was changed in the `compile` and `watch` scripts for ui/package.json.

After applying webpack changes, the App.jsx was split into different files. Each React component should be placed in its own file, especially if the component is a stateful one. Stateless components can be combined with other components when they belong together.
 - IssueList.
 - IssueFilter
 - IssueTable
 - IssueAdd

App.jsx will import IssueList.jsx which in turn will import the other three components. IssueList.jsx will also need to import graphQLFetch.js since it makes the Ajax calls.

#### Libraries Bundle

In this section Webpack is used to create a bundle that includes all the libraries needed for the UI side.
 - npm install react@16 react-dom@16
 - npm install prop-types@15
 - npm install whatwg-fetch@3
 - npm install babel-polyfill@6

To use these installed libraries, it was necessary to import them in all client-side files where they are needed. All the files with React components will need to import React. App.jsx will need to import ReactDOM in addition. The polyfills-babel polyfill- and whatwg-fetch can be imported anywhere since these will be installed in the global namespace.

Having two bundles, one for application code and another for all the libraries, help to solve the problem that when the entire bundle is rebuilt even when the application code undergoes a small change. We can do this by using `splitChunks`, specifying a variable in the filename. Using a named entry point and the name of the bundle as a variable in the filename in the Webpack configuration for the UI. Also all the libraries under node_modules will be excluded from transformation.

#### Hot Module Replacement

Webpack has a feature called `Hot Module Replacement (HMR)` that changes modules in the browser while the application is running, removing the need for a refresh altogether. Also if there is any application state, that will also be retained, because there is no page refresh.
There are two ways to implement HMR using Webpack.
  - New server called `webpack-dev-server`. It reads the contents of webpack.config.js and starts a server that serves the compiled files. This is preferred for applications without a dedicated UI server.
 - Modify the UI server to compile, watch for changes and implement HMR. There are two middleware packages that can be installed within the Express application, called `webpack-dev-middleware` and `webpack-hot-middleware`. These modules need special configuration, they need additional entry points and a plugin needs to be installed that generates incremental updates rather than entire bundles.

#### Debugging

Webpack provides source maps, that contain your original source code as typed in. Also connect the line number in the transformed code to your original code. Browser’s development tools understand source maps and correlate the two, so that breakpoints in the original source code are converted breakpoints in the transformed code. In order to achieve this we need to add a configuration parameter `devtools` in the webpack.config.js.


## Chapter 7

### Summary

This chapter helped to work in the architecture of the application and allow for more traffic. It added a package `dotenv` to help run the same code on different environments using different configurations for each environment, such as development and production. It helped to learn about CORS implications and using a proxy. Also, `ESLint` was used to write code according to good practices.

![Ch7_1 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter7_1.png)

![Ch7_2 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter7_2.png)

### Notes

#### UI Server

Right now, all requests land on the same physical server, and within that is the one and only Express application. Then the requests are routed into two different middleware depending on the request.
 - Any request-matching files in the `public` directory are matched by the middleware called `static`. This middleware uses the disk to read files and serve the file’s contents.
 -	Other requests that match the `/graphql` path are dealt with by the `Apollo` Server’s middleware. This middleware, using resolvers, gets the data from the `MongoDB` database.

A better option is to separate the two function into two servers: one that serves static content, and other that hosts just the API. All the API code and the UI code are kept separate. This will help to implement `server rendering`, wherein complete pages will be generated from the server as opposed to being constructed on the browser.

Both servers can be physically different computers, but for development purposes can be run on different ports. These will be run using two different `Node.js` processes, each with its own instance of `Express`.

 - The API server will be responsible for handling the API requests, and therefore, it will respond only to URLs matching `/graphql` in the path. 
 - The UI server part will now contain only the static middleware. This will be responsible for generating HTML pages by calling the API server’s APIs to fetch the necessary data.
First change is to create a new directory structure that cleanly separates the UI and the API code.
 - Rename the `server` directory as `api`.
 - Move the `scripts` directory under the new directory `api` as well.
 - For the `UI` code, let us create a new directory `ui` under the project root and move the UI-related directories `public` and `src` under this.
 - A `package.json` file was added to each directory.
 - Added an Express server in the UI directory.

#### Multiple Environments

`dotenv` package allows to convert variables stored in a file into environment variables. Thus, in the code, we only deal with environment variables, but the environment variables can be supplied via real environment variables or configuration files.

The dotenv package looks for a file called `.env`, which can contain variables defined like in a shell. It is recommended that this file not to be checked into any repository. Each development and deployment environments must specifically set the variables in the environment or in this file as per their needs. It is also a good idea to change the `nodemon` command line so it watches for changes to this file.
It was also required to make changes to api/scripts/trymongo.js, to use the environment variable DB_URL.

For the `UI` directory `dotenv` was also installed and required in the server file. In order to get the API to the browser as JS code, the configuration was made a runtime variable, creating a JS file and injecting it on index.html. The JS file contains a global variable with the contents of the environment.

#### Proxy-Based Architecture

Due to Same-origin policy, requests to an API different from the origin of the application are normally blocked by browsers unless the server specifically allows it. The Apollo GraphQL server, by default, allows unauthenticated requests across origins. We can disable this behavior using an environment variable.

In this section the UI was changes to make even API requests to the UI server, where a proxy was installed so that any request to /graphql is routed to the API server. The `http-proxy-middleware` package was installed.

#### ESLint
`ESLint` is a very flexible linter that lets you define the rules you want to follow. `Airbnb` standards for API. There are two parts to the Airbnb ESLint configuration: the base configuration that applies to plain JS and the regular configuration that includes rules for JSX and React as well. For `API`  (back-end) we need the base configuration only.
 - npm install  - -save-dev eslint@5 eslint-plugin-import@2
 - npm install - -save-dev eslint-config-airbnb-base@13

ESLint looks for a set of rules in the `.eslintrc` file which is a JSON specification. This applies to all the files in the directory. To run ESlint on the entire api directory use `npx eslint`.

For `UI` besides Airbnb-base package, the completed configuration was installed, including the React plugin. To run the eslint `npx eslint . - -ignore-pattern public`. You can create a `.eslintignore` file to ignore patterns of files. A `eslintrc` file was added under the `src` directory and used `npx eslint . –ext js,jsx - -ignore-pattern public`.

 - npm install --save-dev eslint@5 eslint-plugin-import@2
 - npm install --save-dev eslint-plugin-jsx-a11y@6 eslint-plugin-react@7
 - npm install --save-dev eslint-config-airbnb@17

#### React PropTypes

The properties being passed from one component to another can also be validated against a specification. This specification is supplied in the form of a static object called `propTypes` in the class, with the name of the property as the key and the validator as the value. The module called `prop-types` can be included in index.html from the CDN.

 - <script src="https://unpkg.com/prop-types@15/prop-types.js"></script>

#### Issues and Errors

 - In api/package.json I had to update graphql version to "^14.2.1", because I was getting an error: TypeError: Cannot read property 'filter' of undefined at Object.<anonymous> (C:\Users\Pedro\Desktop\Northeastern\CS5610 WebDev\PedroCantu-Book\pro-mern-stack-2\api\node_modules\apollo-graphql\lib\schema\buildSchemaFromSDL.js:23:53)


## Chapter 6

### Summary

This chapter helped to learn about MongoDB, which will serve as the database for the Issue Tracker application. The array of issues stored in the server was replaced with a real data base that allows read and write operations. To use MongoDB, the mongo shell and a driver for Node.js  was installed to have access to the database and have access to the CRUD operations. A modification on the server-side code was required to replace the API that allowed access to the array of issues.

![Ch6 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter6.png)

### Notes

#### MongoDB Basics

MongoDB is a `document` database, which means that the equivalent of a record is a document or an object. In comparison to a relational database where data is organized in terms of rows and columns, on a document database, an entire object can be written as a document.

- Documents

  The advantage of `documents` is more appreciated when the application is dealing with `embedded` objects and arrays. The entire object can be stored as one document and it does not have to be separated out into other documents to keep the nested elements.
  
  `document` is a data structure composed of field and value pairs. The values of fields may include objects, arrays, arrays of objects and so on. MongoDB objects are similar to JSON objects or JavaScript objects. It supports not only primitive data types-Boolean, numbers, and string-but also other such as dates, timestamps, `regex` and binary.

- Collections

  It is a set of documents. It can have a primary key and indexes.
  - `primary key` is mandated in MongoDB, and it has the reserved field name `_id`. If not supplied, it is automatically generated. It is convenient and guaranteed to be unique even when
  multiple clients are writing to the database simultaneously. The `_id` field is automatically indexed.
  - `indexes` can be created on other fields, including fields within embedded documents and array fields. These are used to efficiently access a subset of documents in a collection.
  - A defined `schema` is not required in MongoDB. The only requirement is that all documents in a collection must have a unique `_id`. Each document can have different fields. A schema checking is suggested in the application code.
  
- Databases
  A `database` is a logical grouping of many collections. `$lookup`, which is a stage in an aggregation pipeline, is equivalent to a `joint` in SQL databases. This stage can combine documents within the same database. To access multiple databases, multiple connections are required. It is useful to keep all the collections of an application in one database, though a database server can host multiple databases.

- Query Language 
  MongoDB query language is made up of `methods` to achieve various operations. `CRUD` methods are the main ones to read and write. All methods take parameters as JavaScripts objects that specify the details of the operation. To insert the only parameter is an object. For querying, the parameters are a query and a list of fields to return (called a projection).

  `query filter` is a JS object consisting of zero or more properties, where the property name is the name of the field to match on and the property values consists of another object with an operator and a value. In MongoDB, an object can hold a list of objects, that is because compared to a relational database, a join of collections is not natural to most methods in MongoDB. The most convenient `find()` method can operate only on one collection at a time.
  
- Installation

  Before installation, try one of the hosted services that give access to MongoDB. Free versions for a small test or sandbox application.
  - MongoDB Atlas. It gives 512 MB Storage. Recommended.
  - mLab (previously  MongoLab).
  - Compose. MongoDB as a service. 30-day trial period available.

  For installation, look up the instructions, google `mongodb installation`. Version 3.6 or higher. Make sure to install the server, the shell and tools. Test installation by running `mongo` in the shell.

- The Mongo Shell
  - Documentation at https://docs.mongodb.com/manual/mongo/
  - https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/#create-database-directory

  After specifying aliases for `mongod` to connect to the server and `mongo` to connect to the shell. The following commands were ran:
  - `show databases` to find the available databases.
  - `db` to identify the current database. Default = `test`.
  - `show collections` to show collections in the database.
  - `use issuetracker` to switch to a database called issuetracker`

  To create a new collection . It is done by creating a new document in a collection. A collection is referenced as a property of the global object `db`, with the same name as the collection. The collection called employees can be referred to as `db.employees`. To insert a new document, `insertOne()` method is used, with a document as parameter.`db.employees.insertOne({name: {first: ‘John’, last:’Doe’}, age: 44})

  To see the list of available methods, `press` `Tab` twice after typing `db.employees.` (period required at the end). This is the autocompletion of mongo shell.
  To check if the document had been created in the collection. Use `find()` on the collection. Use `pretty()` to get better output format. `db.employees.find().pretty()`.
  `cursor` is the result of find() method. The cursor can be iterated, and it has other methods, such as `toArray()`. Places all the documents from the query and places them in an array. Which can be stored in a variable. `let result = db.employees.find().toArray()`. Then, used `forEach()` to iterate through each of them and printed the first name of each employee, `result.forEach((e) => print(‘First Name:’, e.name.first)).

  `tojson()` method is used to conver objects to strings before printing. Also, there is method `printjson()`. `result.forEach((e) => printjson(e.name)).

#### MongoDB CRUD Operations

`db.employees.drop()` method for the collection to erase itself. It also removes any indexes that are part of the collection.
 - Create
    `_id` field to use a specified ID instead of MongoDB auto-generated one. MongoDB keeps key unique and is of type ObjectID.
    `insert_many()` method to take multiple documents in one go. Takes an array of objects.

 - Read
   - `find()` method takes two more parameters, `filter` to apply to the list, the second is `projection` which specifies which fields to retrieve.
   - `filter` is an object where the property name is the field to filter on, and the value is its value that it needs to match. `{id: 1}` => `{id: {$eq: 1}}`, the value of the field id must be equal to 1. 
   - The general format is `fieldname: {operator:value}`. If multiple fields are specified, then all of them must match, which is the same as combining them with an `and` operator. `db.employees.find({age: {$gte: 30}, ‘name.last’: ‘Doe’})`.
   - To combine multiple values of the same field. Use the `$and` operator.
   - `createIndex()` method on the collection is meant for create an index on a field that is a common occurrence for filtering. It takes an argument specifying the fields that form the index, multiple fields will form a composite index. `db.employees.createIndex({ age:1 })`. The second argument is an object that contains various attributes of the index, one of them specifying whether it is unique. `db.employees.createIndex({ id: 1 }, {unique: true})`.

 - Projection

   To restrict the fetch to only some fields of the object, the `find()` method takes a second parameter called the `projection`. A projection specifies which fields to include or exclude in the result. It is an object with one or more field names as the key and the value as 0 or 1, to indicate exclusion or inclusion. 0s and 1s cannot be combined, either start with nothing and include fields using 1s, or start with everything and exclude fields using 0s. The `_field` id is always included, unless specified not to.

 - Update
 
   `updateOne()` and `updateMany()` for modifying a document.
   - First argument is a query filter.
   - Second argument is an update specification if only some fields need to be changed.
   - `db.employees.updateOne({id: 2}, {$set:{age:23}})`. Returns `matchedCount` for how many documents matched the filter. `modifiedCount` should always be 1 for updateOne() unless the
   modification had no effect.
   - `db.employees.updateMany({}, {$set: {organization: ‘MyCompany’}})`. Modifies all the employees.
   - `replaceOne()` to replace a complete document. ObjectId cannot be replaced by an updateOne() or replaceOne().

 - Delete

    Takes a filter and removes the document from the collection. There is `deleteOne()` and `deleteMany()`. Executing `count()` on the collection tell us how many documents it contains.

 - Aggregate

    The `aggregate()` method performs the function of the `GROUP BY` clause in SQL. It can also join or unwind. It operates in a pipeline, each `stage` in the pipeline takes the input from the result of the previous stage and operates as per its specification to result in a new modified set of documents. The `$group` stage needs to be used.

    `db.employees.aggregate([ {$group: {_id: null, total_age: {$sum: ‘$age’}}} ])` to get the sum of age.

    `db.employees.aggregate([ {$group: {_id: null, count: {$sum: 1}}} ])` to get a count of the records.

    To group the aggregate by a field, the name of the field prefixed by a `$`, should be specified as the value of `_id`. 
    `db.employees.aggregate([ {$group: {_id: ‘$organization’, total_age: {$sum: ‘$age’}}} ])`


#### MongoDB Node.js Driver

This is the Node.js driver to connect and interact with the MongoDB server. To install the driver: `npm install mongodb@3`.
1. Connect to the database server. 
   - First importing the object `MongoClient` from the driver.
   - Then creating a new client object from it using a URL that identifies a database to connect to. 
   - Finally calling the `connect()` method on it.
2. The URL should start with `mongogb://` followed by the hostname or the IP address of the server to connect to. If using cloud providers, the URL can be obtained from the instructions. For local installation, the URL is `mongodb://localhost/issuetracker`.

3. The client constructor takes another argument, with more settings for the client, one of which is whether to use the new style parser.

The `connect()` method is an asynchronous method and needs a callback to receive the result of the connection. The callback takes in two arguments: error and result. The result is the client object itself. Within the callback, a connection to the database can be obtained by calling the `db` method of the client object. `client.connect(function(err, client) { const.db = client.db()…`.

The connection to the database, `db`, is similar to the `db` variable we used in the mongo shell. It is the one we can use to get a handle to a collection and its methods. `const collection = db.collection(‘employees’);` All methods used in this collection are `asynchronous`, so they take arguments but also take a callback function that’s called when the operation completes`.

When we are done inserting and reading back the document, we can close the connection to the server using `client.close()`. 

Each `callback` on an error , need to do the following:
 - Close the connection to the server
 - Call the callback
 - Return from the call, so that no more operations are performed.

Mongo shell has a command line way of executing a simple command using `--eval` command line option. Using this with the database name to connect to. To clean the collection run `mongo issuetracker –eval “db.employees.remove({})`.

`testWithAsync()` in trymongo.js, uses `async/await` paradigm. All asynchronous calls with a callback can now be replaced by a call to the same method, but without supplying a callback. Using `await` before the method call will simulate a synchronous call by waiting for the call to complete and return the results.

#### Schema Initialization

Mongo shell is not only a shell but also a scripting environment. `Scripts` can be written to perform various tasks such as schema initialization and migration.
`init.mongo.js` is an initialization script. The only useful thing is the creation of indexes, which are one-time tasks. Also initializes the database with some sample documents to ease testing, using `insertMany()` and the array already existing in `server.js`.

Run using the mongo shell. For remote databases, ensure that the connection string is supplied in the command line. For example:
 - Localhost: mongo issuetracker scripts/init.mongo.js
 - Atlas: mongo mongodb+srv://user:pwd@xxx.mongodb.net/issuetrackerscripts/init.mongo.js
 - MLab: mongo mongodb+srv://user:pwd@xxx.molab.com:33533/issuetrackerscripts/init.mongo.js

#### Read from MongoDB

In this section, the in-memory array of issues was replaced for the MongoDB database in the `server.js` file. 
 - The application will maintain the connection to the database to use it for many operations, so it will be stored in a global variable.
 - Write a function to connect to the database.
 - Change the setup of the server to first connect to the database and then start the Express application. 
 - Use await to wait for the `connectToDb()` function then call `app.listen()`.
 - After that, we can use variable `db` in the List API resolver `issueList()` to retrieve a list of issues by calling the `find()` method on the issues collection.

In the `schema.graphql` Added the `_id` as a Field in Issue.

#### Writing to MongoDB

Change the `Create API` to use the MongoDB database. To generate unique ID’s use the method `findOneAndUpdate()`. We can update a counter and return the updated value, but instead of using `$set` operator, we can use the `$inc` operator, which increments the current value.
 - First, create a collection with the counter that holds a value for the latest Issue ID generated. With value field `current` holding the current value of the counter.
 - Modify the schema initialization script to include a collection called counters and populate what with one document for the counter for issues. `init.mongo.js`
 - Create a  method that calls `findOneAndUpdate()`  with `returnOriginal` set to false, in `server.js`. The arguments to the method are a) the filter or match, used `_id`, then b) the
 update operation, used `$inc` with value 1. Finally c) the options for the operation.
 - Use it in resolver `issueAdd`.
 - Finally removed the array of issues.

#### Issue and Errors

- Needed to create an alias in .bash_profile for “mongod” = "C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath="c:\data\db"
- Neede to create an alias in .bash_profile for “mongo”= "C:\Program Files\MongoDB\Server\4.2\bin\mongo.exe"
- Changed configuration in VS Code to accept the alias in bash terminal.
- When trying to run `trymongo.js`. I got this “(node:5344) DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, and will be removed in a future version. To use the new Server Discover and Monitoring engine, pass option { useUnifiedTopology: true } to the MongoClient constructor.” Which was solved by adding  in `const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true}); `.


## Chapter 5

### Summary

This chapter helped to learn how to integrate the back-end server for the data. Before this chapter, the only resource the Express and Node.js server was serving was static content in the html file. APIs from Express and Node.js server replaced the hard-coded array of issues. The database was simulated in the server’s memory instead of persisting the data on disk.

Also, the basics of GraphQL were covered while implementing APIs to create an issue, and to display error messages to the user. Furthermore, some input validation was implemented by the end of the chapter.

![Ch5 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter5.png)

### Notes

#### Express

Express is a web application framework. It relies on other modules called `middleware` to provide the functionality most application need.

- Routing

  At the heart of express is a router, which takes a client request, matches it against any routes that are present, and executed the handler function that is associated with that route.

  `route specification` consist of an HTTP method, a path specification that matches the request URI, and the route handler. The handler is passed in a request object and a response object. The `request` object can be inspected to get the various details of the request, and the `response` object’s methods can be used to send the response to the client.

  `middleware function` deals with any request matching the path specification, regardless of the HTTP method. In contrast, a route can match a request with a specific HTTP method. Instead of `app.use()`, `app.get()` must be used in order to match the GET HTTP method. The second argument that the routing function takes, can set response to be sent back to the caller.

- Request Object. Useful properties and methods.
  - The `req.params` is an object containing properties mapped to the named route parameter as you saw in the example that used: customerId. The property’s key will be the name of the rout parameter and the value will be the actual string sent as part of the HTTP request.
  - `req.query` holds a parsed query string. It’s an object with keys as the query string parameters and the values as the query string values. Multiple keys with the same name are converted to arrays.
  - `req.header`, `req.get(header)`. The get method gives access to any header in the request.
  - `req.path`. This contains the path part of the URL, everything up to any `?` that starts the query string.
  - `req.url`, `req.originalURL`. These properties contain the complete URL, including the query string.
  - `req.body`. This contains the body of the reques, valid for `POST`, `PUT`, `PATCH` requests. The body is not available (undefined) unless a middleware is installed to read and optionally interpret or parse the body.

- Response Object. Used to construct and send a response.
  - `res.send(body)`. Responds to the request. Can also accept a buffer.
  - `res.status(code)`. This sets the response status code. If not set, it is defaulted to 200 OK. A common way of sending an error is res.status(403).send(“Access Denied”).
  - `res.json(object)`. This is the same as res.send(), except that this method forces conversion of the parameter passed into a JSON, whereas `res.send()` may treat some parameters like `null` differently.
  - `res.sendFile(path)`. This responds with the contents of the file at path.

- Middleware

  An express application is essentially a series of middleware function calls. Middleware functions are those that have access to the request object(req), the response object(res), and the next middleware function in the application’s request-response cycle, denoted by a variable named `next`.

#### REST API

Representational State Transfer, is an architectural pattern for application programming  interfaces (APIs). APIs are resourced based, there are only resources names called `endpoints`. Resources are accessed based on a Uniform Resource Identifier (URI), also know as endpoint. They can also form a hierarchy. To access and manipulate resources you use HTTP methods. 
REST by itself lays down no rules for the following:

 -	Filtering, sorting and paginating a list of objects.
 -	Specifying which fields to return in a READ operation.
 -	If there are embedded objects, specifying which of those to expand in a READ operation.
 -	Specifying which fields to modify in a PATCH operation.
 -	Representation of objects. Free to use JSON, XML or any other.

#### GraphQL

Is a far more elaborate specification than REST, with the following remarkable features:
 -	`Field Specification`. The properties of an object that need to be returned must be specified. It is invalid to request nothing.
 -	`Graph Bases`. Relationships between objects are naturally handled in GraphQL APIs. When querying for a user’s properties, it makes it natural to query for some properties associated with all the issues assigned to them as well.
 -	`Single Endpoint`. GraphQL API servers have a single endpoint in contrast to one endpoint per resource in REST. This makes possible to use a single query for all data that is required by a client.
 -	`Strongly Typed`. All fields and arguments have a type against which both queries and results can be validated and give descriptive error messages. A GraphQL server can be queried for the types it supports.
 -	`Libraries`. For Javascript on the back-end there is a reference implementation of GraphQL called GraphQL.js, with a package called `express-graphql` to tie this to Express and enable HTTP requests. To add advanced support for modularized schemas and seamless handling of custom scalar types there is the package `graphql-tools` and `apollo-server`.

#### The About API

This section served to learn the basics of simple reads and writes using GraphQL.
`npm install graphql@0 apollo-server-express@2`
GraphQL schema has two special types that are entry points into the type system. `Query` and `Mutation`. All other APIs or fields are defined hierarchically under these two types. Query fields are expected to return existing state, whereas mutation fields are expected to change something in the application’s data. Implement READ operations under Query and things that modify the system under Mutation. GraphQL type system supports:
 -	`Int`. A signed 32-bit integer
 -	`Float`. A signed double precision floating-point value.
 -	`String`. A UTF-8 character sequence.
 -	`Boolean`.
 -	`ID`. Represents a unique identifier serialized as a String. This is not intended to be human readable.

By default, all values are optional (can be null), and those that require a value are defined by adding an exclamation character `(!)` after the type. All fields must have a type, there is no void or other that indicates that the field returns nothing. 

`resolvers` are functions that can be called when a field is accessed. They resolve a query to a field with real values. All `resolver` functions are supplied four arguments: 
 -	`obj`. The object that contains the result returned from the resolver on the parent field.
 -	`args`. An object with the argument passed into the field in the query.
 -	`context`. This is an object shared by all resolvers in a query and is used to contain per-request state, including authentication information, data loader instances, and anything else that should be considered when resolving the query.
 -	`info`. This argument should only be used in advanced cases, but it contains information about the execution state of the query.

After defining the `schema` and the `resolvers`, let’s initialize the GraphQL server by constructing an `ApolloServer` object defined in the `apollo-server-express` package. The constructor takes in an object with at least two properties, `typeDefs` and `resolvers`, and returns a GraphQL server object.

Finally we need to install the `ApolloServer` as a middleware in `Express`. Using the method `applyMiddleware` to deal with the path (single endpoint), which takes two properties, `app` and `path`. The tool called `Playground` is available by default and can be accessed by browsing the API endpoint. `http://localhost:3000/graphql`.

To make a `query` on the `Playground`, in case of input fields, we specify the name and value, separated by a `:`. `query{about}. The output is a regular JSON object. Also, to test the `setAboutMessage` field instead of a query, a mutation can be run `mutation{setAboutMessage(message: “Hello World!”)}`.

#### GraphQL Schema File

The schema was specified within the server.js file. To keep the schema separated, so when it grows the .js file will be kept small. A new file `schema.graphql` was created with the string definition for `typeDefs`. Also a new file extension was added to the `nodemon` tool in the `scripts` of `package.json`, that restarts the server to detect changes in the 	`.graphql` file as well.

#### The List API

Implement an API to fetch a list of issues. Was tested using the Playground.
-	Modified the schema to define a custom type called `Issue`.
-	Added a new field under `Query` to return a list of issues. The list is mandatory, and the issue can not be null, so `[Issue!]!`.
-	Separated the top-level Query and Mutation definitions in `schema.graphql` from the custom types using a comment with `#`.
-	In the server.js file, it was added a resolver under Query for the new field, which points to a function. Also, an array of issues was added as a stand-in for a database and a function `issuList` was created to return this array.

#### List API Integration

In this section the `loadData()` function was replaced in the `IssueList` component with something that fetches the data from the server. To use the APIs, asynchronous  calls are needed, `Ajax` calls. Instead of using `JQuery` `ajax()` function for this purpose, modern browsers support this call natively. 
-	A `polyfill` for the Fetch API is available from `whatwg-fetch` for older browsers. This was added in index.html.
-	Within the `loadData()` method, it was necessary to construct a GraphQL query. This is a simple string including all the subfields of an issue. This query string is sent as the value for the `query` property within a `JSON` as part of the body to the `fetch` request.
-	Once a response is received, the `JSON` data is converted to a JavaScript object by using `response.json()` method. Finally, a call to `setState()` is needed to supply the list of issues to the state variable called `issues`.
-	Added the keyword `async` for the function definition of `loadData()` since `awaits` was used before.
-	The global variable `initialIssues` was removed as no longer needed.

#### Custom Scalar Types
Dates should ideally be displayed in the user’s time zone and locale, regardless of where the server is. To achieve that, dates should be stored as JavaScript’s native `Date` objects. It should ideally be converted to a locale-specific string at the time of displaying it to the user only. The recommended string format for transferring `Date` objects in a JSON is the `ISO 8601` format, it is the same used by JavaScript Date’s `toJSON()` or `toISOString()` method. GraphQL does not support dates natively it allows custom scalar types. Tu use a custom scalar type:
-	Define a type for the scalar using the `scalar` keyword instead of the type keyword in the schema.
-	Add a top-level resolver for all scalar types, which handles both serialization (on the way out) as well as parsing (on the way in) via class methods.
-	After these, the new type can be used just as any native scalar type like `String` and `Int` would be used. The new scalar type `GraphQLDate` had to be defined in the schema using the `scalar` keyword followed by the name of the custom type.
-	In the `server.js` , the `graphql` package needs to be imported. The constructor of `GraphQLScalarType` takes an object with properties `name` and `description`. 
-	Method `serialize()` will be called to convert a date value to a string. Inside is calling `toISOString()` on the value and return it. Other methods `parseValue()` and `parseLiteral()` are needed to parse strings back to dates.
-	This resolver needs to be set at the same level as `Query` and `Mutation` as the value for the scalar type.
-	In `App.jsx` the string is converted to the native `Date` type. Using a `reviver` function passed to the `JSON` `parse()` function to parse all values, and the `JSON` parser gives it a chance to modify what the default parser would do.
-	`response.json()` does not allow to specify the reviver, so we have to get the text of the body using `response.text()` and parse it using `JSON.parse()` by passing in the reviver.

#### The Create API

Implemented an API for creating a new issue in the server, which is appended to the list of issues in the server’s memory.
-	Define a field in the schema under `Mutation` called `issueAdd`. This field should take arguments. One for each property of the issue being added.
-	Instead of using the `type` keyword, the `input` keyword is used to define `IssueInputs` object.
-	A resolver function was created for `issueAdd` that takes in an `IssueInput` type and creates a new issue in the in-memory database.
-	In the function, set the ID and created date.
-	Default status to `New`.
-	Append the issue to the global variable `issuesDB` and return the issue object as is.
-	Implement `parseValue` and `parseLiteral` methods for the custom scalar type `GraphQLDate`.
-	`parseLiteral` is called in the normal case, where the field is specified in-place in the query. The parser calls this method with an argument `ast`, which contains a `kind` property as well as a `value` property. The `kind` property indicates the type of the token that the parser found, can be float, integet or string. For the date it will only support `string`. If the type of token is `string`, it will be parsed and return a date, otherwise it returns `undefined`, and it will be treated as an error.
-	`parseValue` will be called when the input is supplied as a variable, in the form of a `JavaScript` object.

#### Create API Integration

-	Removed settings the status to `New` and set the due tate to 10 days from the current date in the `handleSubmit()` method in the `IssueAdd` component in App.jsx.
-	Created a template string to generate a query within `createIssue()` method in `IssueList` component. For the date field `due`, it must convert to a string as per ISO format.
-	Use the query to execute `fetch` asynchronously.
-	Call `loadData()`
-	Now when an issue is added, it stays after refreshing the browser because it has now been saved on the server.

##### Query Variables

For mutation calls, arguments had been specified inside a query string. This did not allow special characters such as quotes or curly braces. `GraphQL` has a first-class way to factor dynamic values out of the query and pass then as a separate dictionary. 
-	These values are `variables`, where the operation must be named first, right after the `query` or `mutation` field specification.
-	The input value must be replaced with a variable name. Variable names start with the `$` character.
-	Finally, accept the variable, declaring it as an argument to the operation name.
-	To supply the value of the variable, it needs to be sent across in a JSON object that is separate from the query string. The value specifies which operation needs to be executed.

#### Input Validations

Common validations:
-	Where the set of allowed values is restricted, one that can be shown in a dropdown. `status` field of the Issue Tracker is one example.
-	GraphQL gives an automatic way of doing this using `enums`. These are defined in the schema. Are dealt as strings. Allows to give default values in case the input has not given a value for an argument, using an `=` symbol.
-	For pragmatic validations, they must occur before saving a new issue in `server.js`. For this a function `validateIssue()` was implemented. First an array of error messages was defined.
-	Added a minimum length for the issue’s title. If that check fails, the message will be pushed into the `errors` array.
-	Added a conditional mandatory validation, that checks for the owner being required when the status is set to `Assigned`.
-	Catched invalid date strings while parsing the value on the way in. Can be done using `isNaN(date)` after constructing the date.
-	At the end, if the errors array is not empty, an error will be thrown. Using `UserInputError` class to generate user errors. Implemented in `parseValue` and `parseLiteral`.
-	Apollo Server has a configuration option called `formatError` that can be used to make changes to the way the error is sent back to the caller.

##### Displaying Errors

Created a common utility function that handles all API calls and report errors. Replaced the `fetch` calls within the actual handlers with this common function and display to the user any errors as part of the API call. `graphQLfetch`:
-	`async` function since we’ll be calling `fetch()` using `await`. This function takes the query and the variables as tro arguments.
-	All transport errors will be thrown from within the call to `fetch()`, so `fetch()` was wrapped and with the subsequent retrieval of the body and parsed within a `try-catch` block.
-	Display the errors using `alert`.
-	The `fetch` operation is the same as originally implemented in `issueAdd`. Once the fetch is completed, it looks for errors as part of `result.errors`.
-	The error code can be found within `error.extensions.code`, to deal with each type of error, differently. `Bad_User_Input` is joint with all the validation errors together and showed to the user.
-	Other errors are displayed as they are received.
-	At the end of the function, return `result.data`. The caller can check if any data was returned.

##### Issue and Errors
-	Needed to specify “…apollo-server-express@2.3” version (2.3) while installing graphql and apollo server on page 92.
-	Semicolon missing on the first `if` statement of the `issueValidate(issue)` function on page 125.


## Chapter 4

### Summary

This chapter served to learn about `state`, which is a React's data structure to make components that respond to user input and other events.
Emphasis was put on how to use and manipulate a `state` to change how components are displayed to the user. Furthermore, the chapter served to learn
how to communicate components that follow a hierarchy, as in the case of IssueList and the children components IssueFilter, IssueTable, IssueAdd. Also,
the concept of asynchronous state initialization was introduced, using `setTimeOut` function.

In terms of progress of the book project. During this chapter progress was made by creating a button in place of the placeholder text in the IssueAdd component. This button allows the user to add a new `issue` to the list, specifying the Owner and the Title for the new issue.

![Ch4 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter4.png)

### Notes:

#### Initial State

The `state` of a component is captured in a variable called `this.state` inside the component's class. The `state` should be
an object consisting of one or more key-value pairs, where each key is a state variable name and the value is the current value
of that variable. Setting initial `state` needs to be done in the constructor of the component.

#### Async State Initialization

It is unlikely that regular SPA components will have the initial state available to them statically. These will be fetched from the server.
After the state has been assigned in the constructor, it can be modified using `this.setState()` method. This takes in one argument, which
is an object containing all the state variables and their values. 

`setTimeout()` is used to make an asynchronous call to get the initial state variable. React provides `lifecycle methods` to cater to this and
other situatios when something needs to be done depending on the state or change in the status of the component. 

 - `componentDidMount()` is called as soon as the component's representation has been converted and inserted into the DOM.
 - `componentDidUpdate()` is invoked immediately after an update occurs, but it is not called for the initial render. It can also check the differences between the previous props and state and current ones.
 - `componentWillUnmount()` this method is useful for cleanup such as cancelling timers and pending network requests.
 - `shouldComponentUpdate()` this method can be used to optimize and prevent a re-render in case there is a change in the props or state that really doesn't affect the output or the view.

#### Updating State

The `state` variable cannot be set directly, nor it can be  mutated directly, it needs a copy of the `state` variable. The `slice()` method is used to create a copy of an array. There are `immutability helpers` libraries such as `immutable.js`, which can be used to construct the new `state` object. This library creates a copy optimally.

#### Lifting State Up

The creation of a new `issue` should be responsibility of the `IssueAdd` component. In order for sibling components to communicates, they need to have access to a common parent component. This can be achieved using `props`. The context of anonymous functions `this`, can be bind to a specific component ussing the `bind()` function in the constructor of the parent component.

#### Event Handling

Adding a button to create a new `issue`, the `handleSubmit()` method was created to receive the `submit` event from the form when the button is clicked by the user. Within this method a handle to the form can be achieved by using `document.forms.IssueAdd`, having access to the text input fields. Also the `preventDefault()` function is called to prevent the form from being submitted when the button is clicked. 

#### Stateless Components

`IssueRow` and `IssueTable` are stateless components since they don't have a `state` variable and functions to modify the `state`. Therefore, they were changed to pure functions components, functions with no other statement than just the return statement.

#### Designing Components

|  Attribute  | State                                | Props                                                       |
| ----------- | ------------------------------------ | ----------------------------------------------------------- |
| Mutability  | Can be changed using this.setState() | Cannot be changed                                           |
| Ownership   | Belongs to the component             | Belongs to an ancestor, the component gets a read-only copy |
| Information | Model information                    | Model information                                           |
| Affects     | Rendering of the component           | Rendering of the component                                  |

## Chapter 3

### Summary

This chapter served to learn about how to use different data types, how to create React classes and instantiate components. From base components it was shown
how to compose bigger components. Emphasis was put on how to pass data between components using properties and children components. By the end it was shown
how to dynamically create components from a data collection of objects.

In terms of progress for the book project. During this chapter progress was made by creating the layout of the main page of the Issue Tracker as a list of Issues.
It was defined that the requirements for the application include:

- User:
  - View of list of issues and a filter functionality.
  - Add new issues.
  - Edit and update an issue.
  - Delete an issue.

- Issue:
  - Title, summarizing the issue (freeform text).
  - Owner, to whom it was assigned (freeform text).
  - States, a list of possible values.
  - Creation Date, a Date component automatically assigned.
  - Effort required, number of days.
  - Estimated completion date or due date, Date component.

![Ch3 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter3.png)

### Notes:

#### React classes

These classes are used to create React component. Always created by extending React.Component.
It needs  a `render()` method, so the component can be displayed in the User Interface. This method
can return a HTML element or other React component. It only returns one element.

#### Composing Elements

Component composition is a powerful feature of React. It allows the User Interface to be split into smaller independent pieces,
each can be coded and reasoned separately. This granularity feature allows reuse of elements. 

A component takes `properties` as inputs from callers. React favors composition instead of inheritance. It is recommended to keep
coupling between components to a minimum.

#### Passing data using Properties

Passing data from a parent company to a child component allows the child component to render differently on different instances.
The easiest way to pass data to child components is using an attribute when instantiating a component. Within the `render()` method
of the child, the attribute's value can be accessed via an object variable called `props`, using the `this` accessor. Many data types
and JavaScript objects can be passed along, using curly braces `{}`, because the curly braces switches into the JavaScript world.

It is suggested to pass data as properties when it is simple data types.

#### Passing data using Children

Another way to pass data to components, using the contents of the HTML-like node of the component. In the child this can be accessed using
`this.props.children`. React components can be nested, so React lets the parent access the children and determine where it needs to be deployed.

It is suggested to pass data using children when the data are nested components.

#### Dynamic composition

This section explained how to generate a set of components from an array of issues. A simple JavaScript array was declared to store a list of issues. 
Afterwards, the `map()` method came in handy, to map an issue object from the array to an IssueRow instance. Also, instead of passing each field as a property, 
the issue object itself is passed. A for loop couldn't be used within JSX, because JSX is no a templating language.

#### Errrors

* Listing 3-6 is missing a `'` that should be surrounding `New`.

## Chapter 2

### Summary

This chapter served as an introduction to React applications. It started by building a basic serverless
Hello World! application, using HTML and a React element to render the application in a browser.
Afterwards it introduced Node.js and Express to serve that application from a web server. Also, the chapter
explained the purpose of Babel, which is a compiler that can be used in the browser to transform JSX into JavaScript.

![Ch2 Image](https://github.com/pedrocantu16/IssueTracker/blob/master/readme-images/chapter2.png)

### Notes:

* React: is a library, available as a JavaScript file. It can be included in a HTML file using `<script>`.
         It has two main components:
  - React Core: which deals with react components and state manipulation.
  - React DOM: which deals with converting React components to a Document Object Model that the browser can understand. It defines the logical structure
        for HTML and XML documents.

* unpkg: it is a content delivery network which makes JavaScript libraries open source.

* JSX: React's markup language. JavaScript XML. can be used to construct an element or an element hierarchy and make it look like HTML.

* Babel: web browsers don't understand JSX. It has to be transformed into JavaScript.
This is achieved by Babel, which provides a standalone compiler that can be used in the browser.
it is available as a JavaScript file at unpkg.
  - Babel looks for the attribute `type='text\babel` in all scripts to know which scripts have to be transformed.
        Ideally, compilation should be made at build time, rather than at running time.

* nvm: Node Version Manager, it makes installation and switching among multiple versions of Node.js easier. It also installs npm, the package manager.

* npm:  the location of the installed packages under the project directory has some effects:
  - All installations are local to the project. With the advantage that different project can use a different version.
  - A package dependencies are isolated within the package. Two packages can depend on differente versions.
  - Administrator rights are not required to install a package.

* Express: Is the way to run a HTTP server in the Node.js environment. To use it it should be imported with `require('express')`.
           Express does the work by functions called middleware, which take in a HTTP request and a response object, plus the next middleware function in the chain.
  - express.static('public'), responds to a request by matching the URL with a file under the parameter directory. It returns the contents of the file as response,
           otherwise it chains to the next middleware function.
  - use(), function to mount the static middleware in the application.
  - listen(), function that starts the server and waits until a request is received. It takes a port number and a callback function as parameters.

* Separate Script File:
  - The first step is to separate out the JSX and JavaScript from the HTML file. To keep the HTML as pure HTML and all the script that needs to be compiled in a separate file.
  - Create `src` directory, to keep all JSX files.
  - Install some Babel tools: preset-react.

* Older Browser support:
  - preset-env, this preset let us specify that the target browsers that we need to support and automatically applies all the transformations and plug-ins required for such browsers.
  - Babel uses a `.babelrc` file in the `src` folder. This file is a JSON file, which contains presets and plugins. It includes an array of browsers and versions.
  - polyfills, these are function implementations to supplement the missing implementation in older browsers. This need to be included in the HTML file to make the functions available.

* Automate: npm has the ability to define other custom commands. These custom commands can be specified in the scripts section of package.json. Can be run using `npm run <script>`.
  - `npm run compile`, will compile all the JSX files.
  - `npm run watch`, will instruct babel to watch for changes in source files, and print a line to the console whenever a change causes recompilation.
  - `nodemon`, this command restarts Node.js whenever there is a change in a set of server files. It should be installed and the used with `npm start`
  - `npm start` , will start the server of the application.
