PathRings--A web-version of biological data visualization framework
============


**Website** : [http://raven.anr.udel.edu/~sunliang/PathRings/](http://raven.anr.udel.edu/~sunliang/PathRings/)

**Operation** : `Right Click`   ===>  `Select Menu`

Introduction
============
   PathRings Project from  [https://sites.google.com/a/umbc.edu/pathbubbles/home](https://sites.google.com/a/umbc.edu/pathbubbles/home)
   You can get detailed informaiton from [https://sites.google.com/a/umbc.edu/pathbubbles/pathbubbles-1-0](https://sites.google.com/a/umbc.edu/pathbubbles/pathbubbles-1-0)  
   This project is trying to design a web version of Pathbubbles to assist biologist in interactive exploring and analyzing dataset.
Framework
============

 ### Goal for framework

 (1) Extendable

 (2) Readble

 (3) Include basic PathBubble characteristic: virtual space, navagation bar, group, multi-view

 ### Hierarchical scene graph object

 (1) scene==> Bubble ==> object inside bubble.

  all the elements in scene graph is inherent from Object2D


 (2) render ==> to manage the render event and mouse operation (this needs to reconsider)

  all the basic element is encapsulated into the basic class.

