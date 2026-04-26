#include "../chizel.h"

#ifndef TAG_H
#define TAG_H

    void tag(int argc, char* argv[]);

    int setTag(char *tagName);
    char *getTag();
    void readTag(char* tagName);
    bool checkTag(char* tagName);

#endif