## Interactive Geospatial Visualization of Cricket Players in India

### Steps to view the map on local web browser

#### 1) Install 'http-server' to be able to serve content out of the local file system. ([Node](https://nodejs.org/en/) is required to be installed first)

```npm install -g http-server```

#### 2) In the terminal, start the server to preview code in a web browser:

```http-server -a localhost -p 3000```

#### 3a) To view the map with original suggested changes: [localhost:3000/](http://localhost:3000/index.html)

#### 3b) To view the map with markers sized by number of ODIs played: [localhost:3000/index1.html](http://localhost:3000/index1.html)

#### 3b) To test how the map looks like inside an iframe: [localhost:3000/test.html](http://localhost:3000/test.html)

### Steps to embed the map inside a github.io page

#### 1) Copy and paste the india_players folder to the github repo at the root level. (ie. 'india_players' folder will be at the same folder structure level as '_posts').

#### 2) Create new .md page inside the _posts folder.

#### 3) Since markdown supports inline html, insert `<iframe src='../index.html' width='1000' height='750' frameborder='0'></iframe>` in the location where you want to map to be displayed. (Ensure file path is correct)