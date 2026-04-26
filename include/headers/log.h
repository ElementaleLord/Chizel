#include "../chizel.h"

#ifndef LOG_H
#define LOG_H

    bool logs(int argc, char* argv[]);

    #define LOG_NORMAL 0
    #define LOG_REVERSE 1
    #define LOG_SHORT 2
    #define LOG_NUMBERED 3

    int addLogEntry(char* parentHash, char* commitHash);
    char *newlineFake(char *msg);
    char *newlineRestoreShort(char *message);
    char *newlineRestore(char *message);

#endif