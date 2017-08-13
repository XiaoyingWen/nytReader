# nytReader
A New York Times reader lists the health news for the users to post their comments.  The application uses packages: express, express-handlebars, mongoose, body-parser, cheerio, request and moment.

Note: cheerio is used in the application for data scraping and it is not efficient for sites with contents loaded dynamically. As the targeted NY Times news are dynamical contents and the scraping starts before the full contents been loaded so the application does not guarantee to have all the news scraped.

TO run with debug mode with window: set DEBUG=nytreader:* & npm start