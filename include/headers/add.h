#include "../chizel.h"

#ifndef ADD_H
#define ADD_H

    void add(int argc, char* argv[]);

    int checkStagingArea();
    FILE* getStagingArea();
    Lines readStagingArea();
    bool clearStagingArea();

#endif