# [ PRIORITY: 0 ] merge.c & branch.c
O: finalising

# [ PRIORITY: 1 ] fetch.c
(B: since i know what needs to be done, im writing them here) <br>
    - Fetched files should go through 2 checks: <br>
      ~ If file doesn't exist: put it and remove from list <br>
      ~ If file exists: ignore and keep in list <br>
        + If file isn't changed: remove from list <br>
        + If file is changed: ignore and keep in list   (for merging purposes)

# [ PRIORITY: 2 ] add.c
Needs to check .gitignore (later .chzignore) before adding files. <br>
(B: i wasn't able to do it)

# [ PRIORITY: 3 ] status.c
Needs to be worked on. <br>
(B: idk if we should work on status before checkout)

# [ PRIORITY: 4 ] commit.c
Needs to be finished. <br>
(F: bade nikak)
(B: cannot unhash hashed values btw!)

# [ PRIORITY: 5 ] pull.c
Needs to be worked on, low priority

# [ PRIORITY: 7 ] tag.c
Very low priority

# [ PRIORITY: 8 ] describe.c
Lowest priority.

# [ PRIORITY: ? ] init.c
Create a unique hidden flag thats used when using init remotely <br>
Said flag add a URL to the repo and an origin in .chz