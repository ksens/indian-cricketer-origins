# Indian cricketer origins

Dataset and analysis of Indian cricketers, their birthplaces, and the population characteristics of those birthplaces. 

## Interactive Geospatial Visualization of Cricket Players in India

### Steps to view the map on local web browser

1. Install 'http-server' to be able to serve content out of the local file system. ([Node](https://nodejs.org/en/) is required to be installed first)

```
npm install -g http-server
```

2. In the terminal, start the server to preview code in a web browser:

```
http-server -a localhost -p 3000
```

3. To view the map 

   - view the map with markers sized by number of ODIs played: [localhost:3000/viz/](http://localhost:3000/viz/index.html)

   - to zoom in on delhi: [localhost:3000/viz/delhi](http://localhost:3000/viz/delhi.html)

   - to zoom in on chennai and bangalore: [localhost:3000/viz/chennai](http://localhost:3000/viz/chennai.html)

   - to test how the map looks like inside an iframe, see this [viz](http://kritisen.com/2020-08-06-map-of-indian-cricketers/) and [code](https://github.com/ksens/ksens.github.io/blob/master/_posts/2020-08-06-map-of-indian-cricketers.md)

### Steps to embed the map inside a github.io page

1. Copy and paste the india_players folder to the github repo at the root level. (ie. 'india_players' folder will be at the same folder structure level as '_posts').
2. Create new .md page inside the _posts folder.
3. Since markdown supports inline html, insert `<iframe src='../index.html' width='1000' height='750' frameborder='0'></iframe>` in the location where you want to map to be displayed. (Ensure file path is correct)
