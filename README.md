# Pathfinding Visualiser
>>>>>>> 

![GPS-animation](https://github.com/user-attachments/assets/80a25634-03fe-47ab-a34a-7d1fac545e33)

A real-time shortest route visualiser on a map. You can select two markers and the algorithm will calculate the shortest route allowing you to see all paths being considered.

Note: 
- This is still in the works.
- Routes include all footpaths mainly, meaning some roads are one-way so not suitable for vehicle use. I included this so that we can visualise more paths.
- Selection radius of the two markers are limited as all nodes would need to be fetched and analysed.

Plan to add more algorithms / cities / visual effects.

# Algorithm

Uses A* search algorithm which is an optimised Dijkstra's. It uses the Harsevine formula as its heuristic to get shortest path by considering the weights of edges.

# Cities supported
Currently it will only extract nodes from Oxford, United Kingdom.
