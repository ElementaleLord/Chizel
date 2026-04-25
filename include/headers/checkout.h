#include "../chizel.h"
#include "../chzdb.h"

#ifndef CHECKOUT_H
#define CHECKOUT_H

    void checkout(int argc, char *argv[]);

    #define GET_IGNORED 0
    #define NO_IGNORED 1

    bool alterHEAD(char *branchName);

#endif